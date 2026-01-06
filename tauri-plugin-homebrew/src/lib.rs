use tauri::{
    plugin::{Builder, TauriPlugin},
    Runtime,
};
use crate::commands::*;

pub mod commands;
pub mod models;
pub mod utils;

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("homebrew")
        .invoke_handler(tauri::generate_handler![
            // 是否安装 brew
            is_available,
            // 搜索软件包
            search,
            // 安装软件包
            install,
            // 卸载软件版
            uninstall,
            // 列出已安装软件包
            list_installed,
            // 列出已更新软件包
            list_outdated,
            // 升级软件包
            upgrade
            // 可添加 services_start, list, upgrade 等
        ])
        .build()
}