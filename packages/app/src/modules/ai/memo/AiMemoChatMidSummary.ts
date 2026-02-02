import {memoFriendToPrompt, type MemoFriendView, type MemoMessage} from "@/entity/memo";
import {useSettingStore} from "@/store/GlobalSettingStore.ts";
import type OpenAI from "openai";
import {formatDate} from "@/util/lang/FormatUtil.ts";
import {logDebug} from "@/lib/log.ts";

export interface AiMemoChatMidSummaryProp {
  // AI朋友
  friend: MemoFriendView;
  // 需要总结的聊天消息
  messages: Array<MemoMessage>;
}

export interface MidSummaryResult {
  // 总结内容
  summary: string;
}

/**
 * 中间总结 - 用于长对话的阶段性总结
 * 将历史对话压缩成摘要，供后续对话使用
 */
export async function aiMemoChatMidSummary(prop: AiMemoChatMidSummaryProp): Promise<MidSummaryResult> {
  const {friend, messages} = prop;
  
  // 获取 AI 的提示词
  const prompt = memoFriendToPrompt(friend);
  // 获取 AI 客户端
  const client = useSettingStore().createAiClient();

  // 构建聊天记录内容
  const chatContent = messages
    .map(msg => `[${msg.role === 'user' ? '用户' : '你'}] ${msg.content}`)
    .join('\n\n');

  const messagesForAI: Array<OpenAI.Chat.ChatCompletionMessageParam> = [
    {
      role: "system",
      content: `${prompt}

【任务说明】
你正在与用户进行一场长对话。现在需要对之前的对话内容进行阶段性总结。
这个总结将作为后续对话的上下文，帮助你记住对话的关键信息。`
    },
    {
      role: "user",
      content: `【当前时间】
${formatDate(Date.now())}

【之前的对话内容】
${chatContent}

【总结任务】
请对以上对话进行简洁的阶段性总结（200-400字）：
1. 总结对话的核心主题和关键信息
2. 记录用户的观点、需求或情感状态
3. 保留任何未完成的讨论或待跟进的事项
4. 以第二人称"你"的视角来组织内容，方便后续对话直接使用

总结格式示例：
"用户正在讨论工作压力问题。TA提到最近项目 deadline 很紧，感到焦虑。你建议TA尝试时间管理方法，用户表示愿意尝试番茄工作法。需要后续跟进TA的实施情况..."`
    }
  ];

  logDebug("[MidSummary] 开始生成中间总结", { messageCount: messages.length });

  const response = await client.chat!.completions.create({
    model: friend.model,
    messages: messagesForAI,
    stream: false,
    // 禁用思考
    ...useSettingStore().disableThinkParam(friend.model)
  });

  if (!response || !response.choices || response.choices.length === 0) {
    throw new Error('AI response is null or empty');
  }

  const summary = response.choices[0]?.message?.content || '';
  
  logDebug("[MidSummary] 中间总结生成完成", { summaryLength: summary.length });

  return {
    summary
  };
}
