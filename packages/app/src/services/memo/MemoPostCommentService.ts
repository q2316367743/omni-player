import type {MemoPostComment, MemoPostCommentCore} from "@/entity/memo";
import {useMemoSql} from "@/lib/sql.ts";

export function addMemoPostComment(data: MemoPostCommentCore) {
  const now = Date.now();
  return useMemoSql().mapper<MemoPostComment>('memo_post_comment').insert({
    ...data,
    created_at: now,
    updated_at: now
  });
}

export async function listMemoPostComment(post_id: string) {
  return useMemoSql().query<MemoPostComment>('memo_post_comment')
    .eq('post_id', post_id)
    .orderByAsc('created_at')
    .list();
}