import type {AiMcpResult, AiMcpWrapper} from "@/modules/ai/mcp";
import type OpenAI from "openai";
import {logDebug, logError, logInfo} from "@/lib/log.ts";

export interface AguiHandlerProp {
  client: OpenAI;
  model: string;
  messages: Array<OpenAI.Chat.ChatCompletionMessageParam>;
  tools: Array<OpenAI.Chat.Completions.ChatCompletionTool>;
  toolHandlers: Array<AiMcpWrapper>;
  think: boolean;
  thinkParam: (model: string, think: boolean) => Record<string, any>;
  maxIterations?: number;
  onEvent: (event: AguiEvent) => Promise<void>;
}

export type AguiEvent =
  | { type: 'think'; content: string }
  | { type: 'text'; content: string }
  | { type: 'tool_call_start'; toolName: string; args: any }
  | { type: 'tool_call_result'; toolName: string; args: any; result: any }
  | { type: 'error'; message: string };

export interface AguiHandlerResult {
  content: string;
  thinkContent: string;
  toolCalls: Array<{
    toolName: string;
    args: any;
    result: any;
  }>;
}

export async function aguiHandler(prop: AguiHandlerProp): Promise<AguiHandlerResult> {
  const {
    client,
    model,
    messages,
    tools,
    toolHandlers,
    think,
    thinkParam,
    maxIterations = 5,
    onEvent
  } = prop;

  const result: AguiHandlerResult = {
    content: '',
    thinkContent: '',
    toolCalls: []
  };

  let iteration = 0;
  let shouldContinue = true;

  while (shouldContinue && iteration < maxIterations) {
    iteration++;
    logInfo('[AguiHandler] 开始迭代', {iteration, maxIterations});

    try {
      const response = await client.chat.completions.create({
        model,
        messages,
        tools: tools.length > 0 ? tools : undefined,
        tool_choice: tools.length > 0 ? 'auto' : undefined,
        stream: true,
        ...thinkParam(model, think)
      });

      const iterationResult = await processStreamResponse(
        response,
        toolHandlers,
        onEvent
      );

      result.thinkContent += iterationResult.thinkContent;
      result.content += iterationResult.content;

      if (iterationResult.toolCalls.length > 0) {
        const assistantMessage: OpenAI.Chat.ChatCompletionAssistantMessageParam = {
          role: 'assistant',
          content: iterationResult.content || null,
          tool_calls: iterationResult.toolCalls.map(tc => ({
            id: tc.id,
            type: 'function' as const,
            function: {
              name: tc.toolName,
              arguments: JSON.stringify(tc.args)
            }
          }))
        };
        messages.push(assistantMessage);

        for (const toolCall of iterationResult.toolCalls) {
          result.toolCalls.push({
            toolName: toolCall.toolName,
            args: toolCall.args,
            result: toolCall.result
          });

          const toolMessage: OpenAI.Chat.ChatCompletionToolMessageParam = {
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify(toolCall.result)
          };
          messages.push(toolMessage);
        }

        logDebug('[AguiHandler] 工具调用完成，继续迭代', {
          toolCallCount: iterationResult.toolCalls.length
        });
      } else {
        shouldContinue = false;
        logInfo('[AguiHandler] 无工具调用，结束迭代');
      }
    } catch (e) {
      logError('[AguiHandler] 迭代出错', {iteration, error: e});
      await onEvent({
        type: 'error',
        message: e instanceof Error ? e.message : '未知错误'
      });
      shouldContinue = false;
    }
  }

  if (iteration >= maxIterations) {
    logInfo('[AguiHandler] 达到最大迭代次数', {maxIterations});
  }

  return result;
}

interface StreamIterationResult {
  thinkContent: string;
  content: string;
  toolCalls: Array<{
    id: string;
    toolName: string;
    args: any;
    result: any;
  }>;
}

async function processStreamResponse(
  response: AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>,
  toolHandlers: Array<AiMcpWrapper>,
  onEvent: (event: AguiEvent) => Promise<void>
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
      await onEvent({type: 'think', content: reasoningContent});
    }

    if (content) {
      result.content += content;
      await onEvent({type: 'text', content});
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
      logError('[AguiHandler] 解析工具参数失败', {
        functionName: toolCall.functionName,
        arguments: toolCall.arguments
      }, e);
      continue;
    }

    await onEvent({
      type: 'tool_call_start',
      toolName: toolCall.functionName,
      args
    });

    let toolResult: any = null;
    for (const handler of toolHandlers) {
      if (handler.check(toolCall.functionName)) {
        try {
          const mcpResult: AiMcpResult = await handler.execute(toolCall.functionName, args);
          toolResult = mcpResult.result;
        } catch (e) {
          logError('[AguiHandler] 工具执行失败', {
            functionName: toolCall.functionName,
            error: e
          });
          toolResult = {error: e instanceof Error ? e.message : '工具执行失败'};
        }
        break;
      }
    }

    await onEvent({
      type: 'tool_call_result',
      toolName: toolCall.functionName,
      args,
      result: toolResult
    });

    result.toolCalls.push({
      id: toolCall.id,
      toolName: toolCall.functionName,
      args,
      result: toolResult
    });
  }

  return result;
}
