import {type MemoFriend, memoFriendToPrompt, type MemoMessage} from "@/entity/memo";
import {useSettingStore} from "@/store/GlobalSettingStore.ts";
import {CHAT_SUMMARY_TOOL_SCHEMA} from "@/modules/ai/schema/ChatSummarySchema.ts";
import {createMemoChatSummary} from "@/services/memo/MemoChatSummaryService.ts";
import {updateMemoFriendDynamic} from "@/services/memo/MemoFriendService.ts";
import {addMemoLayerPersona, updateMemoLayerPersona} from "@/services/memo";
import {handleStreamingToolCalls} from "@/modules/ai/utils/ToolCallHandler.ts";
import type OpenAI from "openai";
import {formatDate} from "@/util/lang/FormatUtil.ts";

interface AiMemoChatSummaryProp {
  // 谁
  friend: MemoFriend;
  // 全部的聊天信息
  messages: Array<MemoMessage>;
}

interface ChatSummaryResult {
  title: string;
  summary: string;
  key_insights: any;
  ai_journal: string;
}

export async function aiMemoChatSummary(prop: AiMemoChatSummaryProp): Promise<ChatSummaryResult> {
  const {friend, messages} = prop;
  // 获取 AI 的提示词
  const prompt = memoFriendToPrompt(friend);
  // 获取 AI 客户端
  const client = useSettingStore().createAiClient();

  const now = Date.now();

  // 构建聊天记录内容
  const chatContent = messages
    // 过滤用户消息
    .filter(e => e.role === 'user')
    .map(msg => `[${formatDate(msg.created_at)}] ${msg.content}`)
    .join('\n');

  const messagesForAI: Array<OpenAI.Chat.ChatCompletionMessageParam> = [
    {
      role: "system",
      content: `${prompt}\n\n【任务说明】\n你是用户的 AI 朋友，现在需要对你们之间的聊天记录进行总结和分析。请以朋友的身份，用你的人设和语言风格来完成以下任务：`
    },
    {
      role: "user",
      content: `【当前时间】
${formatDate(now)}

【聊天记录】
${chatContent}

【必须完成的任务】
请以朋友的身份对以上聊天记录进行分析，并按以下顺序通过工具调用完成任务：

【任务1：创建聊天总结】
必须调用 create_chat_summary 工具，参数包括：
- title：10字以内诗意标题，如《雨夜谈孤独》
- summary：150字内，含关键洞察，用朋友的口吻总结，含情绪变化、核心议题
- role_notes：以你的第一人称写日记，表达对这次对话的感受、共情或反思

【任务2：更新AI动态】
必须调用 update_friend_dynamic 工具，参数包括：
- friend_id：使用 "${friend.id}"
- mood：根据聊天内容和你的感受选择心情，必须是 happy、concerned、playful、melancholy、excited 中的一个\n  - happy：开心、愉快、满足
  - concerned：关心、担忧、牵挂
  - playful：调皮、轻松、幽默
  - melancholy：忧郁、惆怅、感伤
  - excited：兴奋、激动、期待
- last_interaction：使用 ${now}

【任务3：更新用户人格】
如果聊天内容中反映了用户的性格特质或行为模式，必须调用 add_persona 工具：
- trait_name：选择最相关的特质
  - openness：开放性 - 对新事物的接受度、创造力、想象力
  - conscientiousness：尽责性 - 计划性、自律性、责任感
  - extraversion：外向性 - 社交活跃度、表达欲、能量水平
  - agreeableness：友好的性 - 合作性、同理心、包容度
  - neuroticism：神经过敏性 - 情绪稳定性、焦虑程度
  - resilience：弹性 - 面对困难时的恢复能力
  - curiosity：好奇心 - 探索欲、求知欲
  - optimism：乐观 - 积极心态、希望感
- delta：根据聊天内容判断该特质的变化量（0-99）
- baseline_trait：判断用户该特质的基线水平（0-100）
- confidence：你的判断置信度（0-99）
- evidence_snippet：引用聊天记录中的原文作为证据
- expire_at：设置过期时间，建议使用 ${now + 30 * 24 * 60 * 60 * 1000}（30天后）

【重要规则】
1. 必须按顺序调用工具：先 create_chat_summary，再 update_friend_dynamic，最后根据情况调用 add_persona
2. create_chat_summary 和 update_friend_dynamic 是必须调用的
3. add_persona 只有在聊天内容确实反映了用户人格特质时才调用
4. 所有参数必须符合工具定义的要求
5. 聊天总结要用朋友的口吻，符合你的人设和语言风格`
    }
  ];

  const response = await client.chat?.completions.create({
    model: friend.model,
    messages: messagesForAI,
    tools: CHAT_SUMMARY_TOOL_SCHEMA,
    tool_choice: "auto",
    stream: true,
    // 禁用思考
    ...({thinking: {type: 'disabled'}})
  });

  if (!response) {
    throw new Error('AI response is null');
  }

  let summaryResult: ChatSummaryResult | null = null;

  const toolHandlers = {
      create_chat_summary: async (args: any) => {
        await createMemoChatSummary({
          session_id: friend.id,
          title: args.title,
          summary: args.summary,
          key_insights: JSON.stringify({}),
          ai_journal: args.role_notes
        });
        summaryResult = {
          title: args.title,
          summary: args.summary,
          key_insights: {},
          ai_journal: args.role_notes
        };
      },
    update_friend_dynamic: async (args: any) => {
      await updateMemoFriendDynamic(args.friend_id, {
        current_mood: args.mood,
        last_interaction: args.last_interaction
      });
    }, 
    add_persona: async (args: any) => {
      await addMemoLayerPersona({
        source: 'chat',
        source_id: friend.id,
        trait_name: args.trait_name,
        delta: args.delta,
        baseline_trait: args.baseline_trait,
        confidence: args.confidence,
        evidence_snippet: args.evidence_snippet || '',
        expire_at: args.expire_at
      });
    },
    update_persona: async (args: any) => {
      if (!args.id) return;
      await updateMemoLayerPersona(args.id, {
        delta: args.delta,
        baseline_trait: args.baseline_trait,
        confidence: args.confidence,
        expire_at: args.expire_at
      });
    }
  };

  await handleStreamingToolCalls(response, toolHandlers);

  if (!summaryResult) {
    throw new Error('Failed to create chat summary');
  }

  return summaryResult;
}
