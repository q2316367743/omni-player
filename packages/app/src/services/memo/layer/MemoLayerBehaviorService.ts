import type {MemoLayerBehavior, MemoLayerBehaviorCore} from "@/entity/memo";
import {useMemoSql} from "@/lib/sql.ts";

export function addMemoLayerBehavior(data: MemoLayerBehaviorCore) {
  const now = Date.now();
  return useMemoSql().mapper<MemoLayerBehavior>('memo_layer_behavior').insert({
    ...data,
    created_at: now,
    updated_at: now
  });
}

export function updateMemoLayerBehavior(id: string, data: Partial<MemoLayerBehaviorCore>) {
  const now = Date.now();
  return useMemoSql().mapper<MemoLayerBehavior>('memo_layer_behavior').updateById(id, {
    ...data,
    updated_at: now
  });
}

export function getActiveMemoLayerBehaviors() {
  const now = Date.now();
  return useMemoSql().query<MemoLayerBehavior>('memo_layer_behavior')
    .gt('expire_at', now)
    .orderByDesc('expire_at')
    .list();
}

export function listActiveMemoLayerBehaviors() {
  return useMemoSql().query<MemoLayerBehavior>('memo_layer_behavior')
    .orderByDesc('expire_at')
    .list();
}

export function setExpireTime(id: string, expireAt: number) {
  const now = Date.now();
  return useMemoSql().mapper<MemoLayerBehavior>('memo_layer_behavior').updateById(id, {
    expire_at: expireAt,
    updated_at: now
  });
}

export function extendExpireTime(id: string, additionalDays: number) {
  const now = Date.now();
  return useMemoSql().mapper<MemoLayerBehavior>('memo_layer_behavior').updateById(id, {
    expire_at: now + (additionalDays * 24 * 60 * 60 * 1000),
    updated_at: now
  });
}