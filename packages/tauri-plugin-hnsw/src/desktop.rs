use serde::de::DeserializeOwned;
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::{plugin::PluginApi, AppHandle, Runtime, Manager};

use crate::models::*;
use faiss::{IdMap, Idx, Index, MetricType, index_factory, read_index, write_index};
use faiss::index::IndexImpl;

pub fn init<R: Runtime, C: DeserializeOwned>(
  app: &AppHandle<R>,
  _api: PluginApi<R, C>,
) -> crate::Result<Hnsw<R>> {
  let app_data_dir = app.path().app_data_dir()?;
  let hnsw_dir = app_data_dir.join("hnsw");
  
  if !hnsw_dir.exists() {
    fs::create_dir_all(&hnsw_dir)?;
  }
  
  let index_file = hnsw_dir.join("index.faiss");
  
  Ok(Hnsw(app.clone(), index_file))
}

/// Access to the hnsw APIs.
pub struct Hnsw<R: Runtime>(AppHandle<R>, PathBuf);

struct VectorStore {
  index_file: PathBuf,
  index: IdMap<IndexImpl>,
  id_mapping: HashMap<String, u64>,
  reverse_mapping: HashMap<u64, String>,
  next_id: u64,
}

impl VectorStore {
  fn new(index_file: PathBuf) -> Result<Self, Box<dyn std::error::Error>> {
    let (index, id_mapping, reverse_mapping, next_id) = if index_file.exists() {
      Self::load_from_file(&index_file)?
    } else {
      let index = index_factory(768, "Flat", MetricType::L2)?;
      let index = IdMap::new(index)?;
      (index, HashMap::new(), HashMap::new(), 0)
    };
    
    Ok(Self {
      index_file,
      index,
      id_mapping,
      reverse_mapping,
      next_id,
    })
  }

  fn load_from_file(path: &PathBuf) -> Result<(IdMap<IndexImpl>, HashMap<String, u64>, HashMap<u64, String>, u64), Box<dyn std::error::Error>> {
    let path_str = path.to_str().ok_or("Invalid path")?;
    let index = read_index(path_str)?;
    let index = IdMap::new(index)?;
    Ok((index, HashMap::new(), HashMap::new(), 0))
  }

  fn save_to_file(&self) -> Result<(), Box<dyn std::error::Error>> {
    let path_str = self.index_file.to_str().ok_or("Invalid path")?;
    write_index(&self.index, path_str)?;
    Ok(())
  }

  fn save(&mut self, id: String, vectors: Vec<f32>) -> Result<(), Box<dyn std::error::Error>> {
    let internal_id = self.next_id;
    self.next_id += 1;
    
    self.id_mapping.insert(id.clone(), internal_id);
    self.reverse_mapping.insert(internal_id, id);
    
    let idx = Idx::new(internal_id);
    self.index.add_with_ids(&vectors, &[idx])?;
    self.save_to_file()?;
    Ok(())
  }

  fn remove(&mut self, ids: Vec<String>) -> Result<(), Box<dyn std::error::Error>> {
    use faiss::selector::IdSelector;
    
    let internal_ids: Vec<Idx> = ids
      .iter()
      .filter_map(|id| self.id_mapping.get(id))
      .map(|&internal_id| Idx::new(internal_id))
      .collect();
    
    if !internal_ids.is_empty() {
      let selector = IdSelector::batch(&internal_ids)?;
      self.index.remove_ids(&selector)?;
      
      for id in ids {
        if let Some(internal_id) = self.id_mapping.remove(&id) {
          self.reverse_mapping.remove(&internal_id);
        }
      }
      
      self.save_to_file()?;
    }
    
    Ok(())
  }

  fn query(&mut self, query: Vec<f32>, top_k: usize) -> Vec<String> {
    let result = self.index.search(&query, top_k).unwrap();
    
    result
      .labels
      .into_iter()
      .filter_map(|idx: Idx| {
        idx.get().and_then(|internal_id| {
          self.reverse_mapping.get(&internal_id).cloned()
        })
      })
      .collect()
  }
}

thread_local! {
  static VECTOR_STORE: Mutex<Option<VectorStore>> = Mutex::new(None);
}

impl<R: Runtime> Hnsw<R> {
  fn ensure_initialized(&self) {
    VECTOR_STORE.with(|store| {
      let mut store = store.lock().unwrap();
      if store.is_none() {
        *store = Some(VectorStore::new(self.1.clone()).unwrap());
      }
    });
  }

  pub fn save(&self, payload: SaveRequest) -> crate::Result<()> {
    self.ensure_initialized();
    VECTOR_STORE.with(|store| {
      let mut store = store.lock().unwrap();
      if let Some(store) = store.as_mut() {
        store.save(payload.id, payload.vectors)
          .map_err(|e| crate::Error::Custom(e.to_string()))?;
      }
      Ok(())
    })
  }

  pub fn query(&self, payload: QueryRequest) -> crate::Result<Vec<String>> {
    self.ensure_initialized();
    VECTOR_STORE.with(|store| {
      let mut store = store.lock().unwrap();
      if let Some(store) = store.as_mut() {
        Ok(store.query(payload.query, payload.top_k))
      } else {
        Ok(vec![])
      }
    })
  }

  pub fn remove(&self, payload: RemoveRequest) -> crate::Result<()> {
    self.ensure_initialized();
    VECTOR_STORE.with(|store| {
      let mut store = store.lock().unwrap();
      if let Some(store) = store.as_mut() {
        store.remove(payload.ids)
          .map_err(|e| crate::Error::Custom(e.to_string()))?;
      }
      Ok(())
    })
  }
}
