<template>
  <div class="chat-area">
    <div class="chat-header">
      <div class="chat-header-left">
        <XhAvatar :value="friend.avatar" :size="40" shape="circle" />
        <div class="chat-header-info">
          <h3 class="chat-header-name">{{ friend.name }}</h3>
          <p class="chat-header-status">在线</p>
        </div>
      </div>
      <div class="chat-header-actions">
        <t-button variant="text" shape="circle">
          <t-icon name="phone" />
        </t-button>
        <t-button variant="text" shape="circle">
          <t-icon name="ellipsis" />
        </t-button>
      </div>
    </div>

    <div class="chat-messages local-scroll" ref="messagesContainer">
      <div class="message-date-divider">
        <span class="date-divider-text">今天</span>
      </div>
      <MessageBubble
        v-for="message in messages"
        :key="message.id"
        :message="message"
        :friend="friend"
      />
    </div>

    <ChatInput @send="handleSend" />
  </div>
</template>

<script lang="ts" setup>
import type {MemoFriendStaticView} from '@/entity/memo'
import XhAvatar from '@/components/avatar/XhAvatar.vue'
import MessageBubble from './MessageBubble.vue'
import ChatInput from './ChatInput.vue'

const props = defineProps<{
  friend: MemoFriendStaticView
  messages: Array<{
    id: string
    sender: 'user' | 'friend'
    content: string
    timestamp: number
  }>
}>()

const emit = defineEmits<{
  (e: 'send', content: string): void
}>()

const messagesContainer = ref<HTMLElement>()

const handleSend = (content: string) => {
  emit('send', content)
}

watch(() => props.messages.length, () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}, { flush: 'post' })
</script>

<style scoped lang="less">
@import './less/ChatArea.less';
</style>
