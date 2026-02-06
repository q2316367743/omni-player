import {buildMemoLayersContext, memoFriendToPrompt, type MemoFriendView, type MemoMessage} from "@/entity/memo";
import {useMemoVelesdb} from "@/lib/velesdb.ts";
import {useSettingStore} from "@/store/GlobalSettingStore.ts";
import type {AskToOpenAiAbort} from "@/modules/ai";
import {
  getActiveMemoLayerBehaviors,
  getActiveMemoLayerCognitive,
  getActiveMemoLayerEmotions, getActiveMemoLayerPersonas,
} from "@/services/memo";
import type OpenAI from "openai";
import {logDebug} from "@/lib/log.ts";
import {formatDate} from "@/util/lang/DateUtil.ts";


export interface AiMemoChatProp {
  friend: MemoFriendView;
  chat: string;
  messages: Array<MemoMessage>;
  onStart?: () => Promise<void>;
  onMessage: (data: string) => Promise<void>;
  onError?: (e: any) => Promise<void>;
  onFinally?: () => Promise<void>;
  // 流式处理回调结束
  onAborted: (a: AskToOpenAiAbort) => void;
}

/**
 * 聊天
 */
export async function aiMemoSession(props: AiMemoChatProp) {
  const {friend, chat, messages, onStart, onAborted, onMessage, onFinally, onError} = props;

  // 获取 AI 的提示词
  const prompt = memoFriendToPrompt(friend);
  // 获取我的提示词
  const userPrompt = useSettingStore().userPrompt(friend);
  // 获取 rag 内容
  const rags = await useMemoVelesdb().query(chat);
  // 获取人格信息
  const [emotions, cognitive, behaviors, personas] = await Promise.all([
    getActiveMemoLayerEmotions(),
    getActiveMemoLayerCognitive(),
    getActiveMemoLayerBehaviors(),
    getActiveMemoLayerPersonas()
  ])

  // 构建上下文
  const chatMessages: Array<OpenAI.Chat.ChatCompletionMessageParam> = [];

  // 1. System 消息
  chatMessages.push({
    role: "system",
    content: prompt
  });

  // 2. User 消息（背景上下文）
  // 构建会话主题（从最近的消息中提取或使用默认值）
  const sessionTopic = "日常对话";


  // 构建 RAG 内容
  const ragContent = rags && rags.length > 0 ?
    rags.map(rag => rag.content).join('\n') :
    "无相关记忆";

  // 构建背景上下文
  const backgroundContext = `本次会话主题：${sessionTopic}

${userPrompt}

${buildMemoLayersContext(behaviors, cognitive, emotions, personas)}

相关记忆：
${ragContent}

当前时间：
${formatDate(new Date())}
`;

  chatMessages.push({
    role: "user",
    content: backgroundContext
  });

  // 添加最近对话历史
  messages.forEach(msg => {
    if (msg.role === "assistant" || msg.role === "user" || msg.role === "system")
      chatMessages.push({
        role: msg.role,
        content: msg.content
      });
  });

  // 如果没有历史对话，添加一个提示让AI主动打招呼
  if (messages.length === 0) {
    chatMessages.push({
      role: "system",
      content: "这是与用户的第一次对话，请根据你的人设主动打招呼，表达友好，并引导用户开始对话。"
    });
  }

  const client = useSettingStore().createAiClient();

  logDebug("此次聊天内容", chatMessages);

  const response = await client.chat?.completions.create({
    model: friend.model,
    messages: chatMessages,
    stream: true,
    // temperature: assistant.temperature,
    // top_p: assistant.topP,
    // 禁用思考
    ...useSettingStore().disableThinkParam(friend.model)
  });
  await onStart?.();
  onAborted(response.controller);
  try {
    for await (const chunk of response) {
      const content = chunk.choices[0]?.delta.content;
      if (content) {
        await onMessage(content);
      }
    }
  } catch (e) {
    await onError?.(e);
  } finally {
    await onFinally?.();
  }


}