import type {MemoLayerEmotion} from "@/entity/memo";
import {useMemoSql} from "@/lib/sql.ts";

export function addMemoLayerEmotion(data: Omit<MemoLayerEmotion, 'id' | 'created_at' | 'updated_at'>) {
  const now = Date.now();
  return useMemoSql().mapper<MemoLayerEmotion>('memo_layer_emotion').insert({
    ...data,
    created_at: now,
    updated_at: now
  });
}

export function updateMemoLayerEmotion(id: string, data: Partial<Omit<MemoLayerEmotion, 'id' | 'created_at' | 'updated_at'>>) {
  const now = Date.now();
  return useMemoSql().mapper<MemoLayerEmotion>('memo_layer_emotion').updateById(id, {
    ...data,
    updated_at: now
  });
}

export function getActiveMemoLayerEmotions() {
  const now = Date.now();
  return useMemoSql().query<MemoLayerEmotion>('memo_layer_emotion')
    .gt('expire_at', now)
    .orderByDesc('expire_at')
    .list();
}


export function listActiveMemoLayerEmotions() {
  return useMemoSql().query<MemoLayerEmotion>('memo_layer_emotion')
    .orderByDesc('expire_at')
    .list();
}

export function setExpireTime(id: string, expireAt: number) {
  const now = Date.now();
  return useMemoSql().mapper<MemoLayerEmotion>('memo_layer_emotion').updateById(id, {
    expire_at: expireAt,
    updated_at: now
  });
}

export function extendExpireTime(id: string, additionalDays: number) {
  const now = Date.now();
  return useMemoSql().mapper<MemoLayerEmotion>('memo_layer_emotion').updateById(id, {
    expire_at: now + (additionalDays * 24 * 60 * 60 * 1000),
    updated_at: now
  });
}
