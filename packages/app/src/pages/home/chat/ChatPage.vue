<template>
  <div class="chat-page monica-container">
    <FriendList
      :friends="friends"
      :selected-friend-id="selectedFriendId"
      @select="handleSelectFriend"
    />
    <ChatArea
      v-if="selectedFriend"
      :friend="selectedFriend"
    />
    <div v-else class="empty-chat">
      <div class="empty-content">
        <div class="empty-icon">💬</div>
        <h3>选择一个朋友开始聊天</h3>
        <p>从左侧列表中选择一个AI伙伴，开始有趣的对话吧</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {useMemoFriendStore} from '@/store'
import type {MemoFriendStaticView} from '@/entity/memo'
import FriendList from './FriendList.vue'
import ChatArea from './ChatArea.vue'

const memoFriendStore = useMemoFriendStore()

const friends = computed(() => memoFriendStore.friends.filter(f => f.is_active === 1))
const selectedFriendId = ref<string>()

const selectedFriend = computed(() => {
  return friends.value.find(f => f.id === selectedFriendId.value)
})

const handleSelectFriend = (friend: MemoFriendStaticView) => {
  if (selectedFriendId.value === friend.id) {
    selectedFriendId.value = undefined
  } else {
    selectedFriendId.value = friend.id
  }
}

onMounted(() => {
  memoFriendStore.loadFriends()
})
</script>

<style scoped lang="less">
@import 'less/ChatPage.less';
</style>
