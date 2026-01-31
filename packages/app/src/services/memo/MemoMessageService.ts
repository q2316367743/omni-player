import type {MemoMessage, MemoMessageCore} from "@/entity/memo";
import {useSql} from "@/lib/sql.ts";

export function listMemoMessage(sessionId:  string) {
  return useSql().query<MemoMessage>('memo_message')
    .eq('session_id', sessionId)
    .orderByAsc('created_at')
    .list();
}

export function saveMemoMessage(data: MemoMessageCore, created_at?: number) {
  const now = Date.now();
  return useSql().mapper<MemoMessage>('memo_message').insert({
    ...data,
    created_at: typeof created_at ==='undefined' ? now : created_at,
    updated_at: now,
  });
}