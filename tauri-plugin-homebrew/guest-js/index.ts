import {invoke} from '@tauri-apps/api/core'

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
 */
export function install(name: string, opts?: HomebrewInstallOption): Promise<void> {
  return invoke("plugin:homebrew|install", { name, opts });
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
 */
export function upgrade(name: string): Promise<string | undefined> {
  return invoke("plugin:homebrew|upgrade", {name});
}