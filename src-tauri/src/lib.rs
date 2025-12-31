use tauri::{
    menu::{Menu, MenuItem},
    tray::TrayIconBuilder,
    Manager,
};
use tauri_plugin_log::{Target, TargetKind};
mod commands {
    use serde::Serialize;
    use std::process::Command;

    #[cfg(target_os = "windows")]
    use std::collections::HashMap;

    #[derive(Debug, Clone, Serialize)]
    pub struct PortUsage {
        pub protocol: String,
        pub local_addr: String,
        pub local_port: u16,
        pub state: Option<String>,
        pub pid: Option<u32>,
        pub process: Option<String>,
    }

    #[tauri::command]
    pub async fn system_port_list() -> Result<Vec<PortUsage>, String> {
        let mut rows = list_port_usage()?;
        rows.sort_by(|a, b| {
            let p = a.local_port.cmp(&b.local_port);
            if p != std::cmp::Ordering::Equal {
                return p;
            }
            let ap = a.protocol.cmp(&b.protocol);
            if ap != std::cmp::Ordering::Equal {
                return ap;
            }
            let aa = a.local_addr.cmp(&b.local_addr);
            if aa != std::cmp::Ordering::Equal {
                return aa;
            }
            a.pid.unwrap_or(0).cmp(&b.pid.unwrap_or(0))
        });
        Ok(rows)
    }

    fn run_command(program: &str, args: &[&str]) -> Result<String, String> {
        let out = Command::new(program)
            .args(args)
            .output()
            .map_err(|e| format!("run {program} failed: {e}"))?;
        if !out.status.success() {
            let code = out.status.code().unwrap_or(-1);
            let stderr = String::from_utf8_lossy(&out.stderr);
            return Err(format!("{program} exited {code}: {stderr}"));
        }
        Ok(String::from_utf8_lossy(&out.stdout).to_string())
    }

    fn parse_addr_port(raw: &str) -> Option<(String, u16)> {
        let s = raw.trim();
        if s.is_empty() {
            return None;
        }
        if let Some(i) = s.rfind("]:") {
            let port_str = &s[(i + 2)..];
            let port = port_str.parse::<u16>().ok()?;
            let addr = s[..(i + 1)].trim_start_matches('[').to_string();
            return Some((addr, port));
        }
        let i = s.rfind(':')?;
        let port_str = &s[(i + 1)..];
        let port = port_str.parse::<u16>().ok()?;
        let addr = s[..i].to_string();
        Some((addr, port))
    }

    #[cfg(target_os = "macos")]
    fn list_port_usage() -> Result<Vec<PortUsage>, String> {
        fn parse_lsof(output: &str) -> Vec<PortUsage> {
            let mut rows = Vec::new();
            for line in output.lines().skip(1) {
                let line = line.trim();
                if line.is_empty() {
                    continue;
                }
                let parts: Vec<&str> = line.split_whitespace().collect();
                if parts.len() < 4 {
                    continue;
                }
                let process = parts.get(0).map(|s| (*s).to_string());
                let pid = parts.get(1).and_then(|s| s.parse::<u32>().ok());
                let proto_index = parts.iter().position(|p| *p == "TCP" || *p == "UDP");
                let Some(i) = proto_index else { continue };
                let protocol = parts[i].to_string();
                let Some(name) = parts.get(i + 1) else { continue };
                let name = name.split("->").next().unwrap_or(name);
                let (local_addr, local_port) = match parse_addr_port(name) {
                    Some(v) => v,
                    None => continue,
                };
                rows.push(PortUsage {
                    protocol,
                    local_addr,
                    local_port,
                    state: None,
                    pid,
                    process,
                });
            }
            rows
        }

        let tcp = run_command("lsof", &["-nP", "-iTCP", "-sTCP:LISTEN"])?;
        let udp = run_command("lsof", &["-nP", "-iUDP"])?;
        let mut rows = parse_lsof(&tcp);
        rows.extend(parse_lsof(&udp));

        let mut seen = std::collections::HashSet::<(String, String, u16, Option<u32>)>::new();
        rows.retain(|r| {
            let k = (r.protocol.clone(), r.local_addr.clone(), r.local_port, r.pid);
            seen.insert(k)
        });
        Ok(rows)
    }

    #[cfg(target_os = "linux")]
    fn list_port_usage() -> Result<Vec<PortUsage>, String> {
        fn parse_ss_process(s: &str) -> (Option<u32>, Option<String>) {
            let pid = s
                .find("pid=")
                .and_then(|i| {
                    let rest = &s[(i + 4)..];
                    let digits: String = rest.chars().take_while(|c| c.is_ascii_digit()).collect();
                    digits.parse::<u32>().ok()
                });
            let process = s.find("(\"").and_then(|i| {
                let rest = &s[(i + 2)..];
                let end = rest.find('"')?;
                Some(rest[..end].to_string())
            });
            (pid, process)
        }

        fn parse_ss(output: &str) -> Vec<PortUsage> {
            let mut rows = Vec::new();
            for line in output.lines() {
                let line = line.trim();
                if line.is_empty() {
                    continue;
                }
                let parts: Vec<&str> = line.split_whitespace().collect();
                if parts.len() < 6 {
                    continue;
                }
                let netid = parts[0];
                let protocol = if netid.starts_with("tcp") {
                    "TCP"
                } else if netid.starts_with("udp") {
                    "UDP"
                } else {
                    continue;
                }
                .to_string();
                let state = Some(parts[1].to_string());
                let local = parts[4].split("->").next().unwrap_or(parts[4]);
                let local = local.split('%').next().unwrap_or(local);
                let (local_addr, local_port) = match parse_addr_port(local) {
                    Some(v) => v,
                    None => continue,
                };
                let process_info = if parts.len() > 6 {
                    parts[6..].join(" ")
                } else {
                    String::new()
                };
                let (pid, process) = parse_ss_process(&process_info);
                rows.push(PortUsage {
                    protocol,
                    local_addr,
                    local_port,
                    state,
                    pid,
                    process,
                });
            }
            rows
        }

        let output = run_command("ss", &["-H", "-lntup"])?;
        Ok(parse_ss(&output))
    }

    #[cfg(target_os = "windows")]
    fn list_port_usage() -> Result<Vec<PortUsage>, String> {
        fn parse_netstat(output: &str) -> Vec<PortUsage> {
            let mut rows = Vec::new();
            for line in output.lines() {
                let line = line.trim();
                if line.is_empty() {
                    continue;
                }
                if line.starts_with("Proto") || line.starts_with("Active") {
                    continue;
                }
                let parts: Vec<&str> = line.split_whitespace().collect();
                if parts.len() < 4 {
                    continue;
                }
                let proto = parts[0];
                let protocol = if proto.eq_ignore_ascii_case("tcp") {
                    "TCP".to_string()
                } else if proto.eq_ignore_ascii_case("udp") {
                    "UDP".to_string()
                } else {
                    continue;
                };
                let local = parts[1];
                let (local_addr, local_port) = match parse_addr_port(
                    local.trim_start_matches('[')
                        .trim_end_matches(']')
                        .trim(),
                ) {
                    Some(v) => v,
                    None => continue,
                };
                let (state, pid) = if protocol == "TCP" && parts.len() >= 5 {
                    (Some(parts[3].to_string()), parts.get(4).and_then(|s| s.parse::<u32>().ok()))
                } else {
                    (None, parts.get(3).and_then(|s| s.parse::<u32>().ok()))
                };
                rows.push(PortUsage {
                    protocol,
                    local_addr,
                    local_port,
                    state,
                    pid,
                    process: None,
                });
            }
            rows
        }

        fn parse_tasklist(output: &str) -> HashMap<u32, String> {
            let mut map = HashMap::new();
            for line in output.lines() {
                let l = line.trim();
                if l.is_empty() {
                    continue;
                }
                if !l.starts_with('"') {
                    continue;
                }
                let trimmed = l.trim_matches('"');
                let parts: Vec<&str> = trimmed.split("\",\"").collect();
                if parts.len() < 2 {
                    continue;
                }
                let name = parts[0].to_string();
                let pid = parts[1].parse::<u32>().ok();
                if let Some(pid) = pid {
                    map.insert(pid, name);
                }
            }
            map
        }

        let tcp = run_command("netstat", &["-ano", "-p", "tcp"])?;
        let udp = run_command("netstat", &["-ano", "-p", "udp"])?;
        let mut rows = parse_netstat(&tcp);
        rows.extend(parse_netstat(&udp));

        let tasklist = run_command("tasklist", &["/FO", "CSV", "/NH"])?;
        let pid_name = parse_tasklist(&tasklist);
        for r in rows.iter_mut() {
            if let Some(pid) = r.pid {
                if let Some(name) = pid_name.get(&pid) {
                    r.process = Some(name.clone());
                }
            }
        }

        Ok(rows)
    }

    #[cfg(not(any(target_os = "macos", target_os = "linux", target_os = "windows")))]
    fn list_port_usage() -> Result<Vec<PortUsage>, String> {
        Ok(Vec::new())
    }
}

use commands::system_port_list;


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_log::Builder::new()
                .level(tauri_plugin_log::log::LevelFilter::Info)
                .build(),
        )
        // 注册所有命令（现在从 commands 模块导入）
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(
            tauri_plugin_log::Builder::new()
                .targets([
                    Target::new(TargetKind::Stdout),
                    Target::new(TargetKind::LogDir { file_name: None }),
                    Target::new(TargetKind::Webview),
                ])
                .level(log::LevelFilter::Info)
                .build(),
        )
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![system_port_list])
        .setup(|app| {
            let show_i = MenuItem::with_id(app, "show", "显示", true, None::<&str>)?;
            let quit_i = MenuItem::with_id(app, "quit", "关闭", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show_i, &quit_i])?;

            TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .show_menu_on_left_click(true)
                .on_menu_event(|app: &tauri::AppHandle, event| match event.id.as_ref() {
                    "show" => {
                        app.get_webview_window("main").unwrap().show().unwrap();
                    }
                    "quit" => {
                        app.exit(0);
                    }
                    _ => {
                        println!("menu item {:?} not handled", event.id);
                    }
                })
                .build(app)?;

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
