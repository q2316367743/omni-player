use serde::de::DeserializeOwned;
use serde_json::Value as JsonValue;
use std::collections::HashMap;
use std::sync::Arc;
use tauri::{plugin::PluginApi, AppHandle, Runtime};
use rmcp::{ServiceExt, RoleClient, service::{ClientInitializeError, RunningService}};

use crate::models::*;
use crate::Result;

pub fn init<R: Runtime, C: DeserializeOwned>(
  _app: &AppHandle<R>,
  _api: PluginApi<R, C>,
) -> crate::Result<Mcp> {
  Ok(Mcp::new())
}

#[derive(Clone)]
pub struct McpServerInstance {
  id: String,
  name: String,
  command: String,
  args: Vec<String>,
  env: HashMap<String, String>,
}

pub struct McpManager {
  servers: Arc<tokio::sync::RwLock<HashMap<String, McpServerInstance>>>,
  services: Arc<tokio::sync::RwLock<HashMap<String, Arc<RunningService<RoleClient, ()>>>>>,
}

impl McpManager {
  fn new() -> Self {
    Self {
      servers: Arc::new(tokio::sync::RwLock::new(HashMap::new())),
      services: Arc::new(tokio::sync::RwLock::new(HashMap::new())),
    }
  }

  async fn add_server(&self, item: MCPItem) -> Result<()> {
    let mut servers = self.servers.write().await;
    let server = McpServerInstance {
      id: item.id.clone(),
      name: item.name.clone(),
      command: item.command.clone(),
      args: item.args.clone(),
      env: item.env.clone(),
    };
    servers.insert(item.id.clone(), server);
    Ok(())
  }

  async fn remove_servers(&self, ids: Vec<String>) -> Result<()> {
    let mut servers = self.servers.write().await;
    let mut services: tokio::sync::RwLockWriteGuard<'_, HashMap<String, Arc<RunningService<RoleClient, ()>>>> = self.services.write().await;
    
    for id in &ids {
      servers.remove(id);
      if let Some(service) = services.remove(id) {
        service.cancellation_token().cancel();
      }
    }
    Ok(())
  }

  async fn list_servers(&self) -> Result<Vec<String>> {
    let servers = self.servers.read().await;
    Ok(servers.keys().cloned().collect())
  }

  async fn get_server(&self, id: &str) -> Result<McpServerInstance> {
    let servers = self.servers.read().await;
    servers
      .get(id)
      .cloned()
      .ok_or_else(|| crate::Error::McpNotFound(id.to_string()))
  }

  async fn get_all_servers(&self) -> Result<Vec<McpServerInstance>> {
    let servers = self.servers.read().await;
    Ok(servers.values().cloned().collect())
  }

  async fn get_or_create_service(&self, id: &str) -> Result<Arc<RunningService<RoleClient, ()>>> {
    {
      let services: tokio::sync::RwLockReadGuard<'_, HashMap<String, Arc<RunningService<RoleClient, ()>>>> = self.services.read().await;
      if let Some(service) = services.get(id) {
        return Ok(service.clone());
      }
    }

    let server = self.get_server(id).await?;
    
    let mut cmd = tokio::process::Command::new(&server.command);
    cmd.args(&server.args);
    for (key, value) in &server.env {
      cmd.env(key, value);
    }

    let transport = rmcp::transport::TokioChildProcess::new(cmd)
      .map_err(|e: std::io::Error| crate::Error::McpError(e.to_string()))?;

    let service = ()
      .serve(transport)
      .await
      .map_err(|e: ClientInitializeError| crate::Error::McpError(e.to_string()))?;

    let peer = Arc::new(service);
    
    {
      let mut services: tokio::sync::RwLockWriteGuard<'_, HashMap<String, Arc<RunningService<RoleClient, ()>>>> = self.services.write().await;
      services.insert(id.to_string(), peer.clone());
    }

    Ok(peer)
  }
}

/// Access to the mcp APIs.
pub struct Mcp {
  manager: Arc<McpManager>,
}

impl Mcp {
  pub fn new() -> Self {
    Self {
      manager: Arc::new(McpManager::new()),
    }
  }

  pub fn ping(&self, payload: PingRequest) -> crate::Result<PingResponse> {
    Ok(PingResponse {
      value: payload.value,
    })
  }

  pub fn list(&self) -> Result<Vec<String>> {
    let manager = self.manager.clone();
    tokio::task::block_in_place(|| {
      tokio::runtime::Handle::current().block_on(async move {
        manager.list_servers().await
      })
    })
  }

  pub fn add(&self, items: Vec<MCPItem>) -> Result<()> {
    let manager = self.manager.clone();
    tokio::task::block_in_place(|| {
      tokio::runtime::Handle::current().block_on(async move {
        for item in items {
          manager.add_server(item).await?;
        }
        Ok(())
      })
    })
  }

  pub fn remove(&self, ids: Vec<String>) -> Result<()> {
    let manager = self.manager.clone();
    tokio::task::block_in_place(|| {
      tokio::runtime::Handle::current().block_on(async move {
        manager.remove_servers(ids).await
      })
    })
  }

  pub fn get_tool_calls(&self) -> Result<Vec<McpToolCall>> {
    let manager = self.manager.clone();
    tokio::task::block_in_place(|| {
      tokio::runtime::Handle::current().block_on(async move {
        let servers = manager.get_all_servers().await?;
        let mut tool_calls = Vec::new();

        for server in servers {
          match manager.get_or_create_service(&server.id).await {
            Ok(service) => {
              let tools_result = service.list_tools(None).await;
              if let Ok(tools) = tools_result {
                for tool in tools.tools {
                  let input_schema = serde_json::to_value(&*tool.input_schema)
                    .unwrap_or(serde_json::json!({}));
                  
                  let tool_call = McpToolCall {
                    id: server.id.clone(),
                    name: tool.name.to_string(),
                    description: tool.description.as_deref().unwrap_or("").to_string(),
                    parameters: input_schema,
                    required: vec![],
                    request_body: serde_json::json!({}),
                  };
                  tool_calls.push(tool_call);
                }
              }
            }
            Err(_) => {
              let tool_call = McpToolCall {
                id: server.id.clone(),
                name: format!("{}_tool", server.name),
                description: format!("Tool from MCP server: {}", server.name),
                parameters: serde_json::json!({
                  "type": "object",
                  "properties": {},
                }),
                required: vec![],
                request_body: serde_json::json!({}),
              };
              tool_calls.push(tool_call);
            }
          }
        }

        Ok(tool_calls)
      })
    })
  }

  pub fn execute_tool_call<T: serde::de::DeserializeOwned>(&self, id: String, input: JsonValue) -> Result<T> {
    let manager = self.manager.clone();
    tokio::task::block_in_place(|| {
      tokio::runtime::Handle::current().block_on(async move {
        let service = manager.get_or_create_service(&id).await?;
        
        let tool_name = input.get("name")
          .and_then(|v| v.as_str())
          .ok_or_else(|| crate::Error::InvalidInput("Missing tool name".to_string()))?
          .to_string();
        
        let arguments = input.get("arguments")
          .and_then(|v| v.as_object())
          .cloned();

        let result = service.call_tool(rmcp::model::CallToolRequestParams {
          meta: None,
          name: tool_name.into(),
          arguments,
          task: None,
        }).await.map_err(|e| crate::Error::ExecutionError(e.to_string()))?;

        let result_json = serde_json::to_value(result)
          .map_err(|e| crate::Error::SerializationError(e.to_string()))?;

        serde_json::from_value(result_json)
          .map_err(|e| crate::Error::SerializationError(e.to_string()))
      })
    })
  }
}
