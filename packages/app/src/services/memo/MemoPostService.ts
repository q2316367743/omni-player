import type {MemoPost, MemoPostComment, MemoPostCore, MemoPostUpdate} from "@/entity/memo";
import {useSql} from "@/lib/sql.ts";
import type {PageResponse} from "@/global/PageResponse.ts";
import {group} from "@/util";

export interface MemoPostView extends MemoPost {
  // 全部的评论
  comments: Array<MemoPostComment>;
}

export async function pageMemoPost(pageNum: number, pageSize: number): Promise<PageResponse<MemoPostView>> {
  const page = await useSql().query<MemoPost>('memo_post')
    .orderByDesc('created_at')
    .page(pageNum, pageSize);
  if (page.records.length === 0) {
    return {
      ...page,
      records: []
    };
  }
  const postIds = page.records.map(e => e.id);
  const comments = await useSql().query<MemoPostComment>('memo_post_comment')
    .in('post_id', postIds)
    .list();
  const commentMap = group(comments, 'post_id');
  return {
    ...page,
    records: page.records.map(e => ({
      ...e,
      comments: commentMap.getOrDefault(e.id, [])
    }))
  };
}

export function countMemoPostForWeek(friend_id: string, created_at: number) {
  return useSql().query<MemoPost>('memo_post')
    .eq('friend_id', friend_id)
    .gt('created_at', created_at)
    .count();
}

export function createMemoPost(memoPost: MemoPostCore) {
  const now = Date.now();
  return useSql().mapper<MemoPost>('memo_post')
    .insert({
      ...memoPost,
      is_like: 0,
      created_at: now,
      updated_at: now
    });
}

export function updateMemoPost(id: string, data: Partial<MemoPostUpdate>) {
  return useSql().mapper<MemoPost>('memo_post')
    .updateById(id, {
      ...data,
      updated_at: Date.now()
    });
}
