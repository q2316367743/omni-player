use serde::Deserialize;
use std::process::Command;
use std::path::Path;
use once_cell::sync::OnceCell;

static BREW_PATH: OnceCell<Option<String>> = OnceCell::new();

fn detect_brew_path() -> Option<String> {
    // 按优先级检查常见路径
    for path in [
        "/opt/homebrew/bin/brew",      // Apple Silicon (M1/M2/M3)
        "/usr/local/bin/brew",         // Intel Mac
        "/home/linuxbrew/.linuxbrew/bin/brew", // Linux
    ] {
        if Path::new(path).exists() {
            return Some(path.to_string());
        }
    }
    None
}

/// 获取 brew 可执行文件的绝对路径（惰性、线程安全）
pub fn get_brew_executable() -> Option<&'static str> {
    BREW_PATH
        .get_or_init(|| detect_brew_path())
        .as_deref()
}

pub fn is_brew_available() -> bool {
    if let Some(brew_path) = get_brew_executable() {
        Command::new(brew_path)
            .arg("--version")
            .output()
            .map(|out| out.status.success())
            .unwrap_or(false)
    } else {
        false
    }
}

pub fn run_brew(args: &[&str]) -> Result<String, String> {
    let brew_path = get_brew_executable().ok_or("Homebrew not found")?;
    let output = Command::new(brew_path)
        .args(args)
        .output()
        .map_err(|e| format!("Failed to execute brew: {}", e))?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        Err(format!("brew command failed: {}", stderr))
    }
}

// JSON v2 格式的内部结构（只取需要的字段）
#[derive(Deserialize)]
pub struct BrewPackageV2 {
    name: String,
    desc: Option<String>,
    installed: Vec<BrewInstalledVersion>,
    #[serde(rename = "type")]
    pkg_type: String, // "formula" 或 "cask"
}

#[derive(Deserialize)]
pub struct BrewInstalledVersion {
    version: String,
}

pub fn get_installed_packages() -> Result<Vec<crate::models::HomebrewItem>, String> {
    let brew_path = get_brew_executable().ok_or("Homebrew not found")?;
    let output = Command::new(brew_path)
        .args(["info", "--json=v2", "--installed"])
        .output()
        .map_err(|e| format!("Failed to run brew info: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("brew info failed: {}", stderr));
    }

    let json_str =
        String::from_utf8(output.stdout).map_err(|e| format!("Invalid UTF-8 from brew: {}", e))?;

    let packages: Vec<BrewPackageV2> =
        serde_json::from_str(&json_str).map_err(|e| format!("Failed to parse brew JSON: {}", e))?;

    let items: Vec<crate::models::HomebrewItem> = packages
        .into_iter()
        .filter_map(|pkg| {
            // 取第一个安装版本（通常只有一个）
            let version = pkg.installed.first().map(|v| v.version.clone());
            let item_type = match pkg.pkg_type.as_str() {
                "formula" => crate::models::HomebrewItemType::Formula,
                "cask" => crate::models::HomebrewItemType::Cask,
                _ => return None, // 忽略未知类型
            };

            Some(crate::models::HomebrewItem {
                name: pkg.name,
                description: pkg.desc.unwrap_or_default(),
                item_type,
                version, // ✅ 包含版本
            })
        })
        .collect();

    Ok(items)
}

// ✅ 正确的 JSON 结构（匹配 brew info --json=v2 输出）
#[derive(Deserialize)]
pub struct BrewPackageInfo {
    pub name: String,
    pub desc: Option<String>,
    #[serde(rename = "type")]
    pub pkg_type: String,
    // 注意：字段是 versions（复数），不是 version
    #[serde(default)]
    pub versions: Option<Vec<String>>, // 可能为空（极少数情况）
}


// ✅ 公共辅助函数：执行 brew info --json=v2 并解析
pub fn run_brew_info_v2(names: &[String]) -> Result<Vec<BrewPackageInfo>, String> {
    if names.is_empty() {
        return Ok(vec![]);
    }
    let brew_path = get_brew_executable().ok_or("Homebrew not found")?;

    let mut cmd = Command::new(brew_path);
    cmd.arg("info").arg("--json=v2");
    for name in names {
        cmd.arg(name);
    }

    let output = cmd.output().map_err(|e| format!("Failed to execute brew: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("brew info failed: {}", stderr));
    }

    let stdout = String::from_utf8(output.stdout)
        .map_err(|_| "brew output is not valid UTF-8".to_string())?;

    // 解析 JSON
    let packages: Vec<BrewPackageInfo> = serde_json::from_str(&stdout)
        .map_err(|e| format!("Failed to parse brew JSON: {}", e))?;

    Ok(packages)
}