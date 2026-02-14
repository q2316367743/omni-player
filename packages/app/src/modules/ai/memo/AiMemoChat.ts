import {
  buildMemoLayersContext,
  type MemoChatContent,
  type MemoFriendStaticView,
  memoFriendToPrompt
} from "@/entity/memo";
import {getMemoChatSummaryLast, listMemoChatUnSummary} from "@/services/memo/chat";
import {useMemoFriendStore, useSettingStore} from "@/store";
import {
  getActiveMemoLayerBehaviors, getActiveMemoLayerCognitive, getActiveMemoLayerEmotions,
  getActiveMemoLayerPersonas
} from "@/services/memo";
import {formatDate, getTimeSinceLastInteraction} from "@/util/lang/DateUtil.ts";
import type OpenAI from "openai";
import {logDebug, logInfo} from "@/lib/log.ts";
import {aguiHandler, type AguiEvent} from "@/modules/ai/utils/AguiHandler.ts";
import {SelfMcp} from "@/modules/ai/mcp";
import {McpPluginWrapper} from "@/modules/ai/mcp/impl/McpPluginWrapper.ts";

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

  const chatSummary = await getMemoChatSummaryLast(friend.id);
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

  const selfMcp = new SelfMcp(friend.id);
  const mcpPluginWrapper = new McpPluginWrapper();
  await mcpPluginWrapper.refreshToolSchemas();

  const toolHandlers = [selfMcp, mcpPluginWrapper];
  const tools = [...selfMcp.getSchema(), ...mcpPluginWrapper.getSchema()];

  logInfo('[AiMemoChat] 开始调用 AI Agent', {
    model: friend.model,
    messageCount: messages.length,
    toolCount: tools.length
  });

  const handleAguiEvent = async (event: AguiEvent) => {
    switch (event.type) {
      case 'think':
        await onMessage({type: 'think', content: event.content});
        break;
      case 'text':
        await onMessage({type: 'text', content: event.content});
        break;
      case 'tool_call_start':
        logDebug('[AiMemoChat] 工具调用开始', {toolName: event.toolName});
        break;
      case 'tool_call_result':
        await onMessage({
          type: 'mcp',
          toolName: event.toolName,
          args: event.args,
          result: event.result
        });
        break;
      case 'error':
        logDebug('[AiMemoChat] 错误', {message: event.message});
        break;
    }
  };

  const result = await aguiHandler({
    client,
    model: friend.model,
    messages,
    tools,
    toolHandlers,
    think: prop.think,
    thinkParam,
    maxIterations: 5,
    onEvent: handleAguiEvent
  });

  logInfo('[AiMemoChat] 聊天完成', {
    contentLength: result.content.length,
    thinkLength: result.thinkContent.length,
    toolCallCount: result.toolCalls.length
  });
}
