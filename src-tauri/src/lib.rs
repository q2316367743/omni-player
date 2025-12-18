use tauri_plugin_log::{Target, TargetKind};
use tauri::{
    Manager,
    menu::{Menu, MenuItem},
    tray::TrayIconBuilder,
};


mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // 注册所有命令（现在从 commands 模块导入）
        .invoke_handler(tauri::generate_handler![
            commands::window::create_tauri_window,
            commands::potplayer::launch_potplayer,
            // 未来其他命令：commands::fetch_media_library, ...
        ])
        .plugin(tauri_plugin_libmpv::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(
            tauri_plugin_stronghold::Builder::new(|password| {
                use argon2::{Algorithm, Argon2, Params, Version};

                // 配置参数（注意单位：mem_cost 是 KiB）
                let params = Params::new(
                    10_000, // m-cost (memory in KiB) — 至少 1024
                    10,     // t-cost (iterations)
                    4,      // p-cost (parallelism)
                    None,   // output length (None = default 32)
                )
                .expect("invalid Argon2 parameters");

                let output_len = params.output_len().unwrap_or(32);
                let mut output_key = vec![0u8; output_len];

                // 使用 Argon2id + Version 19 (0x13)
                let hasher = Argon2::new(Algorithm::Argon2id, Version::V0x13, params);

                let salt = b"your-unique-32-byte-long-salt12"; // 必须至少 8 字节，建议 32
                hasher
                    .hash_password_into(password.as_ref(), salt, &mut output_key)
                    .expect("Argon2 hashing failed");

                output_key
            })
            .build(),
        )
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
                        app.get_webview_window("main")
                            .unwrap()
                            .show()
                            .unwrap();
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
