import {memoFriendToPrompt, type MemoFriendView, type MemoMessage} from "@/entity/memo";
import {useMemoVelesdb} from "@/lib/velesdb.ts";
import {useSettingStore} from "@/store/GlobalSettingStore.ts";
import type {AskToOpenAiAbort} from "@/modules/ai";
import {
  getActiveMemoLayerBehaviors,
  getActiveMemoLayerCognitive,
  getActiveMemoLayerEmotions, getActiveMemoLayerPersonas,
} from "@/services/memo";
import type OpenAI from "openai";

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
export async function aiMemoChat(props: AiMemoChatProp) {
  const {friend, chat, messages, onStart, onAborted, onMessage, onFinally, onError} = props;

  // 获取 AI 的提示词
  const prompt = memoFriendToPrompt(friend);
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

  // 构建四层人格状态描述
  const personalityStatus = [];

  // 情绪状态
  if (emotions && emotions.length > 0) {
    const emotionStr = emotions.map(e => `${e.emotion_type}(${Math.round(e.intensity * 100 / 9)}/100)`).join(', ');
    personalityStatus.push(`你的情绪：${emotionStr}`);
  }

  // 认知状态
  if (cognitive && cognitive.length > 0) {
    const cognitiveStr = cognitive.map(c => `${c.topic}(${Math.round(c.importance * 100 / 9)}/100)`).join(', ');
    personalityStatus.push(`你的认知：${cognitiveStr}`);
  }

  // 行为状态
  if (behaviors && behaviors.length > 0) {
    const behaviorStr = behaviors.map(b => `${b.behavior}(${Math.round(b.priority * 100 / 9)}/100)`).join(', ');
    personalityStatus.push(`你的行为：${behaviorStr}`);
  }

  // 人格特质
  if (personas && personas.length > 0) {
    const personaStr = personas.map(p => `${p.trait_name}(${Math.round((p.baseline_trait + p.delta) * 100 / 9)}/100)`).join(', ');
    personalityStatus.push(`你的人格：${personaStr}`);
  }

  // 构建 RAG 内容
  const ragContent = rags && rags.length > 0 ?
    rags.map(rag => rag.content).join('\n') :
    "无相关记忆";

  // 构建背景上下文
  const backgroundContext = `本次会话主题：${sessionTopic}\n${personalityStatus.join('\n')}\n\n相关记忆：\n${ragContent}`;

  chatMessages.push({
    role: "user",
    content: backgroundContext
  });

  // 3. 最近对话历史
  // 过滤并排序消息，只保留 user 和 assistant 角色，最多 6 条
  const filteredMessages = messages
    .filter(msg => msg.role === "user" || msg.role === "assistant")
    .sort((a, b) => a.created_at - b.created_at)
    .slice(-6);

  // 添加最近对话历史
  filteredMessages.forEach(msg => {
    chatMessages.push({
      role: msg.role as 'user' | 'assistant',
      content: msg.content
    });
  });

  // 4. 当前用户消息
  chatMessages.push({
    role: "user",
    content: chat
  });

  // 如果没有历史对话，添加一个提示让AI主动打招呼
  if (filteredMessages.length === 0) {
    chatMessages.push({
      role: "system",
      content: "这是与用户的第一次对话，请根据你的人设主动打招呼，表达友好，并引导用户开始对话。"
    });
  }

  const client = useSettingStore().createAiClient();

  const response = await client.chat?.completions.create({
    model: friend.model,
    messages: chatMessages,
    stream: true,
    // temperature: assistant.temperature,
    // top_p: assistant.topP,
    // 禁用思考
    ...({thinking: {type: 'disabled'}})
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