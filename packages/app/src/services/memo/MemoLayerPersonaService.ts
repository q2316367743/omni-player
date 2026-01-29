import type {MemoLayerPersona} from "@/entity/memo";
import {useSql} from "@/lib/sql.ts";

export function addMemoLayerPersona(data: Omit<MemoLayerPersona, 'id' | 'created_at' | 'updated_at'>) {
  const now = Date.now();
  return useSql().mapper<MemoLayerPersona>('memo_layer_persona').insert({
    ...data,
    created_at: now,
    updated_at: now
  });
}

export function updateMemoLayerPersona(id: string, data: Partial<Omit<MemoLayerPersona, 'id' | 'created_at' | 'updated_at'>>) {
  const now = Date.now();
  return useSql().mapper<MemoLayerPersona>('memo_layer_persona').updateById(id, {
    ...data,
    updated_at: now
  });
}

export function getActiveMemoLayerPersonas() {
  const now = Date.now();
  return useSql().query<MemoLayerPersona>('memo_layer_persona')
    .gt('expire_at', now)
    .list();
}

export function listActiveMemoLayerPersonas() {
  return useSql().query<MemoLayerPersona>('memo_layer_persona')
    .list();
}

