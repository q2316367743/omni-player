import type {MemoLayerBehavior, MemoLayerBehaviorCore} from "@/entity/memo";
import {useSql} from "@/lib/sql.ts";

export function addMemoLayerBehavior(data: MemoLayerBehaviorCore) {
  const now = Date.now();
  return useSql().mapper<MemoLayerBehavior>('memo_layer_behavior').insert({
    ...data,
    created_at: now,
    updated_at: now
  });
}

export function updateMemoLayerBehavior(id: string, data: Partial<MemoLayerBehaviorCore>) {
  const now = Date.now();
  return useSql().mapper<MemoLayerBehavior>('memo_layer_behavior').updateById(id, {
    ...data,
    updated_at: now
  });
}

export function getActiveMemoLayerBehaviors() {
  const now = Date.now();
  return useSql().query<MemoLayerBehavior>('memo_layer_behavior')
    .gt('expire_at', now)
    .list();
}