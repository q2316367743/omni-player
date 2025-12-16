#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
     tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_stronghold::Builder::new(|password| {
            use argon2::{Argon2, Algorithm, Version, Params};

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
        }).build())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_log::Builder::new().level(tauri_plugin_log::log::LevelFilter::Info).build())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
