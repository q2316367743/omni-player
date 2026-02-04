const COMMANDS: &[&str] = &["list", "add", "remove", "get_tool_calls", "execute_tool_call"];

fn main() {
  tauri_plugin::Builder::new(COMMANDS)
    .android_path("android")
    .ios_path("ios")
    .build();
}
