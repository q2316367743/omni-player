use serde::{Deserialize, Serialize};

// plugins/homebrew/src/models.rs
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct HomebrewItem {
    pub name: String,
    pub description: String,
    #[serde(rename = "type")]
    pub item_type: HomebrewItemType,
    pub version: Option<String>, // 搜索时 = 最新版本；已安装列表 = 已安装版本
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub enum HomebrewItemType {
    Formula,
    Cask,
}
#[derive(Deserialize)]
pub struct InstallOptions {
    pub cask: Option<bool>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct OutdatedItem {
    pub name: String,
    #[serde(rename = "type")]
    pub item_type: HomebrewItemType,
    #[serde(rename = "current_version")]
    pub current_version: String,
    #[serde(rename = "latest_version")]
    pub latest_version: String,
}
