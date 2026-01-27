use tauri::{AppHandle, command, Runtime};

use crate::models::*;
use crate::Result;
use crate::HnswExt;

#[command]
pub(crate) async fn save<R: Runtime>(
    app: AppHandle<R>,
    payload: SaveRequest,
) -> Result<()> {
    app.hnsw().save(payload)
}

#[command]
pub(crate) async fn query<R: Runtime>(
    app: AppHandle<R>,
    payload: QueryRequest,
) -> Result<Vec<String>> {
    app.hnsw().query(payload)
}

#[command]
pub(crate) async fn remove<R: Runtime>(
    app: AppHandle<R>,
    payload: RemoveRequest,
) -> Result<()> {
    app.hnsw().remove(payload)
}
