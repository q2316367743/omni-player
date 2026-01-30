import type {MemoChatSummary, MemoChatSummaryCore} from "@/entity/memo/MemoChatSummary.ts";
import {useSql} from "@/lib/sql.ts";
import {useMemoVelesdb} from "@/lib/velesdb.ts";

export function listMemoChatSummary() {
  return useSql().query<MemoChatSummary>('memo_chat_summary')
    .orderByDesc('created_at')
    .list();
}

export async function createMemoChatSummary(data: MemoChatSummaryCore) {
  const now = Date.now();
  const summary = await useSql().mapper<MemoChatSummary>('memo_chat_summary').insert({
    ...data,
    created_at: now,
    updated_at: now
  });
  // 约定：总结的 created_at本身，+1，+2为向量块
  await useMemoVelesdb().addChunkBatch([
    {
      id: now,
      content: data.title,
      payload: {
        id: summary.id,
        content: data.title,
        type: 'title',
        session_id: data.session_id
      }
    },
    {
      id: now + 1,
      content: data.summary,
      payload: {
        id: summary.id,
        content: data.summary,
        type: 'summary',
        session_id: data.session_id
      }
    },
    {
      id: now + 2,
      content: data.ai_journal,
      payload: {
        id: summary.id,
        content: data.ai_journal,
        type: 'ai_journal',
        session_id: data.session_id
      }
    }
  ]);
}