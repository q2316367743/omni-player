<template>
  <div class="message-wrapper" :class="message.sender">
    <div v-if="message.sender === 'friend'" class="message-avatar">
      <XhAvatar :value="friend.avatar" :size="36" shape="circle" />
    </div>
    <div class="message-content">
      <div class="message-bubble">
        <p class="message-text">{{ message.content }}</p>
      </div>
      <span class="message-time">{{ formatTime(message.timestamp) }}</span>
    </div>
    <div v-if="message.sender === 'user'" class="message-avatar">
      <XhAvatar :value="userAvatar" :size="36" shape="circle" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type {MemoFriendStaticView} from '@/entity/memo'
import XhAvatar from '@/components/avatar/XhAvatar.vue'

defineProps<{
  message: {
    id: string
    sender: 'user' | 'friend'
    content: string
    timestamp: number
  }
  friend: MemoFriendStaticView
}>()

const userAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}
</script>

<style scoped lang="less">
@import './less/MessageBubble.less';
</style>
