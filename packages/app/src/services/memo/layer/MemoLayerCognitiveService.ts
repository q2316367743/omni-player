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

export function getActiveMemoLayerCognitive() {
  const now = Date.now();
  return useSql().query<MemoLayerCognitive>('memo_layer_cognitive')
    .gt('expire_at', now)
    .orderByDesc('expire_at')
    .list();
}

export function listActiveMemoLayerCognitive() {
  return useSql().query<MemoLayerCognitive>('memo_layer_cognitive')
    .orderByDesc('expire_at')
    .list();
}

export function setExpireTime(id: string, expireAt: number) {
  const now = Date.now();
  return useSql().mapper<MemoLayerCognitive>('memo_layer_cognitive').updateById(id, {
    expire_at: expireAt,
    updated_at: now
  });
}

export function extendExpireTime(id: string, additionalDays: number) {
  const now = Date.now();
  return useSql().mapper<MemoLayerCognitive>('memo_layer_cognitive').updateById(id, {
    expire_at: now + (additionalDays * 24 * 60 * 60 * 1000),
    updated_at: now
  });
}
