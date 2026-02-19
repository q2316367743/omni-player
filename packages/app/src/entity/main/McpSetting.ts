import type {BaseEntity} from "@/entity/BaseEntity.ts";
import {logError} from "@/lib/log.ts";
import type {YesOrNo} from "@/global/YesOrNo.ts";

export interface McpSettingCore {
  // 标签
  label: string;
  // 名称
  name: string;
  // 描述
  description: string;
  // 参数，字符串数组
  args: string;
  // 命令
  command: string;
  // 环境变量
  env: string;
  is_enabled: YesOrNo;
}

/**
 * MCP 设置
 */
export interface McpSetting extends BaseEntity, McpSettingCore {
}

export interface McpSettingViewCore {
  // 标签
  label: string;
  // 名称
  name: string;
  // 描述
  description: string;
  // 参数，字符串数组
  args: Array<string>;
  // 命令
  command: string;
  // 环境变量
  env: Record<string, string>;
  is_enabled: boolean;
}

export interface McpSettingView extends BaseEntity, McpSettingViewCore {
  loading?: boolean;
}

export function buildMcpSettingView(data: McpSetting): McpSettingView {
  let args = [];
  let env = {};
  try {
    const a = JSON.parse(data.args);
    if (Array.isArray(a)) {
      args = a;
    }
  } catch (e) {
    logError('Failed to parse args:', e)
  }
  try {
    const e = JSON.parse(data.env);
    if (typeof e === 'object') {
      env = e;
    }
  } catch (e) {
    logError('Failed to parse env:', e)
  }
  return {
    ...data,
    args, env,
    is_enabled: data.is_enabled !== 0
  }
}

export function buildMcpViewToCoreUpdate(data: Partial<McpSettingViewCore>): Partial<McpSettingCore> {
  return {
    ...data,
    args: data.args ? JSON.stringify(data.args) : undefined,
    env: data.env ? JSON.stringify(data.env) : undefined,
    is_enabled: typeof data.is_enabled === 'undefined' ? undefined : data.is_enabled ? 1 : 0
  }
}

export function buildMcpViewToCoreAdd(data: McpSettingViewCore): McpSettingCore {
  return {
    ...data,
    args: JSON.stringify(data.args),
    env: JSON.stringify(data.env),
    is_enabled: data.is_enabled ? 1 : 0
  }
}