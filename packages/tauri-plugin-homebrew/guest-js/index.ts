import {invoke} from '@tauri-apps/api/core'

export const HOMEBREW_PROGRESS_EVENT = 'homebrew://progress'
export const HOMEBREW_COMPLETE_EVENT = 'homebrew://complete'

/**
 * 是否安装 brew
 */
export function isAvailable(): Promise<boolean> {
  return invoke("plugin:homebrew|is_available");
}

export type HomebrewItemType = 'Formula' | 'Cask';

export interface HomebrewItem {
  name: string;
  description: string;
  type: HomebrewItemType;
  version: string
}

/**
 * 搜索软件包
 * @param keyword 关键字
 */
export function search(keyword: string): Promise<Array<HomebrewItem>> {
  return invoke("plugin:homebrew|search", { keyword });
}

export interface HomebrewInstallOption {
  cask: boolean
}

/**
 * 安装软件包
 * @param name 软件包名
 * @param opts 安装选项
 * @param opId 操作 ID（用于进度事件过滤）
 */
export function install(name: string, opts?: HomebrewInstallOption, opId?: string): Promise<void> {
  return invoke("plugin:homebrew|install", { name, opts, op_id: opId });
}

/**
 * 卸载软件包
 * @param name 软件包名
 */
export function uninstall(name: string): Promise<void> {
  return invoke("plugin:homebrew|uninstall", { name });
}

/**
 * 列出已安装软件包
 */
export function listInstalled(): Promise<Array<HomebrewItem>> {
  return invoke("plugin:homebrew|list_installed");
}

export interface HomebrewOutdatedItem {
  name: string;
  type: HomebrewItemType;
  current_version: string;
  latest_version: string;
}

export function listOutdated(): Promise<Array<HomebrewOutdatedItem>> {
  return invoke("plugin:homebrew|list_outdated");
}

/**
 * 升级软件包
 * @param name 软件包名
 * @param opId 操作 ID（用于进度事件过滤）
 */
export function upgrade(name: string, opId?: string): Promise<void> {
  return invoke("plugin:homebrew|upgrade", {name, op_id: opId});
}

/**
 * 取消安装/升级
 * @param opId 操作 ID
 */
export function cancelOperation(opId: string): Promise<void> {
  return invoke("plugin:homebrew|cancel_operation", {op_id: opId});
}
