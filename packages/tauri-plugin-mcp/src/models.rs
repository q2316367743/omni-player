use serde::{Deserialize, Serialize};
use serde_json::Value as JsonValue;

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PingRequest {
  pub value: Option<String>,
}

#[derive(Debug, Clone, Default, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PingResponse {
  pub value: Option<String>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MCPItem {
  pub id: String,
  pub name: String,
  pub command: String,
  pub args: Vec<String>,
  #[serde(rename = "env")]
  pub env: std::collections::HashMap<String, String>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct McpToolCall {
  pub id: String,
  pub name: String,
  pub description: String,
  pub parameters: JsonValue,
  pub required: Vec<String>,
  pub request_body: JsonValue,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ExecuteToolCallRequest {
  pub id: String,
  pub input: JsonValue,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct ExecuteToolCallResponse {
  pub result: JsonValue,
}
