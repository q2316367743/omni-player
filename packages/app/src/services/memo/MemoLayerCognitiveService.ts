import type {MemoLayerCognitive} from "@/entity/memo";
import {useSql} from "@/lib/sql.ts";

export function addMemoLayerCognitive(data: Omit<MemoLayerCognitive, 'id' | 'created_at' | 'updated_at'>) {
  const now = Date.now();
  return useSql().mapper<MemoLayerCognitive>('memo_layer_cognitive').insert({
    ...data,
    created_at: now,
    updated_at: now
  });
}

export function updateMemoLayerCognitive(id: string, data: Partial<Omit<MemoLayerCognitive, 'id' | 'created_at' | 'updated_at'>>) {
  const now = Date.now();
  return useSql().mapper<MemoLayerCognitive>('memo_layer_cognitive').updateById(id, {
    ...data,
    updated_at: now
  });
}

export function getActiveMemoLayerCognitives() {
  const now = Date.now();
  return useSql().query<MemoLayerCognitive>('memo_layer_cognitive')
    .gt('expire_at', now)
    .list();
}
