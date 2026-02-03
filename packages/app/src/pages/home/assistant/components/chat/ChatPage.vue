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
      :messages="currentMessages"
      @send="handleSendMessage"
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
import {useMemoFriendStore} from '@/store/MemoFriendStore'
import type {MemoFriendStaticView} from '@/entity/memo'
import FriendList from './FriendList.vue'
import ChatArea from './ChatArea.vue'

const memoFriendStore = useMemoFriendStore()

const friends = computed(() => memoFriendStore.friends.filter(f => f.is_active === 1))
const selectedFriendId = ref<string>()

const selectedFriend = computed(() => {
  return friends.value.find(f => f.id === selectedFriendId.value)
})

const currentMessages = ref<Array<{
  id: string
  sender: 'user' | 'friend'
  content: string
  timestamp: number
}>>([])

const handleSelectFriend = (friend: MemoFriendStaticView) => {
  if (selectedFriendId.value === friend.id) {
    selectedFriendId.value = undefined
    currentMessages.value = []
  } else {
    selectedFriendId.value = friend.id
    loadMockMessages()
  }
}

const loadMockMessages = () => {
  currentMessages.value = [
    {
      id: '1',
      sender: 'friend',
      content: '你好呀！很高兴见到你~',
      timestamp: Date.now() - 3600000
    },
    {
      id: '2',
      sender: 'user',
      content: '你好！今天过得怎么样？',
      timestamp: Date.now() - 3500000
    },
    {
      id: '3',
      sender: 'friend',
      content: '今天还不错呢，阳光很好，心情也很棒！你呢？',
      timestamp: Date.now() - 3400000
    }
  ]
}

const handleSendMessage = (content: string) => {
  if (!selectedFriend.value) return

  const userMessage = {
    id: Date.now().toString(),
    sender: 'user' as const,
    content,
    timestamp: Date.now()
  }

  currentMessages.value.push(userMessage)

  setTimeout(() => {
    const friendMessage = {
      id: (Date.now() + 1).toString(),
      sender: 'friend' as const,
      content: `收到！"${content}" 是个很有趣的话题呢~`,
      timestamp: Date.now()
    }
    currentMessages.value.push(friendMessage)
  }, 1000)
}

onMounted(() => {
  memoFriendStore.loadFriends()
})
</script>

<style scoped lang="less">
@import './less/ChatPage.less';
</style>
