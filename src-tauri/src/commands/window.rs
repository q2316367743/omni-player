// src-tauri/src/commands/window.rs
use tauri::{Manager, Url, WebviewUrl, WebviewWindowBuilder};

#[derive(serde::Deserialize)]
pub struct WindowOptions {
    pub label: String,
    pub url: Option<String>,
    pub title: Option<String>,
    pub width: Option<f64>,
    pub height: Option<f64>,
    pub resizable: Option<bool>,
    pub fullscreen: Option<bool>,
    pub transparent: Option<bool>,
}

#[tauri::command]
pub async fn create_tauri_window(
    app: tauri::AppHandle,
    options: WindowOptions,
) -> Result<(), String> {
    if let Some(existing) = app.get_webview_window(&options.label) {
        existing.show().map_err(|e| e.to_string())?;
        existing.set_focus().map_err(|e| e.to_string())?;
        return Ok(());
    }

    let label = options.label;
    let url = options.url.unwrap_or_else(|| "index.html".to_string());
    let url = url.strip_prefix("./").unwrap_or(url.as_str()).to_string();

    let webview_url = if url.starts_with("http://") || url.starts_with("https://") {
        let parsed = Url::parse(&url).map_err(|e| e.to_string())?;
        WebviewUrl::External(parsed)
    } else {
        WebviewUrl::App(url.into())
    };

    let mut builder = WebviewWindowBuilder::new(&app, label, webview_url);

    if let Some(title) = options.title {
        builder = builder.title(title);
    }
    if let (Some(w), Some(h)) = (options.width, options.height) {
        builder = builder.inner_size(w, h);
    }
    if let Some(resizable) = options.resizable {
        builder = builder.resizable(resizable);
    }
    if let Some(fullscreen) = options.fullscreen {
        builder = builder.fullscreen(fullscreen);
    }
    if let Some(transparent) = options.transparent {
        builder = builder.transparent(transparent);
    }

    builder.build().map_err(|e: tauri::Error| e.to_string())?;
    Ok(())
}
