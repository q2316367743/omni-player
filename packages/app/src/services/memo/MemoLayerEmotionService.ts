import type {MemoLayerEmotion} from "@/entity/memo";
import {useSql} from "@/lib/sql.ts";

export function addMemoLayerEmotion(data: Omit<MemoLayerEmotion, 'id' | 'created_at' | 'updated_at'>) {
  const now = Date.now();
  return useSql().mapper<MemoLayerEmotion>('memo_layer_emotion').insert({
    ...data,
    created_at: now,
    updated_at: now
  });
}

export function updateMemoLayerEmotion(id: string, data: Partial<Omit<MemoLayerEmotion, 'id' | 'created_at' | 'updated_at'>>) {
  const now = Date.now();
  return useSql().mapper<MemoLayerEmotion>('memo_layer_emotion').updateById(id, {
    ...data,
    updated_at: now
  });
}

export function getActiveMemoLayerEmotions() {
  const now = Date.now();
  return useSql().query<MemoLayerEmotion>('memo_layer_emotion')
    .gt('expire_at', now)
    .list();
}


export function listActiveMemoLayerEmotions() {
  return useSql().query<MemoLayerEmotion>('memo_layer_emotion')
    .list();
}
