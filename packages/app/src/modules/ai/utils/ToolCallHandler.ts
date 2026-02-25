import OpenAI from "openai";
import type {AiMcpResult, AiMcpWrapper} from "@/modules/ai/mcp";
import {logDebug, logError, logInfo} from "@/lib/log.ts";

export interface ToolCallHandlerResult {
  think: string;
  content: string;
  toolResults: Array<{
    id: string;
    functionName: string;
    args: any;
    result: any;
  }>;
}

export interface ToolCallHandlerProp {
  client: OpenAI;
  model: string;
  messages: Array<OpenAI.Chat.ChatCompletionMessageParam>;
  toolHandlers: Array<AiMcpWrapper>;
  tools: Array<OpenAI.Chat.Completions.ChatCompletionTool>;
  thinkParam?: Record<string, any>;
  maxIterations?: number;
  onToolCall?: (result: AiMcpResult) => void;
}

export async function handleStreamingToolCalls(
  response: AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>,
  toolHandlers: Array<AiMcpWrapper>
): Promise<ToolCallHandlerResult> {
  const toolCallsMap = new Map<number, any>();

  const thinks = new Array<string>();
  const contents = new Array<string>();

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

  const toolResults: ToolCallHandlerResult['toolResults'] = [];

  const list = Array.from(toolCallsMap.values());
  for (const toolCall of list) {
    const result = await executeToolCall(toolCall, toolHandlers);
    if (result) {
      toolResults.push({
        id: toolCall.id,
        functionName: result.functionName,
        args: result.args,
        result: result.result
      });
    }
  }

  return {
    think: thinks.join(''),
    content: contents.join(''),
    toolResults
  };
}

export async function handleToolCallsWithLoop(prop: ToolCallHandlerProp): Promise<ToolCallHandlerResult> {
  const {
    client,
    model,
    messages,
    toolHandlers,
    tools,
    thinkParam = {},
    maxIterations = 10,
    onToolCall
  } = prop;

  const finalResult: ToolCallHandlerResult = {
    think: '',
    content: '',
    toolResults: []
  };

  let iteration = 0;
  let shouldContinue = true;

  while (shouldContinue && iteration < maxIterations) {
    iteration++;
    logInfo('[ToolCallHandler] 开始迭代', {iteration, maxIterations});

    try {
      const response = await client.chat.completions.create({
        model,
        messages,
        tools: tools.length > 0 ? tools : undefined,
        tool_choice: tools.length > 0 ? 'auto' : undefined,
        stream: true,
        ...thinkParam
      });

      const iterationResult = await processStreamResponse(response, toolHandlers);

      finalResult.think += iterationResult.thinkContent;
      finalResult.content += iterationResult.content;
      finalResult.toolResults.push(...iterationResult.toolCalls);

      if (iterationResult.toolCalls.length > 0) {
        const assistantMessage: OpenAI.Chat.ChatCompletionAssistantMessageParam = {
          role: 'assistant',
          content: iterationResult.content || null,
          tool_calls: iterationResult.toolCalls.map(tc => ({
            id: tc.id,
            type: 'function' as const,
            function: {
              name: tc.functionName,
              arguments: JSON.stringify(tc.args)
            }
          }))
        };
        messages.push(assistantMessage);

        for (const toolCall of iterationResult.toolCalls) {
          if (onToolCall) {
            onToolCall({
              functionName: toolCall.functionName,
              args: toolCall.args,
              result: toolCall.result
            });
          }

          const toolMessage: OpenAI.Chat.ChatCompletionToolMessageParam = {
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify(toolCall.result)
          };
          messages.push(toolMessage);
        }

        logDebug('[ToolCallHandler] 工具调用完成，继续迭代', {
          toolCallCount: iterationResult.toolCalls.length
        });
      } else {
        shouldContinue = false;
        logInfo('[ToolCallHandler] 无工具调用，结束迭代');
      }
    } catch (e) {
      logError('[ToolCallHandler] 迭代出错', {iteration, error: e});
      shouldContinue = false;
    }
  }

  if (iteration >= maxIterations) {
    logInfo('[ToolCallHandler] 达到最大迭代次数', {maxIterations});
  }

  return finalResult;
}

interface StreamIterationResult {
  thinkContent: string;
  content: string;
  toolCalls: Array<{
    id: string;
    functionName: string;
    args: any;
    result: any;
  }>;
}

async function processStreamResponse(
  response: AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>,
  toolHandlers: Array<AiMcpWrapper>
): Promise<StreamIterationResult> {
  const result: StreamIterationResult = {
    thinkContent: '',
    content: '',
    toolCalls: []
  };

  const toolCallsMap = new Map<number, {
    id: string;
    functionName: string;
    arguments: string;
  }>();

  for await (const chunk of response) {
    const delta = chunk.choices[0]?.delta;
    if (!delta) continue;

    const reasoningContent = (delta as any)?.reasoning_content;
    const content = delta.content;
    const toolCalls = delta.tool_calls;

    if (reasoningContent) {
      result.thinkContent += reasoningContent;
    }

    if (content) {
      result.content += content;
    }

    if (toolCalls) {
      for (const toolCall of toolCalls) {
        const index = toolCall.index;
        if (index === undefined) continue;

        const existing = toolCallsMap.get(index);
        if (existing) {
          if (toolCall.id) existing.id = toolCall.id;
          if (toolCall.function?.name) existing.functionName = toolCall.function.name;
          if (toolCall.function?.arguments) existing.arguments += toolCall.function.arguments;
        } else {
          toolCallsMap.set(index, {
            id: toolCall.id || '',
            functionName: toolCall.function?.name || '',
            arguments: toolCall.function?.arguments || ''
          });
        }
      }
    }
  }

  for (const [, toolCall] of toolCallsMap) {
    let args: any = {};
    try {
      args = JSON.parse(toolCall.arguments || '{}');
    } catch (e) {
      logError('[ToolCallHandler] 解析工具参数失败', {
        functionName: toolCall.functionName,
        arguments: toolCall.arguments
      }, e);
      continue;
    }

    let toolResult: any = null;
    for (const handler of toolHandlers) {
      if (handler.check(toolCall.functionName)) {
        try {
          const mcpResult: AiMcpResult = await handler.execute(toolCall.functionName, args);
          toolResult = mcpResult.result;
        } catch (e) {
          logError('[ToolCallHandler] 工具执行失败', {
            functionName: toolCall.functionName,
            error: e
          });
          toolResult = {error: e instanceof Error ? e.message : '工具执行失败'};
        }
        break;
      }
    }

    result.toolCalls.push({
      id: toolCall.id,
      functionName: toolCall.functionName,
      args,
      result: toolResult
    });
  }

  return result;
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
  map?: Map<string, AiMcpResult | undefined>
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
      const r = await toolHandler.execute(functionName, functionArguments);
      if (map) {
        map.set(toolCall.id, r);
      }
      return r;
    }
  }
}
