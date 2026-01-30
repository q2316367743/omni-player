import {type MemoFriend, memoFriendToPrompt, type MemoMessage} from "@/entity/memo";
import {useSettingStore} from "@/store/GlobalSettingStore.ts";
import {CHAT_SUMMARY_TOOL_SCHEMA} from "@/modules/ai/schema/ChatSummarySchema.ts";
import {createMemoChatSummary} from "@/services/memo/MemoChatSummaryService.ts";
import {updateMemoFriendDynamic} from "@/services/memo/MemoFriendService.ts";
import {addMemoLayerPersona, updateMemoLayerPersona} from "@/services/memo";
import {handleStreamingToolCalls} from "@/modules/ai/utils/ToolCallHandler.ts";
import type OpenAI from "openai";

interface AiMemoChatSummaryProp {
  // 谁
  friend: MemoFriend;
  // 全部的聊天信息
  messages: Array<MemoMessage>;
}

export async function aiMemoChatSummary(prop: AiMemoChatSummaryProp): Promise<void> {
  const {friend, messages} = prop;
  // 获取 AI 的提示词
  const prompt = memoFriendToPrompt(friend);
  // 获取 AI 客户端
  const client = useSettingStore().createAiClient();

  const now = Date.now();

  // 构建聊天记录内容
  const chatContent = messages
    .map(msg => `[${new Date(msg.created_at).toISOString()}] ${msg.role === 'user' ? '用户' : 'AI'}: ${msg.content}`)
    .join('\n');

  const messagesForAI: Array<OpenAI.Chat.ChatCompletionMessageParam> = [
    {
      role: "system",
      content: `${prompt}\n\n【任务说明】\n你是用户的 AI 朋友，现在需要对你们之间的聊天记录进行总结和分析。请以朋友的身份，用你的人设和语言风格来完成以下任务：`
    },
    {
      role: "user",
      content: `【当前时间】\n${new Date(now).toISOString()}\n\n【聊天记录】\n${chatContent}\n\n请以朋友的身份对以上聊天记录进行分析，并通过工具调用完成以下任务：\n1. 生成聊天记录的标题、详细总结和AI小记\n   - 标题：10字以内诗意标题，如《雨夜谈孤独》\n   - 总结：150字内，含关键洞察，用朋友的口吻总结，含情绪变化、核心议题\n   - AI小记：以你的第一人称写日记，表达对这次对话的感受、共情或反思\n2. 根据聊天内容，更新用户的四层人格数据（如果有相关信息）\n3. 更新你自己的动态数据，包括心情和最后交互时间\n   - 心情：必须是 happy、concerned、playful、melancholy、excited 中的一个\n\n重要规则：\n- 所有操作必须通过工具调用完成\n- 聊天总结要用朋友的口吻，符合你的人设和语言风格\n- 如果聊天内容中没有相关信息，可以不调用相应的工具`
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

  if (!response) return;

  const toolHandlers = {
    create_chat_summary: async (args: any) => {
      await createMemoChatSummary({
        session_id: friend.id,
        title: args.title,
        summary: args.summary,
        key_insights: JSON.stringify({}),
        ai_journal: args.role_notes
      });
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
}
