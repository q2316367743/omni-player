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
use desktop::Hnsw;
#[cfg(mobile)]
use mobile::Hnsw;

/// Extensions to [`tauri::App`], [`tauri::AppHandle`] and [`tauri::Window`] to access the hnsw APIs.
pub trait HnswExt<R: Runtime> {
  fn hnsw(&self) -> &Hnsw<R>;
}

impl<R: Runtime, T: Manager<R>> crate::HnswExt<R> for T {
  fn hnsw(&self) -> &Hnsw<R> {
    self.state::<Hnsw<R>>().inner()
  }
}

/// Initializes the plugin.
pub fn init<R: Runtime>() -> TauriPlugin<R> {
  Builder::new("hnsw")
    .invoke_handler(tauri::generate_handler![commands::ping])
    .setup(|app, api| {
      #[cfg(mobile)]
      let hnsw = mobile::init(app, api)?;
      #[cfg(desktop)]
      let hnsw = desktop::init(app, api)?;
      app.manage(hnsw);
      Ok(())
    })
    .build()
}
