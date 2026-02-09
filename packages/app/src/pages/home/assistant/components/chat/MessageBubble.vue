<template>
  <div class="message-wrapper" :class="message.sender">
    <div v-if="message.sender === 'friend'" class="message-avatar">
      <XhAvatar :value="friend.avatar" :size="36" shape="circle" />
    </div>
    <div v-if="message.sender === 'user'" class="message-avatar">
      <XhAvatar :value="userAvatar" :size="36" shape="circle" />
    </div>
    <div class="message-content">
      <template v-for="(content, index) in message.content" :key="index">
        <div v-if="content.type === 'think'" class="thinking-section">
          <div class="thinking-header">
            <span class="thinking-text">思考</span>
          </div>
          <div class="thinking-content">
            <MarkdownPreview :content="content.content" />
          </div>
        </div>
        <div v-else-if="content.type === 'text'" class="message-bubble" :class="{'with-thinking': isFirstTextAfterThinking}">
          <MarkdownPreview v-if="message.sender === 'friend'" :content="content.content" />
          <div v-else>{{ content.content }}</div>
        </div>
      </template>
      <span class="message-time">{{ prettyMessageDate(message.timestamp) }}</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type {MemoFriendStaticView} from '@/entity/memo'
import XhAvatar from '@/components/avatar/XhAvatar.vue'
import MarkdownPreview from '@/components/common/MarkdownPreview.vue'
import {useSettingStore} from "@/store";
import {prettyMessageDate} from "@/util/lang/DateUtil.ts";

const props = defineProps<{
  message: {
    id: string
    sender: 'user' | 'friend'
    content: Array<{ type: 'text' | 'think', content: string }>
    timestamp: number
  }
  friend: MemoFriendStaticView
}>()

const userAvatar = computed(() => useSettingStore().userAvatar);

const isFirstTextAfterThinking = computed(() => {
  const firstTextIndex = props.message.content.findIndex(c => c.type === 'text')
  const lastThinkIndex = props.message.content.map(c => c.type).lastIndexOf('think')
  return firstTextIndex > -1 && lastThinkIndex > -1 && firstTextIndex > lastThinkIndex
})

</script>

<style scoped lang="less">
@import './less/MessageBubble.less';
</style>
