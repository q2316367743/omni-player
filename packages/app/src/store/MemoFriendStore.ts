import type {MemoFriend, MemoFriendDynamic, MemoFriendStatic} from "@/entity/memo";
import {defineStore} from "pinia";
import {listMemoFriend, updateMemoFriendStatic, updateMemoFriendDynamic} from "@/services/memo";
import {loadMemoSessionIng} from "@/services/memo/MemoSessionService.ts";

export const useMemoFriendStore = defineStore('memo-friend', () => {
  const friends = ref(new Array<MemoFriend>());
  const friendMap = ref(new Map<string, MemoFriend>());
  // 正在聊天的朋友，朋友 ID => session ID
  const chatFriendMap = ref(new Map<string, string>());

  async function loadFriends() {
    friends.value = await listMemoFriend();
    friendMap.value = new Map(friends.value.map(f => [f.id, f]));
  }

  async function updateFriendStatic(id: string, data: Partial<MemoFriendStatic>) {
    await updateMemoFriendStatic(id, data);
    // 刷新
    await loadFriends();
  }

  async function updateFriendDynamic(id: string, data: Partial<MemoFriendDynamic>) {
    await updateMemoFriendDynamic(id, data);
    // 刷新
    await loadFriends();
  }
  async function loadChatSession() {
    const sessions = await loadMemoSessionIng();
    chatFriendMap.value = new Map(sessions.map(s => [s.friend_id, s.id]));
  }

  return {
    friends, friendMap,
    chatFriendMap,
    loadFriends, updateFriendStatic, updateFriendDynamic,
    loadChatSession
  }
})