import type {AiQuestionResult, AskToOpenAiProps} from "@/modules/ai/types.ts";
import {useSettingStore} from "@/store/GlobalSettingStore.ts";


export async function askQuestionOpenAi(props: Omit<AskToOpenAiProps, 'onAborted' | 'onAppend' | 'onStart'>): Promise<AiQuestionResult> {
  const {messages, assistant, think} = props;
  const {supportThink, createAiClient} = useSettingStore();
  const st = supportThink(assistant.model);
  const openAi = createAiClient();

  const response = await openAi.chat?.completions.create({
    model: assistant.model,
    messages,
    stream: true,
    temperature: assistant.temperature,
    top_p: assistant.topP,
    ...(st && {thinking: {type: think ? 'enabled' : 'disabled'}}),
  });

  const result: AiQuestionResult = {
    think: '',
    content: '',
  }

  // 流式处理结果
  for await (const chunk of response) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const reasoning_content = chunk.choices[0]?.delta?.reasoning_content;
    const content = chunk.choices[0]?.delta?.content;
    if (reasoning_content) {
      result.think = result.think + reasoning_content;
    }
    if (content) {
      result.content = result.content + content;
    }
  }
  return result;
}