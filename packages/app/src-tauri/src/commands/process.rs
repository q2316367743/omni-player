use crate::commands::exec::{run_command, run_output};
use serde::Serialize;
#[cfg(target_os = "windows")]
use serde::Deserialize;
use std::time::Duration;

#[derive(Debug, Clone, Serialize)]
pub struct ProcessDetail {
    pub pid: u32,
    pub ppid: Option<u32>,
    pub user: Option<String>,
    pub elapsed: Option<String>,
    pub name: Option<String>,
    pub command: Option<String>,
}

#[tauri::command]
pub async fn system_process_detail(pid: u32) -> Result<ProcessDetail, String> {
    get_process_detail(pid)
}

#[tauri::command]
pub async fn system_process_kill(pid: u32) -> Result<(), String> {
    kill_process(pid)
}

#[cfg(any(target_os = "macos", target_os = "linux"))]
fn get_process_detail(pid: u32) -> Result<ProcessDetail, String> {
    let pid_s = pid.to_string();
    let base = run_command("ps", &["-p", &pid_s, "-o", "pid=,ppid=,user=,etime=,comm="])?;
    let base_line = base
        .lines()
        .find(|l| !l.trim().is_empty())
        .ok_or("process not found")?;
    let parts: Vec<&str> = base_line.split_whitespace().collect();
    if parts.len() < 5 {
        return Err("parse ps output failed".to_string());
    }
    let pid_v = parts[0].parse::<u32>().unwrap_or(pid);
    let ppid = parts[1].parse::<u32>().ok();
    let user = Some(parts[2].to_string());
    let elapsed = Some(parts[3].to_string());
    let name = Some(parts[4].to_string());

    let args = run_command("ps", &["-p", &pid_s, "-o", "args="]).ok();
    let command = args.and_then(|s| {
        let v = s.trim().to_string();
        if v.is_empty() { None } else { Some(v) }
    });

    Ok(ProcessDetail {
        pid: pid_v,
        ppid,
        user,
        elapsed,
        name,
        command,
    })
}

#[cfg(target_os = "windows")]
fn get_process_detail(pid: u32) -> Result<ProcessDetail, String> {
    #[derive(Debug, Deserialize)]
    struct Win32Proc {
        #[serde(rename = "ProcessId")]
        process_id: u32,
        #[serde(rename = "ParentProcessId")]
        parent_process_id: u32,
        #[serde(rename = "Name")]
        name: String,
        #[serde(rename = "CommandLine")]
        command_line: Option<String>,
    }

    let script = format!(
        "Get-CimInstance Win32_Process -Filter \"ProcessId={}\" | Select-Object ProcessId,ParentProcessId,Name,CommandLine | ConvertTo-Json -Compress",
        pid
    );
    let out = run_command("powershell", &["-NoProfile", "-Command", &script])?;
    let raw = out.trim();
    if raw.is_empty() {
        return Err("process not found".to_string());
    }
    let json: serde_json::Value =
        serde_json::from_str(raw).map_err(|e| format!("parse powershell output failed: {e}"))?;
    let v = if json.is_array() {
        json.get(0).cloned().ok_or("process not found")?
    } else {
        json
    };
    let p: Win32Proc =
        serde_json::from_value(v).map_err(|e| format!("parse process detail failed: {e}"))?;

    Ok(ProcessDetail {
        pid: p.process_id,
        ppid: Some(p.parent_process_id),
        user: None,
        elapsed: None,
        name: Some(p.name),
        command: p.command_line.and_then(|s| {
            let v = s.trim().to_string();
            if v.is_empty() { None } else { Some(v) }
        }),
    })
}

#[cfg(not(any(target_os = "macos", target_os = "linux", target_os = "windows")))]
fn get_process_detail(pid: u32) -> Result<ProcessDetail, String> {
    Ok(ProcessDetail {
        pid,
        ppid: None,
        user: None,
        elapsed: None,
        name: None,
        command: None,
    })
}

#[cfg(any(target_os = "macos", target_os = "linux"))]
fn kill_process(pid: u32) -> Result<(), String> {
    let pid_s = pid.to_string();
    let term = run_output("kill", &["-TERM", &pid_s])?;
    if !term.status.success() {
        let stderr = String::from_utf8_lossy(&term.stderr);
        if !stderr.to_lowercase().contains("no such process") {
            return Err(format!("kill -TERM failed: {}", stderr.trim()));
        }
    }

    std::thread::sleep(Duration::from_millis(500));
    let alive = run_output("kill", &["-0", &pid_s])
        .ok()
        .map(|o| o.status.success())
        .unwrap_or(false);
    if alive {
        let kill = run_output("kill", &["-KILL", &pid_s])?;
        if !kill.status.success() {
            let stderr = String::from_utf8_lossy(&kill.stderr);
            if !stderr.to_lowercase().contains("no such process") {
                return Err(format!("kill -KILL failed: {}", stderr.trim()));
            }
        }
    }
    Ok(())
}

#[cfg(target_os = "windows")]
fn kill_process(pid: u32) -> Result<(), String> {
    let pid_s = pid.to_string();
    let out = run_output("taskkill", &["/PID", &pid_s, "/T"])?;
    if out.status.success() {
        return Ok(());
    }
    let out_force = run_output("taskkill", &["/PID", &pid_s, "/T", "/F"])?;
    if out_force.status.success() {
        return Ok(());
    }
    let stderr = String::from_utf8_lossy(&out_force.stderr);
    Err(format!("taskkill failed: {}", stderr.trim()))
}

#[cfg(not(any(target_os = "macos", target_os = "linux", target_os = "windows")))]
fn kill_process(_pid: u32) -> Result<(), String> {
    Err("unsupported platform".to_string())
}
