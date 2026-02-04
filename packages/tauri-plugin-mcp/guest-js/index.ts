import {invoke} from '@tauri-apps/api/core'

/**
 * 获取全部启动中的 mcp
 * @return mcp 列表的 ID
 */
export async function list(): Promise<Array<string>> {
  return await invoke<Array<string>>('plugin:mcp|list', {});
}

export interface MCPItem {
  id: string;
  name: string;
  command: string;
  args: Array<string>;
  evn: Record<string, string>
}

/**
 * 新增 多个 mcp 服务
 * @param items
 */
export async function add(items: Array<MCPItem>) {
  await invoke('plugin:mcp:add', { items });
}

/**
 * 根据 ID 移除多个 mcp 服务
 * @param ids
 */
export async function remove(ids: Array<string>) {
  await invoke('plugin:mcp:remove', { ids });
}

export interface McpToolCall {
  /**
   * 所属 mcp 的 ID
   */
  id: string;
  // 方法名称
  name: string;
  // 方法描述
  description: string;
  // 参数的 schema
  parameters: Record<string, any>;
  // 必要的参数
  required: Array<string>;
  // 响应体的 schema
  requestBody: Record<string, any>;
}

/**
 * 获取所有 mcp 服务的 tool_call
 */
export async function getToolCalls() {
  return await invoke<Array<McpToolCall>>('plugin:mcp|get_tool_calls');
}

/**
 * 执行某一个 tool_call
 * @param id - MCP 服务器的 ID
 * @param input - 工具调用参数，包含 name 和 arguments
 * @example
 * ```typescript
 * await executeToolCall('mcp-id', {
 *   name: 'tool_name',
 *   arguments: { param1: 'value1' }
 * })
 * ```
 */
export async function executeToolCall<T = any>(id: string, input: Record<string, any>): Promise<T> {
  return await invoke<T>('plugin:mcp|execute_tool_call', {
    id, input
  });
}