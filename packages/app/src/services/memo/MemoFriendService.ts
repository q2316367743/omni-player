import type {MemoFriend, MemoFriendDynamic, MemoFriendStatic} from "@/entity/memo";
import {useSql} from "@/lib/sql.ts";

export function listMemoFriend() {
  return useSql().query<MemoFriend>('memo_friend').list();
}

export function getMemoFriend(id: string) {
  return useSql().query<MemoFriend>('memo_friend').eq('id', id).first();
}

export function updateMemoFriendStatic(id: string, data: Partial<MemoFriendStatic>) {
  return useSql().mapper<MemoFriend>('memo_friend').updateById(id, data);
}

export function updateMemoFriendDynamic(id: string, data: Partial<MemoFriendDynamic>) {
  return useSql().mapper<MemoFriend>('memo_friend').updateById(id, data);
}

export async function completeMemoFriendSession(id: string) {
  const friend = await useSql().query<MemoFriend>('memo_friend').eq('id', id).first();
  if (!friend) return;

  const now = Date.now();
  const interactionCount = (friend.interaction_count || 0) + 1;
  const lastInteraction = friend.last_interaction || 0;
  
  let conversationFrequency = 'unknown';
  if (lastInteraction > 0) {
    const hoursSinceLastInteraction = (now - lastInteraction) / (1000 * 60 * 60);
    if (hoursSinceLastInteraction < 1) {
      conversationFrequency = 'high';
    } else if (hoursSinceLastInteraction < 24) {
      conversationFrequency = 'medium';
    } else if (hoursSinceLastInteraction < 168) {
      conversationFrequency = 'low';
    } else {
      conversationFrequency = 'rare';
    }
  }

  return updateMemoFriendDynamic(id, {
    interaction_count: interactionCount,
    last_interaction: now,
    conversation_frequency: conversationFrequency
  });
}