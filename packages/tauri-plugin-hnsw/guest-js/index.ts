import { invoke } from '@tauri-apps/api/core'

/**
 * 保存向量
 * @param id 分块 ID
 * @param vectors 向量内容
 */
export async function save(id: string, vectors: Array<number>): Promise<void> {
  return invoke<void>('plugin:hnsw|save', {
    payload: {
      id, vectors
    },
  });
}

/**
 * 查询向量
 * @param query 向量
 * @param topK 相似度
 */
export async function query(query: Array<number>, topK: number): Promise<Array<string>> {
  return invoke<Array<string>>('plugin:hnsw|query', {
    payload: {
      query, top_k: topK
    },
  });
}

/**
 * 删除向量
 * @param ids 向量 ID
 */
export async function removeBatch(ids: Array<string>): Promise<void> {
  return invoke<void>('plugin:hnsw|remove', {
    payload: {
      ids
    },
  });
}