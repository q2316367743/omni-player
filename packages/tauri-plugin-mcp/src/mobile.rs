use serde::de::DeserializeOwned;
use tauri::{
  plugin::{PluginApi, PluginHandle},
  AppHandle, Runtime,
};

use crate::models::*;

#[cfg(target_os = "ios")]
tauri::ios_plugin_binding!(init_plugin_mcp);

// initializes the Kotlin or Swift plugin classes
pub fn init<R: Runtime, C: DeserializeOwned>(
  _app: &AppHandle<R>,
  api: PluginApi<R, C>,
) -> crate::Result<Mcp<R>> {
  #[cfg(target_os = "android")]
  let handle = api.register_android_plugin("", "ExamplePlugin")?;
  #[cfg(target_os = "ios")]
  let handle = api.register_ios_plugin(init_plugin_mcp)?;
  Ok(Mcp(handle))
}

/// Access to the mcp APIs.
pub struct Mcp<R: Runtime + Send + Sync>(PluginHandle<R>);

impl<R: Runtime + Send + Sync> Mcp<R> {
  pub fn ping(&self, payload: PingRequest) -> crate::Result<PingResponse> {
    self
      .0
      .run_mobile_plugin("ping", payload)
      .map_err(Into::into)
  }

  pub fn list(&self) -> crate::Result<Vec<String>> {
    self
      .0
      .run_mobile_plugin("list", ())
      .map_err(Into::into)
  }

  pub fn add(&self, items: Vec<MCPItem>) -> crate::Result<()> {
    self
      .0
      .run_mobile_plugin("add", items)
      .map_err(Into::into)
  }

  pub fn remove(&self, ids: Vec<String>) -> crate::Result<()> {
    self
      .0
      .run_mobile_plugin("remove", ids)
      .map_err(Into::into)
  }

  pub fn get_tool_calls(&self) -> crate::Result<Vec<McpToolCall>> {
    self
      .0
      .run_mobile_plugin("get_tool_calls", ())
      .map_err(Into::into)
  }

  pub fn execute_tool_call<T: serde::de::DeserializeOwned>(&self, id: String, input: serde_json::Value) -> crate::Result<T> {
    let request = serde_json::json!({ "id": id, "input": input });
    self
      .0
      .run_mobile_plugin("execute_tool_call", request)
      .map_err(Into::into)
  }
}
