use std::path::Path;
use std::process::Command;

#[tauri::command]
pub async fn launch_potplayer(exe_path: String, url: String) -> Result<(), String> {
    let exe_path = exe_path.trim().trim_matches('"').to_string();
    let url = url.trim().to_string();

    if exe_path.is_empty() {
        return Err("potplayer 可执行文件路径不能为空".to_string());
    }
    if url.is_empty() {
        return Err("url 不能为空".to_string());
    }

    let exe = Path::new(&exe_path);
    if !exe.exists() {
        return Err(format!("potplayer 可执行文件不存在: {}", exe_path));
    }
    if !exe.is_file() {
        return Err(format!("potplayer 路径不是文件: {}", exe_path));
    }

    Command::new(exe)
        .arg(&url)
        .spawn()
        .map_err(|e| e.to_string())?;

    Ok(())
}
