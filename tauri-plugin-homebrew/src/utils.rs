use once_cell::sync::OnceCell;
use serde::Deserialize;
use std::path::Path;
use std::process::Command;

static BREW_PATH: OnceCell<Option<String>> = OnceCell::new();

fn detect_brew_path() -> Option<String> {
    // 按优先级检查常见路径
    for path in [
        "/opt/homebrew/bin/brew",              // Apple Silicon (M1/M2/M3)
        "/usr/local/bin/brew",                 // Intel Mac
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
    BREW_PATH.get_or_init(detect_brew_path).as_deref()
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

#[derive(Deserialize)]
struct BrewInfoInstalledV2 {
    #[serde(default)]
    formulae: Vec<BrewInstalledFormulaV2>,
    #[serde(default)]
    casks: Vec<BrewInstalledCaskV2>,
}

#[derive(Deserialize)]
struct BrewInstalledFormulaV2 {
    name: String,
    desc: Option<String>,
    #[serde(default)]
    installed: BrewInstalledField,
}

#[derive(Deserialize)]
struct BrewInstalledCaskV2 {
    token: String,
    desc: Option<String>,
    #[serde(default)]
    installed: BrewInstalledField,
}

#[derive(Deserialize)]
struct BrewInstalledVersion {
    version: String,
}

#[derive(Deserialize, Default)]
#[serde(untagged)]
enum BrewInstalledField {
    Versions(Vec<BrewInstalledVersion>),
    VersionStrings(Vec<String>),
    VersionString(String),
    #[default]
    None,
}

fn first_installed_version(installed: &BrewInstalledField) -> Option<String> {
    match installed {
        BrewInstalledField::Versions(v) => v.first().map(|e| e.version.clone()),
        BrewInstalledField::VersionStrings(v) => v.first().cloned(),
        BrewInstalledField::VersionString(v) => Some(v.clone()),
        BrewInstalledField::None => None,
    }
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

    let info: BrewInfoInstalledV2 =
        serde_json::from_str(&json_str).map_err(|e| format!("Failed to parse brew JSON: {}", e))?;

    let mut items: Vec<crate::models::HomebrewItem> = Vec::new();

    for pkg in info.formulae {
        let version = first_installed_version(&pkg.installed);
        items.push(crate::models::HomebrewItem {
            name: pkg.name,
            description: pkg.desc.unwrap_or_default(),
            item_type: crate::models::HomebrewItemType::Formula,
            version,
        });
    }

    for pkg in info.casks {
        let version = first_installed_version(&pkg.installed);
        items.push(crate::models::HomebrewItem {
            name: pkg.token,
            description: pkg.desc.unwrap_or_default(),
            item_type: crate::models::HomebrewItemType::Cask,
            version,
        });
    }

    Ok(items)
}

#[derive(Deserialize)]
struct BrewInfoQueryV2 {
    #[serde(default)]
    formulae: Vec<BrewQueryFormulaV2>,
    #[serde(default)]
    casks: Vec<BrewQueryCaskV2>,
}

#[derive(Deserialize)]
struct BrewQueryFormulaV2 {
    name: String,
    desc: Option<String>,
    #[serde(default)]
    versions: BrewQueryFormulaVersionsV2,
}

#[derive(Deserialize, Default)]
struct BrewQueryFormulaVersionsV2 {
    #[serde(default)]
    stable: Option<String>,
}

#[derive(Deserialize)]
struct BrewQueryCaskV2 {
    token: String,
    desc: Option<String>,
    version: Option<String>,
}

// ✅ 公共辅助函数：执行 brew info --json=v2 并解析
pub fn run_brew_info_v2(names: &[String]) -> Result<Vec<crate::models::HomebrewItem>, String> {
    if names.is_empty() {
        return Ok(vec![]);
    }
    let brew_path = get_brew_executable().ok_or("Homebrew not found")?;

    let mut cmd = Command::new(brew_path);
    cmd.arg("info").arg("--json=v2");
    for name in names {
        cmd.arg(name);
    }

    let output = cmd
        .output()
        .map_err(|e| format!("Failed to execute brew: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("brew info failed: {}", stderr));
    }

    let stdout = String::from_utf8(output.stdout)
        .map_err(|_| "brew output is not valid UTF-8".to_string())?;

    let info: BrewInfoQueryV2 =
        serde_json::from_str(&stdout).map_err(|e| format!("Failed to parse brew JSON: {}", e))?;

    let mut items: Vec<crate::models::HomebrewItem> = Vec::new();

    for pkg in info.formulae {
        items.push(crate::models::HomebrewItem {
            name: pkg.name,
            description: pkg.desc.unwrap_or_default(),
            item_type: crate::models::HomebrewItemType::Formula,
            version: pkg.versions.stable,
        });
    }

    for pkg in info.casks {
        items.push(crate::models::HomebrewItem {
            name: pkg.token,
            description: pkg.desc.unwrap_or_default(),
            item_type: crate::models::HomebrewItemType::Cask,
            version: pkg.version,
        });
    }

    Ok(items)
}
