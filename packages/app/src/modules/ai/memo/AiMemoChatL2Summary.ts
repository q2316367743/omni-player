import {
  type MemoChatSummary,
  type MemoChatSummaryLayerOperation,
  type MemoFriendStaticView,
  memoFriendToPrompt
} from "@/entity/memo";
import {useMemoFriendStore, useSettingStore} from "@/store";
import type OpenAI from "openai";
import {logDebug, logError} from "@/lib/log";
import {
  getMemoChatSummaryLast,
  listMemoChatSummaryL1UnSummary, saveMemoChatSummary,
} from "@/services/memo/chat";
import {handleStreamingToolCalls} from "@/modules/ai/utils/ToolCallHandler.ts";
import {formatDate} from "@/util/lang/DateUtil.ts";
import {useSql} from "@/lib/sql.ts";
import {type AiMcpWrapper, SelfMcp} from "@/modules/ai/mcp";

export interface AiMemoChatL2SummaryProp {
  friend: MemoFriendStaticView;
}

export interface L2SummaryResult {
  title: string;
  summary: string;
  ai_journal: string;
  operations: Array<MemoChatSummaryLayerOperation>;
  start_time: number;
  end_time: number;
  l1Summaries: Array<MemoChatSummary>;
}

export class ChatSummaryMcp implements AiMcpWrapper {
  private readonly friend: MemoFriendStaticView;
  private readonly firstL1: MemoChatSummary;
  private readonly lastL1: MemoChatSummary;


  constructor(friend: MemoFriendStaticView, firstL1: MemoChatSummary, lastL1: MemoChatSummary) {
    this.friend = friend;
    this.firstL1 = firstL1;
    this.lastL1 = lastL1;
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
            title: {type: "string", description: "聊天记录的标题，10字以内诗意标题"},
            summary: {type: "string", description: "聊天记录的详细总结，150字内，含关键洞察"},
            role_notes: {type: "string", description: "AI小记，第一人称日记，表达共情或反思"}
          },
          required: ["title", "summary", "role_notes"]
        }
      }
    }]
  }

  check(functionName: string): boolean {
    return functionName === 'create_chat_summary';
  }

  async execute(functionName: string, args: any) {

    // 执行创建程序
    const l2Record = await saveMemoChatSummary({
      friend_id: this.friend.id,
      level: 2,
      start_time: this.firstL1.start_time,
      end_time: this.lastL1.end_time,
      content: args.summary,
      archived_to_l2_id: '',
      ai_journal: args.role_notes,
      layer_operations: [],
      trigger_reason: 'L2定期总结'
    });

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

}

/**
 * 长对话总结
 * > 长期线性变化的自然语言记录
 * @return 总结信息
 */
export async function aiMemoChatL2Summary(prop: AiMemoChatL2SummaryProp): Promise<L2SummaryResult> {
  try {
    const {friend} = prop;
    const {createAiClient, disableThinkParam} = useSettingStore();


    const l1Summaries = await listMemoChatSummaryL1UnSummary(friend.id);
    if (l1Summaries.length === 0) return Promise.reject(new Error('没有需要总结的 L1 数据'))

    const now = Date.now();

    const f = await useMemoFriendStore().fetchFriend(friend.id);
    const prompt = memoFriendToPrompt(f!);
    const l2Summary = await getMemoChatSummaryLast(friend.id, 2);
    const start_time = l1Summaries[0]!.start_time;
    const end_time = l1Summaries[l1Summaries.length - 1]!.end_time;


    if (l1Summaries.length === 0) {
      logDebug('[L2Summary] 没有需要总结的 L1 数据');
      return {
        title: '',
        summary: '',
        ai_journal: '',
        operations: [],
        start_time,
        end_time,
        l1Summaries
      };
    }

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
- mood：根据用户长期的表现和你的感受选择心情，必须是 happy、concerned、playful、melancholy、excited 中的一个\n  - happy：开心、愉快、满足
  - concerned：关心、担忧、牵挂
  - playful：调皮、轻松、幽默
  - melancholy：忧郁、惆怅、感伤
  - excited：兴奋、激动、期待
- last_interaction：使用 ${now}

【任务3：更新用户四层人格数据】
根据用户长期对话中反映的性格特质变化，调用相应的工具：
- self_add_persona：添加新的人格层记录
  - trait_name：选择最相关的特质
    - openness：开放性 - 对新事物的接受度、创造力、想象力
    - conscientiousness：尽责性 - 计划性、自律性、责任感
    - extraversion：外向性 - 社交活跃度、表达欲、能量水平
    - agreeableness：友好的性 - 合作性、同理心、包容度
    - neuroticism：神经过敏性 - 情绪稳定性、焦虑程度
    - resilience：弹性 - 面对困难时的恢复能力
    - curiosity：好奇心 - 探索欲、求知欲
    - optimism：乐观 - 积极心态、希望感
  - delta：根据用户长期表现判断该特质的变化量（0-99）
  - baseline_trait：判断用户该特质的基线水平（0-100）
  - confidence：你的判断置信度（0-99）
  - evidence_snippet：引用相关时间段总结中的原文作为证据
  - expire_at：设置过期时间，建议使用 ${now + 90 * 24 * 60 * 60 * 1000}（90天后）

- self_update_persona：更新现有的人格层记录（如果发现之前的判断需要调整）
  - id：要更新的人格记录ID
  - delta：新的变化量
  - baseline_trait：新的基线水平
  - confidence：新的置信度
  - expire_at：新的过期时间

【重要规则】
1. 必须按顺序调用工具：先 create_chat_summary，再 update_friend_dynamic，最后根据情况调用 add_persona 或 update_persona
2. create_chat_summary 和 update_friend_dynamic 是必须调用的
3. add_persona/update_persona 只有在用户长期对话中确实反映了人格特质变化时才调用
4. 可以调用多次 add_persona/update_persona 来更新不同的人格特质
5. 所有参数必须符合工具定义的要求
6. L2 总结要体现长期视角，关注变化趋势和成长轨迹，符合你的人设和语言风格
7. 注意每个时间段的时间信息，理解用户在不同阶段的状态变化`
      }
    ];

    logDebug('[L2Summary] 开始接收 AI 流式响应');

    const firstL1 = l1Summaries[0]!;
    const lastL1 = l1Summaries[l1Summaries.length - 1]!;
    const handlers: Array<AiMcpWrapper> = [
      new SelfMcp(friend.id),
      new ChatSummaryMcp(friend, firstL1, lastL1)
    ]

    const response = await client.chat.completions.create({
      model: friend.model,
      messages: messagesForAI,
      tools: handlers.flatMap(e => e.getSchema()),
      tool_choice: "required",
      stream: true,
      ...disableThinkParam(friend.model)
    });

    if (!response) {
      return Promise.reject(new Error('AI response is null'));
    }

    let l2Result: L2SummaryResult | null = null;
    const layerOperations: Array<MemoChatSummaryLayerOperation> = [];


    await handleStreamingToolCalls(response, handlers);


    await updateL1Summaries(l1Summaries.map(s => s.id), l2Record.id);

    if (!l2Result) {
      return Promise.reject(new Error('Failed to create L2 summary'));
    }

    logDebug('[L2Summary] L2 总结完成');
    return l2Result;

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