import OpenAI from "openai";
import type {AiMcpResult, AiMcpWrapper} from "@/modules/ai/mcp";

export interface ToolCallHandlerResult {
  // 思考内容
  think: string;
  // 内容
  content: string;
  // 工具调用结果
  toolResults: Map<string, AiMcpResult | undefined>
}

/**
 * 工具调用处理器
 * @param response 响应流
 * @param toolHandlers 工具处理器
 * @return 工具调用结果
 */
export async function handleStreamingToolCalls(
  response: AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>,
  toolHandlers: Array<AiMcpWrapper>
): Promise<ToolCallHandlerResult> {
  const toolCallsMap = new Map<number, any>();

  const thinks = new Array<string>();
  const contents = new Array<string>();

  // 接收流数据
  for await (const chunk of response) {
    const toolCalls = chunk.choices[0]?.delta.tool_calls;
    const reasoning_content = (chunk.choices[0]?.delta as any)?.reasoning_content;
    const content = chunk.choices[0]?.delta?.content;
    if (reasoning_content) thinks.push(reasoning_content);
    if (content) contents.push(content);

    if (!toolCalls) continue;

    toolCalls.forEach(toolCall => {
      const index = toolCall.index;
      if (index === undefined) return;

      const existing = toolCallsMap.get(index);
      if (existing) {
        if (toolCall.id) existing.id = toolCall.id;
        if (toolCall.function) {
          if (!existing.function) existing.function = {name: '', arguments: ''};
          if (toolCall.function.name) existing.function.name = toolCall.function.name;
          if (toolCall.function.arguments) existing.function.arguments += toolCall.function.arguments;
        }
      } else {
        toolCallsMap.set(index, {...toolCall});
      }
    });
  }

  const res = new Map<string, AiMcpResult | undefined>();

  // 处理工具调用
  const list = Array.from(toolCallsMap.values());
  for (let i = 0; i < list.length; i++) {
    const toolCall = list[i];
    await executeToolCall(toolCall, toolHandlers, res);
  }

  return {
    think: thinks.join(''),
    content: contents.join(''),
    toolResults: res
  };
}

export async function handleNonStreamingToolCalls(
  response: OpenAI.Chat.Completions.ChatCompletion,
  toolHandlers: Array<AiMcpWrapper>,
  map: Map<string, AiMcpResult | undefined>
): Promise<void> {
  const toolCalls = response.choices[0]?.message?.tool_calls;
  if (!toolCalls) return;

  for (const toolCall of toolCalls) {
    await executeToolCall(toolCall, toolHandlers, map);
  }
}

async function executeToolCall(
  toolCall: any,
  toolHandlers: Array<AiMcpWrapper>,
  map: Map<string, AiMcpResult | undefined>
): Promise<AiMcpResult | undefined> {
  const functionCall = toolCall.function;
  if (!functionCall) return;
  const functionName = functionCall.name;
  let functionArguments;
  try {
    functionArguments = JSON.parse(functionCall.arguments || '{}');
  } catch (e) {
    console.error(`[Tool Call Handler] Error parsing function arguments, functionName: ${functionName}, arguments: ${functionCall.arguments}, error: ${e}`);
    return;
  }

  for (const toolHandler of toolHandlers) {
    if (toolHandler.check(functionName)) {
      const r =  await toolHandler.execute(functionName, functionArguments);
      map.set(toolCall.id, r)
    }
  }

}

