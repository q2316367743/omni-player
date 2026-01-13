import OpenAI from "openai";
import {useSettingStore} from "@/store/GlobalSettingStore.ts";

export interface AskToOpenAiAbort {
  abort: (reason?: string) => void;
}

export interface ChatMessageParam {
  // 角色
  role: "system" | "user" | "assistant";
  // 内容
  content: string;
  // 使用的模型
  model: string;
}

interface Assistant {
  // 使用的默认模型
  model: string;
  // 模型温度，0-2，一位小数
  temperature?: number;
  // Top-P，0-1，二位小数
  topP?: number;
  // 上下文数
  maxChats?: number;
}

interface AskToOpenAiProps {
  messages: Array<ChatMessageParam>;
  assistant: Assistant;
  // 流式处理回调开始
  onStart?: () => void;
  // 流式处理回调
  onAppend: (data: string, t?: boolean) => void;
  // 流式处理回调结束
  onAborted: (a: AskToOpenAiAbort) => void;
}

export async function askToOpenAi(props: AskToOpenAiProps): Promise<void> {
  const {messages, assistant, onStart, onAppend, onAborted} = props;
  const {aiSetting} = useSettingStore();
  const openAi = new OpenAI({
    baseURL: aiSetting.url,
    apiKey: aiSetting.key,
    dangerouslyAllowBrowser: true
  });

  const response = await openAi.chat?.completions.create({
    model: assistant.model,
    messages,
    stream: true,
    temperature: assistant.temperature,
    top_p: assistant.topP,
    // top_logprobs: assistant.maxChats,
  });
  onStart?.();
  onAborted(response.controller);

  // 流式处理结果
  for await (const chunk of response) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const reasoning_content = chunk.choices[0]?.delta?.reasoning_content;
    const content = chunk.choices[0]?.delta?.content;
    onAppend(reasoning_content || content, !!reasoning_content);
  }
}

/**
 * 向Ollama进行提问
 * @param props 参数
 */
async function askToOllama(props: AskToOpenAiProps): Promise<void> {
  const {messages, assistant, onStart, onAppend, onAborted} = props;
  const {aiSetting} = useSettingStore();

  // 假设 Ollama 的 API 地址和密钥存储在 service 中
  const response = await fetch(`${aiSetting.url}/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${aiSetting.key}`,
    },
    body: JSON.stringify({
      model: assistant.model,
      messages,
      stream: true,
      temperature: assistant.temperature,
      top_p: assistant.topP,
    }),
  });

  onStart?.();

  if (!response.ok) {
    return Promise.reject(new Error(`HTTP error! status: ${response.status}`));
  }

  const reader = response.body?.getReader();
  if (!reader) {
    return Promise.reject(new Error("无法获取流"));
  }
  const decoder = new TextDecoder('utf-8');
  let done = false;

  // 创建一个 AbortController 来处理中止请求
  const controller = new AbortController();
  onAborted({abort: () => controller.abort()});

  while (!done) {
    const {value, done: readerDone} = await reader!.read();
    done = readerDone;
    if (value) {
      const chunk = decoder.decode(value, {stream: true});
      // 假设 Ollama 返回的数据格式与 OpenAI 类似
      const lines = chunk.split('\n').filter(line => line.trim() !== '');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = JSON.parse(line.replace('data: ', ''));
          const content = data.choices[0]?.delta?.content || '';
          onAppend(content);
        }
      }
    }
  }
}