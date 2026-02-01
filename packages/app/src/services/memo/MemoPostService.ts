import type {MemoPost, MemoPostCore} from "@/entity/memo";
import {useSql} from "@/lib/sql.ts";

export function listMemoPost() {
  return useSql().query<MemoPost>('memo_post')
    .orderByDesc('created_at')
    .list();
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
      created_at: now,
      updated_at: now
    });
}



// AI 基于关键字触发

// 基于时间检测触发

// 基于特殊事件触发

// 用户主动发送