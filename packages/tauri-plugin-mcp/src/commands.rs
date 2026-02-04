use tauri::{AppHandle, command, Runtime};
use serde_json::Value as JsonValue;

use crate::models::*;
use crate::Result;
use crate::McpExt;

#[command]
pub(crate) async fn ping<R: Runtime>(
    app: AppHandle<R>,
    payload: PingRequest,
) -> Result<PingResponse> {
    app.mcp().ping(payload)
}

#[command]
pub(crate) async fn list<R: Runtime>(
    app: AppHandle<R>,
) -> Result<Vec<String>> {
    app.mcp().list()
}

#[command]
pub(crate) async fn add<R: Runtime>(
    app: AppHandle<R>,
    items: Vec<MCPItem>,
) -> Result<()> {
    app.mcp().add(items)
}

#[command]
pub(crate) async fn remove<R: Runtime>(
    app: AppHandle<R>,
    ids: Vec<String>,
) -> Result<()> {
    app.mcp().remove(ids)
}

#[command]
pub(crate) async fn get_tool_calls<R: Runtime>(
    app: AppHandle<R>,
) -> Result<Vec<McpToolCall>> {
    app.mcp().get_tool_calls()
}

#[command]
pub(crate) async fn execute_tool_call<R: Runtime>(
    app: AppHandle<R>,
    id: String,
    input: JsonValue,
) -> Result<JsonValue> {
    app.mcp().execute_tool_call(id, input)
}
