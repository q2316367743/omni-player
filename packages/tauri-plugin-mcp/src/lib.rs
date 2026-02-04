use tauri::{
  plugin::{Builder, TauriPlugin},
  Manager, Runtime,
};

pub use models::*;

#[cfg(desktop)]
mod desktop;
#[cfg(mobile)]
mod mobile;

mod commands;
mod error;
mod models;

pub use error::{Error, Result};

#[cfg(desktop)]
use desktop::Mcp;
#[cfg(mobile)]
use mobile::Mcp;

/// Extensions to [`tauri::App`], [`tauri::AppHandle`] and [`tauri::Window`] to access to mcp APIs.
pub trait McpExt<R: Runtime> {
  fn mcp(&self) -> &Mcp;
}

impl<R: Runtime, T: Manager<R>> McpExt<R> for T {
  fn mcp(&self) -> &Mcp {
    self.state::<Mcp>().inner()
  }
}

/// Initializes the plugin.
pub fn init<R: Runtime>() -> TauriPlugin<R> {
  Builder::new("mcp")
    .invoke_handler(tauri::generate_handler![
      commands::ping,
      commands::list,
      commands::add,
      commands::remove,
      commands::get_tool_calls,
      commands::execute_tool_call,
    ])
    .setup(|app, api| {
      #[cfg(mobile)]
      let mcp = mobile::init(app, api)?;
      #[cfg(desktop)]
      let mcp = desktop::init(app, api)?;
      app.manage(mcp);
      Ok(())
    })
    .build()
}
