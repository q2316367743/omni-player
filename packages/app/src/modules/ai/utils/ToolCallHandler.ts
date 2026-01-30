import OpenAI from "openai";

export async function handleStreamingToolCalls(
  response: AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>,
  toolHandlers: Record<string, (...args: any[]) => Promise<void>>
): Promise<void> {
  const toolCallsMap = new Map<number, any>();

  for await (const chunk of response) {
    const toolCalls = chunk.choices[0]?.delta.tool_calls;
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

  for (const toolCall of toolCallsMap.values()) {
    await executeToolCall(toolCall, toolHandlers);
  }
}

export async function handleNonStreamingToolCalls(
  response: OpenAI.Chat.Completions.ChatCompletion,
  toolHandlers: Record<string, (...args: any[]) => Promise<void>>
): Promise<void> {
  const toolCalls = response.choices[0]?.message?.tool_calls;
  if (!toolCalls) return;

  for (const toolCall of toolCalls) {
    await executeToolCall(toolCall, toolHandlers);
  }
}

async function executeToolCall(
  toolCall: any,
  toolHandlers: Record<string, (...args: any[]) => Promise<void>>
): Promise<void> {
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

  const handler = toolHandlers[functionName];
  if (handler) {
    try {
      await handler(functionArguments);
    } catch (e) {
      console.error(`[Tool Call Handler] Error executing tool handler, functionName: ${functionName}, error: ${e}`);
    }
  } else {
    console.warn(`[Tool Call Handler] No handler found for tool: ${functionName}`);
  }
}

