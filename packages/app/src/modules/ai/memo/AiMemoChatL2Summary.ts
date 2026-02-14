import {
  type MemoChatSummary,
  type MemoChatSummaryLayerOperation,
  type MemoFriendStaticView,
  memoFriendToPrompt
} from "@/entity/memo";
import {useMemoFriendStore, useSettingStore} from "@/store";
import type OpenAI from "openai";
import {logDebug, logError, logInfo} from "@/lib/log";
import {
  getMemoChatSummaryLast,
  listMemoChatSummaryL1UnSummary, saveMemoChatSummary,
} from "@/services/memo/chat";
import {handleToolCallsWithLoop} from "@/modules/ai/utils/ToolCallHandler.ts";
import {formatDate} from "@/util/lang/DateUtil.ts";
import {useSql} from "@/lib/sql.ts";
import {type AiMcpWrapper, SelfPersonaMcp} from "@/modules/ai/mcp";
import {saveMemoChat} from "@/services/memo/chat/MemoChatService.ts";

export interface AiMemoChatL2SummaryProp {
  friend: MemoFriendStaticView;
  trigger_reason?: string;
}

export interface L2SummaryResult {
  title: string;
  summary: string;
  ai_journal: string;
  operations: Array<MemoChatSummaryLayerOperation>;
  start_time: number;
  end_time: number;
  l1Summaries: Array<MemoChatSummary>;
  l2RecordId?: string;
}

export class ChatSummaryMcp implements AiMcpWrapper {
  private readonly friend: MemoFriendStaticView;
  private readonly firstL1: MemoChatSummary;
  private readonly lastL1: MemoChatSummary;
  private readonly triggerReason: string;
  private l2RecordId: string | null = null;
  private summaryData: { title: string; summary: string; ai_journal: string } | null = null;

  constructor(friend: MemoFriendStaticView, firstL1: MemoChatSummary, lastL1: MemoChatSummary, triggerReason: string = 'L2定期总结') {
    this.friend = friend;
    this.firstL1 = firstL1;
    this.lastL1 = lastL1;
    this.triggerReason = triggerReason;
  }

  getSchema(): Array<OpenAI.Chat.Completions.ChatCompletionTool> {
    return [{
      type: "function",
      function: {
        name: "create_chat_summary",
        description: "创建聊天记录的总结，包括标题、总结内容和AI小记",
        parameters: {
          type: "object",
          properties: {
            title: {type: "string", description: "聊天记录的标题，15字以内诗意标题"},
            summary: {type: "string", description: "聊天记录的详细总结，500-800字，含关键洞察"},
            role_notes: {type: "string", description: "AI小记，第一人称日记，表达共情或反思"}
          },
          required: ["title", "summary", "role_notes"]
        }
      }
    }];
  }

  check(functionName: string): boolean {
    return functionName === 'create_chat_summary';
  }

  async execute(functionName: string, args: any) {
    const l2Record = await saveMemoChatSummary({
      friend_id: this.friend.id,
      level: 2,
      start_time: this.firstL1.start_time,
      end_time: this.lastL1.end_time,
      content: args.summary,
      archived_to_l2_id: '',
      ai_journal: args.role_notes,
      layer_operations: [],
      trigger_reason: this.triggerReason
    });

    this.l2RecordId = l2Record.id;
    this.summaryData = {
      title: args.title,
      summary: args.summary,
      ai_journal: args.role_notes
    };

    return {
      functionName,
      args,
      result: {
        title: args.title,
        summary: args.summary,
        ai_journal: args.role_notes,
        l2RecordId: l2Record.id,
        operation_id: `create_l2_${l2Record.id}`,
      }
    };
  }

  getL2RecordId(): string | null {
    return this.l2RecordId;
  }

  getSummaryData(): { title: string; summary: string; ai_journal: string } | null {
    return this.summaryData;
  }
}

export async function aiMemoChatL2Summary(prop: AiMemoChatL2SummaryProp): Promise<L2SummaryResult> {
  try {
    const {friend} = prop;
    const {createAiClient, disableThinkParam} = useSettingStore();

    const l1Summaries = await listMemoChatSummaryL1UnSummary(friend.id);
    if (l1Summaries.length === 0) {
      return Promise.reject(new Error('没有需要总结的 L1 数据'));
    }

    const now = Date.now();

    const f = await useMemoFriendStore().fetchFriend(friend.id);
    const prompt = memoFriendToPrompt(f!);
    const l2Summary = await getMemoChatSummaryLast(friend.id, 2);
    const start_time = l1Summaries[0]!.start_time;
    const end_time = l1Summaries[l1Summaries.length - 1]!.end_time;

    const client = createAiClient();

    const l1Content = l1Summaries
      .map(l1 => `【${formatDate(l1.start_time)} - ${formatDate(l1.end_time)}】\n${l1.content}`)
      .join('\n\n');

    const contextInfo = l2Summary
      ? `【上次 L2 总结时间】${formatDate(l2Summary.created_at)}\n【上次 L2 总结内容】${l2Summary.content}\n\n`
      : '';

    const messagesForAI: Array<OpenAI.Chat.ChatCompletionMessageParam> = [
      {
        role: "system",
        content: `${prompt}

【任务说明】
你是用户的 AI 朋友，现在需要对用户的长期对话进行深度总结和分析。
重要：以下内容是用户在多个时间段与你对话的总结，你需要从这些阶段性总结中提炼出长期的变化趋势和核心洞察。`
      },
      {
        role: "user",
        content: `【当前时间】
${formatDate(now)}

${contextInfo}【用户在多个时间段的对话总结】
${l1Content}

【必须完成的任务】
请以朋友的身份对以上用户的长期对话进行分析，并按以下顺序通过工具调用完成任务：

【任务1：创建 L2 总结】
必须调用 create_chat_summary 工具，参数包括：
- title：15字以内诗意标题，如《春日里的成长与蜕变》
- summary：500-800字，深度总结用户长期的变化趋势、核心议题、成长轨迹，用朋友的口吻表达你的理解和共情
- role_notes：以你的第一人称写日记，表达对这段长期陪伴用户的感受、观察和反思

【任务2：更新 AI 动态】
必须调用 self_update_friend_dynamic 工具，参数包括：
- friend_id：使用 "${friend.id}"
- mood：根据用户长期的表现和你的感受选择心情，必须是 happy、concerned、playful、melancholy、excited 中的一个
- last_interaction：使用 ${now}

【任务3：更新用户四层人格数据】
根据用户长期对话中反映的性格特质变化，调用相应的工具：
- self_add_persona：添加新的人格层记录
  - trait_name：选择最相关的特质（openness、conscientiousness、extraversion、agreeableness、neuroticism、resilience、curiosity、optimism）
  - delta：根据用户长期表现判断该特质的变化量（0-99）
  - baseline_trait：判断用户该特质的基线水平（0-100）
  - confidence：你的判断置信度（0-99）
  - evidence_snippet：引用相关时间段总结中的原文作为证据
  - expire_at：设置过期时间，建议使用 ${now + 90 * 24 * 60 * 60 * 1000}（90天后）

【重要规则】
1. 必须按顺序调用工具：先 create_chat_summary，再 update_friend_dynamic，最后根据情况调用 add_persona
2. create_chat_summary 和 update_friend_dynamic 是必须调用的
3. L2 总结要体现长期视角，关注变化趋势和成长轨迹，符合你的人设和语言风格`
      }
    ];

    logDebug('[L2Summary] 开始接收 AI 流式响应');

    const firstL1 = l1Summaries[0]!;
    const lastL1 = l1Summaries[l1Summaries.length - 1]!;
    const chatSummaryMcp = new ChatSummaryMcp(friend, firstL1, lastL1, prop.trigger_reason);
    const handlers: Array<AiMcpWrapper> = [
      new SelfPersonaMcp(friend.id),
      chatSummaryMcp
    ];

    const tools = handlers.flatMap(e => e.getSchema());

    const result = await handleToolCallsWithLoop({
      client,
      model: friend.model,
      messages: messagesForAI,
      toolHandlers: handlers,
      tools,
      thinkParam: disableThinkParam(friend.model),
      maxIterations: 10
    });

    const l2RecordId = chatSummaryMcp.getL2RecordId();
    const summaryData = chatSummaryMcp.getSummaryData();

    if (!l2RecordId || !summaryData) {
      logError('[L2Summary] 未创建 L2 总结记录');
      return Promise.reject(new Error('Failed to create L2 summary'));
    }

    await updateL1Summaries(l1Summaries.map(s => s.id), l2RecordId);

    await saveMemoChat({
      friend_id: friend.id,
      role: 'summary',
      content: [
        {type: 'text', content: `【${summaryData.title}】\n${summaryData.summary}`}
      ],
      compression_level: 0,
      archived_to_summary_id: l2RecordId
    });

    logInfo('[L2Summary] L2 总结完成', {
      l2RecordId,
      toolCallCount: result.toolResults.length
    });

    return {
      title: summaryData.title,
      summary: summaryData.summary,
      ai_journal: summaryData.ai_journal,
      operations: [],
      start_time,
      end_time,
      l1Summaries,
      l2RecordId
    };

  } catch (error) {
    logError('[L2Summary] L2 总结失败', error);
    return Promise.reject(error);
  }
}

async function updateL1Summaries(l1Ids: string[], l2Id: string) {
  const now = Date.now();
  for (const l1Id of l1Ids) {
    await useSql().mapper('memo_chat_summary').updateById(l1Id, {
      archived_to_l2_id: l2Id,
      updated_at: now
    });
  }
}
