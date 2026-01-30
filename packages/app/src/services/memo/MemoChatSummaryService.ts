import type {MemoChatSummary, MemoChatSummaryCore} from "@/entity/memo/MemoChatSummary.ts";
import {useSql} from "@/lib/sql.ts";

export function listMemoChatSummary() {
  return useSql().query<MemoChatSummary>('memo_chat_summary')
    .orderByDesc('created_at')
    .list();
}

export function createMemoChatSummary(data: MemoChatSummaryCore) {
  const now = Date.now();
  return useSql().mapper<MemoChatSummary>('memo_chat_summary').insert({
    ...data,
    created_at: now,
    updated_at: now
  });
}