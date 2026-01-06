const COMMANDS: &[&str] = &[
    "is_available",
    "search",
    "install",
    "uninstall",
    "list_installed",
    "list_outdated",
    "upgrade"
];

fn main() {
  tauri_plugin::Builder::new(COMMANDS)
    .android_path("android")
    .ios_path("ios")
    .build();
}
