import type {MemoSessionSummary, MemoSessionSummaryCore} from "@/entity/memo/MemoSessionSummary.ts";
import {useSql} from "@/lib/sql.ts";
import {useMemoVelesdb} from "@/lib/velesdb.ts";

export interface DiaryItem {
  id: string;
  friend_id: string;
  title: string;
  summary: string;
  ai_journal: string;
  created_at: number;
  updated_at: number;
  source: 'session' | 'chat';
}

export async function pageDiaryItems(pageNum: number, pageSize: number) {
  const offset = (pageNum - 1) * pageSize;
  const sql = `
    SELECT 
      id,
      friend_id,
      title,
      summary,
      ai_journal,
      created_at,
      updated_at,
      'session' as source
    FROM memo_session_summary
    UNION ALL
    SELECT 
      id,
      friend_id,
      '' as title,
      content as summary,
      ai_journal,
      created_at,
      updated_at,
      'chat' as source
    FROM memo_chat_summary
    WHERE level = 2
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `;
  
  const records = await useSql().select<DiaryItem[]>(sql, [pageSize, offset]);
  
  const countSql = `
    SELECT COUNT(*) as total FROM (
      SELECT id FROM memo_session_summary
      UNION ALL
      SELECT id FROM memo_chat_summary WHERE level = 2
    )
  `;
  
  const countResult = await useSql().select<Array<{ total: number }>>(countSql);
  const total = countResult[0]?.total || 0;
  
  return {
    records: records || [],
    total,
    pageNum,
    pageSize
  };
}

export function pageMemoChatSummary(pageNum: number, pageSize: number) {
  return useSql().query<MemoSessionSummary>('memo_session_summary')
    .orderByDesc('created_at')
    .page(pageNum, pageSize);
}

export function getMemoChatSummary(id: string) {
  return useSql().query<MemoSessionSummary>('memo_session_summary').eq('id', id).get();
}

export async function createMemoChatSummary(data: MemoSessionSummaryCore) {
  const now = Date.now();
  const summary = await useSql().mapper<MemoSessionSummary>('memo_session_summary').insert({
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