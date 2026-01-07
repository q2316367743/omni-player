use crate::{models::*, utils::*};
use once_cell::sync::Lazy;
use serde::{Deserialize, Serialize};
use std::{
    collections::HashMap,
    collections::HashSet,
    io::{BufRead, BufReader},
    process::{Child, Command, Stdio},
    sync::Mutex,
    thread,
    time::Duration,
};
use tauri::{command, Emitter};

#[command]
pub async fn is_available() -> Result<bool, String> {
    Ok(is_brew_available())
}

static BREW_RUNNING: Lazy<Mutex<HashMap<String, Child>>> = Lazy::new(|| Mutex::new(HashMap::new()));

const EVENT_PROGRESS: &str = "homebrew://progress";
const EVENT_COMPLETE: &str = "homebrew://complete";

#[derive(Serialize, Clone)]
struct BrewProgressEvent {
    #[serde(rename = "opId")]
    op_id: String,
    stream: String,
    line: String,
}

#[derive(Serialize, Clone)]
struct BrewCompleteEvent {
    #[serde(rename = "opId")]
    op_id: String,
    success: bool,
    #[serde(rename = "exitCode")]
    exit_code: Option<i32>,
}

fn run_brew_with_progress(
    window: &tauri::Window,
    op_id: &str,
    args: &[String],
) -> Result<(), String> {
    let brew_path = get_brew_executable().ok_or("Homebrew not found")?;
    let mut cmd = Command::new(brew_path);
    cmd.args(args)
        .stdin(Stdio::null())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());

    let mut child = cmd.spawn().map_err(|e| e.to_string())?;
    let stdout = child.stdout.take().ok_or("Failed to capture stdout")?;
    let stderr = child.stderr.take().ok_or("Failed to capture stderr")?;

    {
        let mut map = BREW_RUNNING.lock().map_err(|_| "Process map poisoned".to_string())?;
        map.insert(op_id.to_string(), child);
    }

    let window_stdout = window.clone();
    let op_stdout = op_id.to_string();
    let stdout_thread = thread::spawn(move || {
        let reader = BufReader::new(stdout);
        for line in reader.lines().flatten() {
            let _ = window_stdout.emit(
                EVENT_PROGRESS,
                BrewProgressEvent {
                    op_id: op_stdout.clone(),
                    stream: "stdout".into(),
                    line,
                },
            );
        }
    });

    let window_stderr = window.clone();
    let op_stderr = op_id.to_string();
    let stderr_thread = thread::spawn(move || {
        let reader = BufReader::new(stderr);
        for line in reader.lines().flatten() {
            let _ = window_stderr.emit(
                EVENT_PROGRESS,
                BrewProgressEvent {
                    op_id: op_stderr.clone(),
                    stream: "stderr".into(),
                    line,
                },
            );
        }
    });

    let status = loop {
        {
            let mut map = BREW_RUNNING.lock().map_err(|_| "Process map poisoned".to_string())?;
            let child = map.get_mut(op_id).ok_or("Process not found")?;
            if let Some(status) = child.try_wait().map_err(|e| e.to_string())? {
                map.remove(op_id);
                break status;
            }
        }
        thread::sleep(Duration::from_millis(120));
    };

    let _ = stdout_thread.join();
    let _ = stderr_thread.join();

    let success = status.success();
    let exit_code = status.code();
    let _ = window.emit(
        EVENT_COMPLETE,
        BrewCompleteEvent {
            op_id: op_id.to_string(),
            success,
            exit_code,
        },
    );

    if success {
        Ok(())
    } else {
        Err(format!("brew command failed (exit code: {:?})", exit_code))
    }
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

    let mut names: Vec<String> = String::from_utf8_lossy(&output.stdout)
        .lines()
        .filter_map(|line| {
            line.split_once(':')
                .map(|(name, _)| name.trim().to_string())
        })
        .collect();

    if names.is_empty() {
        return Ok(vec![]);
    }

    let mut seen = HashSet::new();
    names.retain(|n| seen.insert(n.clone()));
    names.truncate(160);

    let mut all = Vec::new();
    for chunk in names.chunks(40) {
        match crate::utils::run_brew_info_v2(chunk) {
            Ok(mut items) => all.append(&mut items),
            Err(_) => {
                for name in chunk {
                    let single = vec![name.clone()];
                    if let Ok(mut items) = crate::utils::run_brew_info_v2(&single) {
                        all.append(&mut items);
                    }
                }
            }
        }
    }

    Ok(all)
}

#[command]
pub async fn install(
    window: tauri::Window,
    name: String,
    opts: Option<InstallOptions>,
    op_id: Option<String>,
) -> Result<(), String> {
    let mut args: Vec<String> = vec!["install".into()];
    if opts.and_then(|o| o.cask).unwrap_or(false) {
        args.push("--cask".into());
    }
    args.push(name);
    if let Some(op_id) = op_id {
        run_brew_with_progress(&window, &op_id, &args)?;
        return Ok(());
    }

    let args_ref: Vec<&str> = args.iter().map(|s| s.as_str()).collect();
    run_brew(&args_ref)?;
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

#[command]
pub async fn list_installed() -> Result<Vec<HomebrewItem>, String> {
    crate::utils::get_installed_packages()
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

    let stdout =
        String::from_utf8(output.stdout).map_err(|_| "Invalid UTF-8 from brew".to_string())?;

    // 空输出表示无过期包
    if stdout.trim().is_empty() {
        return Ok(vec![]);
    }

    // 🔥 关键修复：解析为正确结构，而非 Vec
    let outdated_info: BrewOutdatedV2 = serde_json::from_str(&stdout).map_err(|e| {
        format!(
            "Failed to parse outdated JSON: {}. Raw: {}",
            e,
            &stdout[..std::cmp::min(100, stdout.len())]
        )
    })?;

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
pub async fn upgrade(window: tauri::Window, name: String, op_id: Option<String>) -> Result<(), String> {
    let args: Vec<String> = vec!["upgrade".into(), name];
    if let Some(op_id) = op_id {
        run_brew_with_progress(&window, &op_id, &args)?;
        return Ok(());
    }
    let args_ref: Vec<&str> = args.iter().map(|s| s.as_str()).collect();
    run_brew(&args_ref)?;
    Ok(())
}

#[command]
pub async fn cancel_operation(op_id: String) -> Result<(), String> {
    let mut map = BREW_RUNNING.lock().map_err(|_| "Process map poisoned".to_string())?;
    let child = map.get_mut(&op_id).ok_or("Process not found")?;
    child.kill().map_err(|e| e.to_string())?;
    Ok(())
}
