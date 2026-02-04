use serde::{ser::Serializer, Serialize};

pub type Result<T> = std::result::Result<T, Error>;

#[derive(Debug, thiserror::Error)]
pub enum Error {
  #[error(transparent)]
  Io(#[from] std::io::Error),
  #[cfg(mobile)]
  #[error(transparent)]
  PluginInvoke(#[from] tauri::plugin::mobile::PluginInvokeError),
  #[error("MCP server not found: {0}")]
  McpNotFound(String),
  #[error("MCP server error: {0}")]
  McpError(String),
  #[error("Tool call not found: {0}")]
  ToolCallNotFound(String),
  #[error("Invalid input: {0}")]
  InvalidInput(String),
  #[error("Serialization error: {0}")]
  SerializationError(String),
  #[error("Execution error: {0}")]
  ExecutionError(String),
}

impl Serialize for Error {
  fn serialize<S>(&self, serializer: S) -> std::result::Result<S::Ok, S::Error>
  where
    S: Serializer,
  {
    serializer.serialize_str(self.to_string().as_ref())
  }
}

impl From<serde_json::Error> for Error {
  fn from(err: serde_json::Error) -> Self {
    Error::SerializationError(err.to_string())
  }
}
