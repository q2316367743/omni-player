import {
  buildMemoLayersContext,
  type MemoChatContent,
  type MemoFriendStaticView,
  memoFriendToPrompt
} from "@/entity/memo";
import {listMemoChatSummaryLast, listMemoChatUnSummary} from "@/services/memo/chat";
import {useMemoFriendStore, useSettingStore} from "@/store";
import {
  getActiveMemoLayerBehaviors, getActiveMemoLayerCognitive, getActiveMemoLayerEmotions,
  getActiveMemoLayerPersonas
} from "@/services/memo";
// import {CHAT_SUMMARY_TOOL_SCHEMA} from "@/modules/ai/schema/ChatSummarySchema.ts";
import {formatDate, getTimeSinceLastInteraction} from "@/util/lang/DateUtil.ts";
import type OpenAI from "openai";
import {logDebug, logInfo} from "@/lib/log.ts";

export interface AiMemoChatProp {
  friend: MemoFriendStaticView;
  think: boolean;
  onMessage: (msg: MemoChatContent) => Promise<void>
}

export async function aiMemoChat(prop: AiMemoChatProp) {
  const {friend, onMessage} = prop;
  const {createAiClient, thinkParam} = useSettingStore();
  const now = Date.now();

  logInfo('[AiMemoChat] 开始聊天', {friendId: friend.id, friendName: friend.name, think: prop.think});

  const messages: Array<OpenAI.Chat.ChatCompletionMessageParam> = [];

  // TODO: 此处需要修复
  const chatSummary = await listMemoChatSummaryLast(friend.id);
  logDebug('[AiMemoChat] 查询到上次对话总结', chatSummary ? {
    summaryId: chatSummary.id,
    createdAt: chatSummary.created_at
  } : '无');

  const chats = await listMemoChatUnSummary(friend.id);
  logDebug('[AiMemoChat] 查询到未总结的聊天记录', {count: chats.length});

  const f = await useMemoFriendStore().fetchFriend(friend.id);
  const prompt = memoFriendToPrompt(f!);
  logDebug('[AiMemoChat] 构建人物身份提示词完成', {promptLength: prompt.length});

  const [emotions, cognitive, behaviors, personas] = await Promise.all([
    getActiveMemoLayerEmotions(),
    getActiveMemoLayerCognitive(),
    getActiveMemoLayerBehaviors(),
    getActiveMemoLayerPersonas()
  ])
  const layers = buildMemoLayersContext(behaviors, cognitive, emotions, personas);
  logDebug('[AiMemoChat] 构建人格数据完成', {
    emotionsCount: emotions.length,
    cognitiveCount: cognitive.length,
    behaviorsCount: behaviors.length,
    personasCount: personas.length,
    layersLength: layers.length
  });

  const systemPrompt = `${prompt}

${layers}

【当前时间】
${formatDate(now)}`;

  messages.push({
    role: "system",
    content: systemPrompt
  });

  if (chatSummary) {
    const startTime = getTimeSinceLastInteraction(chatSummary.start_time);
    const endTime = getTimeSinceLastInteraction(chatSummary.end_time);
    messages.push({
      role: "system",
      content: `【上次对话总结】[${startTime} - ${endTime}]\n${chatSummary.content}`
    });
    logDebug('[AiMemoChat] 添加上次对话总结到消息', {startTime, endTime});
  }

  let validChatCount = 0;
  chats.forEach(chat => {
    if (chat.role !== 'system' && chat.role !== 'user' && chat.role !== 'assistant') {
      return;
    }

    const timeSinceMessage = getTimeSinceLastInteraction(chat.created_at);
    const textContents = chat.content.filter((c: MemoChatContent) => c.type === 'text');

    if (textContents.length > 0) {
      validChatCount++;
      const content = textContents.map((c: MemoChatContent) => (c as any).content).join('');
      messages.push({
        role: chat.role,
        content: `[${timeSinceMessage}] ${content}`
      });
    }
  });
  logDebug('[AiMemoChat] 添加历史聊天记录到消息', {total: chats.length, valid: validChatCount});

  logDebug('[AiMemoChat] 构建的消息数组', {messageCount: messages.length});

  const client = createAiClient();

  logInfo('[AiMemoChat] 开始调用 AI', {model: friend.model, messageCount: messages.length});

  const response = await client.chat.completions.create({
    model: friend.model,
    messages,
    // tools: CHAT_SUMMARY_TOOL_SCHEMA,
    // tool_choice: "required",
    stream: true,
    ...thinkParam(friend.model, prop.think)
  });

  let chunkCount = 0;
  for await (const chunk of response) {
    chunkCount++;
    const reasoning_content = (chunk.choices[0]?.delta as any)?.reasoning_content;
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      await onMessage({type: 'text', content});
    } else if (reasoning_content) {
      await onMessage({type: 'think', content: reasoning_content});
    }
  }

  logInfo('[AiMemoChat] 聊天完成', {totalChunks: chunkCount});
}