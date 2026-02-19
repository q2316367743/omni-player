import type {MemoMessage, MemoMessageCore} from "@/entity/memo";
import {useMemoSql} from "@/lib/sql.ts";

export function listMemoMessage(sessionId:  string) {
  return useMemoSql().query<MemoMessage>('memo_message')
    .eq('session_id', sessionId)
    .orderByAsc('created_at')
    .list();
}

export function saveMemoMessage(data: MemoMessageCore, created_at?: number) {
  const now = Date.now();
  return useMemoSql().mapper<MemoMessage>('memo_message').insert({
    ...data,
    created_at: typeof created_at ==='undefined' ? now : created_at,
    updated_at: now,
  });
}