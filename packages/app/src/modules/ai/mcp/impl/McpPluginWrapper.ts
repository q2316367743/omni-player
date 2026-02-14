import type {AiMcpResult, AiMcpWrapper} from "@/modules/ai/mcp";
import OpenAI from "openai";
import {executeToolCall, getToolCalls, type McpToolCall} from '@tauri-apps/plugin-mcp';
import {logDebug, logError} from "@/lib/log.ts";

export class McpPluginWrapper implements AiMcpWrapper {
  private toolSchemas: Array<McpToolCall> = [];
  private toolNameToMcpId: Map<string, string> = new Map();

  async refreshToolSchemas(): Promise<void> {
    try {
      this.toolSchemas = await getToolCalls();
      this.toolNameToMcpId.clear();
      for (const tool of this.toolSchemas) {
        this.toolNameToMcpId.set(tool.name, tool.id);
      }
      logDebug('[McpPluginWrapper] 刷新工具列表成功', {count: this.toolSchemas.length});
    } catch (e) {
      logError('[McpPluginWrapper] 刷新工具列表失败', e);
      this.toolSchemas = [];
    }
  }

  check(functionName: string): boolean {
    return this.toolNameToMcpId.has(functionName);
  }

  async execute(functionName: string, args: any): Promise<AiMcpResult> {
    const mcpId = this.toolNameToMcpId.get(functionName);
    if (!mcpId) {
      throw new Error(`未找到 MCP 工具: ${functionName}`);
    }

    try {
      const result = await executeToolCall(mcpId, {
        name: functionName,
        arguments: args
      });

      logDebug('[McpPluginWrapper] 执行工具成功', {functionName, mcpId});

      return {
        functionName,
        args,
        result
      };
    } catch (e) {
      logError('[McpPluginWrapper] 执行工具失败', {functionName, mcpId, error: e});
      throw e;
    }
  }

  getSchema(): Array<OpenAI.Chat.Completions.ChatCompletionTool> {
    return this.toolSchemas.map(tool => ({
      type: "function" as const,
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters
      }
    }));
  }
}
