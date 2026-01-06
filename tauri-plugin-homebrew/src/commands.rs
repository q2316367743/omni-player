use serde::Deserialize;
use tauri::command;
use crate::{models::*, utils::*};

// ✅ 1. 修复：is_available 必须返回 Result<bool, String>
#[command]
pub async fn is_available() -> Result<bool, String> {
    Ok(is_brew_available())
}

#[command]
pub async fn search(keyword: String) -> Result<Vec<HomebrewItem>, String> {
    if !is_brew_available() {
        return Err("Homebrew is not installed".into());
    }
    let brew_path = get_brew_executable().ok_or("Homebrew not found")?;

    // Step 1: 搜索包名
    let output = std::process::Command::new(brew_path)
        .args(["search", "--desc", &keyword])
        .output()
        .map_err(|e| e.to_string())?;

    if !output.status.success() {
        return Err("brew search failed".into());
    }

    let names: Vec<String> = String::from_utf8_lossy(&output.stdout)
        .lines()
        .filter_map(|line| line.split_once(':').map(|(name, _)| name.trim().to_string()))
        .collect();

    if names.is_empty() {
        return Ok(vec![]);
    }

    // Step 2: 获取详细信息（包括 versions）
    let packages = crate::utils::run_brew_info_v2(&names)?;

    // Step 3: 转换为 HomebrewItem，并提取最新版本
    let items: Vec<HomebrewItem> = packages
        .into_iter()
        .map(|pkg| {
            // ✅ 从 versions[0] 提取最新版本
            let latest_version = pkg.versions
                .as_ref()
                .and_then(|v| v.first())
                .cloned();

            HomebrewItem {
                name: pkg.name,
                description: pkg.desc.unwrap_or_default(),
                item_type: match pkg.pkg_type.as_str() {
                    "formula" => HomebrewItemType::Formula,
                    "cask" => HomebrewItemType::Cask,
                    _ => HomebrewItemType::Formula,
                },
                version: latest_version,
            }
        })
        .collect();

    Ok(items)
}

#[command]
pub async fn install(name: String, opts: InstallOptions) -> Result<(), String> {
    let mut args = vec!["install"];
    if opts.cask.unwrap_or(false) {
        args.push("--cask");
    }
    args.push(&name);
    run_brew(&args)?;
    Ok(())
}

#[command]
pub async fn uninstall(name: String) -> Result<(), String> {
    // 先判断是 formula 还是 cask（简化：尝试 uninstall，失败再试 --cask）
    if run_brew(&["uninstall", &name]).is_err() {
        run_brew(&["uninstall", "--cask", &name])?;
    }
    Ok(())
}

#[derive(Deserialize)]
struct BrewInfoV2 {
    formulae: Vec<FormulaInfo>,
    casks: Vec<CaskInfo>,
}

#[derive(Deserialize)]
struct FormulaInfo {
    name: String,
    desc: Option<String>,
    // ❌ 不要加 type 字段！formula 没有这个字段
    installed: Vec<InstalledVersion>,
}

#[derive(Deserialize)]
struct CaskInfo {
    token: String,
    desc: Option<String>,
    #[serde(rename = "type")] // ✅ cask 有 type 字段
    pkg_type: String,          // 实际值是 "cask"
    installed: Vec<InstalledVersion>,
}

#[derive(Deserialize)]
struct InstalledVersion {
    version: String,
}

#[command]
pub async fn list_installed() -> Result<Vec<HomebrewItem>, String> {
    let brew_path = get_brew_executable().ok_or("Homebrew not found")?;
    let output = std::process::Command::new(brew_path)
        .args(["info", "--json=v2", "--installed"])
        .output()
        .map_err(|e| e.to_string())?;

    if !output.status.success() {
        return Err("brew info --installed failed".into());
    }

    let json_str = String::from_utf8(output.stdout).map_err(|_| "Invalid UTF-8".to_string())?;

    // 🔍 关键：打印原始 JSON 用于调试（可选，上线前可移除）
    // println!("Raw JSON from brew:\n{}", json_str);

    let brew_info: BrewInfoV2 = serde_json::from_str(&json_str)
        .map_err(|e| format!("JSON parse error: {}. Raw JSON starts with: {}", e, &json_str[..std::cmp::min(100, json_str.len())]))?;

    let mut items = Vec::new();

    // 处理 formulae
    for f in brew_info.formulae {
        let version = f.installed.first().map(|v| v.version.clone());
        items.push(HomebrewItem {
            name: f.name,
            description: f.desc.unwrap_or_default(),
            item_type: HomebrewItemType::Formula,
            version,
        });
    }

    // 处理 casks
    for c in brew_info.casks {
        let version = c.installed.first().map(|v| v.version.clone());
        items.push(HomebrewItem {
            name: c.token, // cask 使用 token 作为名称
            description: c.desc.unwrap_or_default(),
            item_type: HomebrewItemType::Cask,
            version,
        });
    }

    Ok(items)
}

#[derive(Deserialize)]
struct BrewOutdatedV2 {
    formulae: Vec<OutdatedFormula>,
    casks: Vec<OutdatedCask>,
}

#[derive(Deserialize)]
struct OutdatedFormula {
    name: String,
    installed_versions: Vec<String>,
    current_version: String,
    // 其他字段可按需添加
}

#[derive(Deserialize)]
struct OutdatedCask {
    token: String,
    installed_versions: Vec<String>,
    current_version: String,
}
#[command] // ✅ 修复：统一使用 #[command]
pub async fn list_outdated() -> Result<Vec<OutdatedItem>, String> {
    if !is_brew_available() {
        return Err("Homebrew is not installed".into());
    }

    let brew_path = get_brew_executable().ok_or("Homebrew not found")?;
    let output = std::process::Command::new(brew_path)
        .args(["outdated", "--json=v2"])
        .output()
        .map_err(|e| format!("Failed to run brew outdated: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("brew outdated failed: {}", stderr));
    }

    let stdout = String::from_utf8(output.stdout)
        .map_err(|_| "Invalid UTF-8 from brew".to_string())?;

    // 空输出表示无过期包
    if stdout.trim().is_empty() {
        return Ok(vec![]);
    }

    // 🔥 关键修复：解析为正确结构，而非 Vec
    let outdated_info: BrewOutdatedV2 = serde_json::from_str(&stdout)
        .map_err(|e| format!("Failed to parse outdated JSON: {}. Raw: {}", e, &stdout[..std::cmp::min(100, stdout.len())]))?;

    let mut items = Vec::new();

    // 处理 formulae
    for f in outdated_info.formulae {
        if let Some(installed) = f.installed_versions.first() {
            items.push(OutdatedItem {
                name: f.name,
                current_version: installed.clone(),
                latest_version: f.current_version,
                item_type: HomebrewItemType::Formula,
            });
        }
    }

    // 处理 casks
    for c in outdated_info.casks {
        if let Some(installed) = c.installed_versions.first() {
            items.push(OutdatedItem {
                name: c.token,
                current_version: installed.clone(),
                latest_version: c.current_version,
                item_type: HomebrewItemType::Cask,
            });
        }
    }

    Ok(items)
}

#[command]
pub async fn upgrade(name: String) -> Result<(), String> {
    let brew_path = get_brew_executable().ok_or("Homebrew not found")?;
    let output = std::process::Command::new(brew_path)
        .args(["upgrade", &name])
        .output()
        .map_err(|e| e.to_string())?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(stderr.into());
    }

    Ok(())
}
