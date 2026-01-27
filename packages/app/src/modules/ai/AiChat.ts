import OpenAI from "openai";
import {useSettingStore} from "@/store/GlobalSettingStore.ts";
import {getTauriFetch} from "@/lib/http.ts";
import type {AskToOpenAiProps} from "@/modules/ai/types.ts";

/**
 * 向OpenAI进行提问
 */
export async function askToOpenAi(props: AskToOpenAiProps): Promise<void> {
  const {messages, assistant, think, onStart, onAppend, onAborted} = props;
  const {aiSetting, supportThink} = useSettingStore();
  const st = supportThink(assistant.model);
  const openAi = new OpenAI({
    baseURL: aiSetting.url,
    apiKey: aiSetting.key,
    timeout: aiSetting.timeout,
    dangerouslyAllowBrowser: true,
    fetch: getTauriFetch()
  });

  const response = await openAi.chat?.completions.create({
    model: assistant.model,
    messages,
    stream: true,
    temperature: assistant.temperature,
    top_p: assistant.topP,
    ...(st && {thinking: {type: think ? 'enabled' : 'disabled'}}),
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
// async function askToOllama(props: AskToOpensAiProps): Promise<void> {
//   const {messages, assistant, onStart, onAppend, onAborted} = props;
//   const {aiSetting} = useSettingStore();
//
//   // 假设 Ollama 的 API 地址和密钥存储在 service 中
//   const response = await fetch(`${aiSetting.url}/completions`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       'Authorization': `Bearer ${aiSetting.key}`,
//     },
//     body: JSON.stringify({
//       model: assistant.model,
//       messages,
//       stream: true,
//       temperature: assistant.temperature,
//       top_p: assistant.topP,
//     }),
//   });
//
//   onStart?.();
//
//   if (!response.ok) {
//     return Promise.reject(new Error(`HTTP error! status: ${response.status}`));
//   }
//
//   const reader = response.body?.getReader();
//   if (!reader) {
//     return Promise.reject(new Error("无法获取流"));
//   }
//   const decoder = new TextDecoder('utf-8');
//   let done = false;
//
//   // 创建一个 AbortController 来处理中止请求
//   const controller = new AbortController();
//   onAborted({abort: () => controller.abort()});
//
//   while (!done) {
//     const {value, done: readerDone} = await reader!.read();
//     done = readerDone;
//     if (value) {
//       const chunk = decoder.decode(value, {stream: true});
//       // 假设 Ollama 返回的数据格式与 OpenAI 类似
//       const lines = chunk.split('\n').filter(line => line.trim() !== '');
//       for (const line of lines) {
//         if (line.startsWith('data: ')) {
//           const data = JSON.parse(line.replace('data: ', ''));
//           const content = data.choices[0]?.delta?.content || '';
//           onAppend(content);
//         }
//       }
//     }
//   }
// }