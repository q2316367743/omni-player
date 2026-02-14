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
        <div v-else-if="content.type === 'mcp'" class="mcp-section">
          <div class="mcp-header" @click="toggleMcp(index)">
            <div class="mcp-header-left">
              <t-icon name="api" />
              <span class="mcp-tool-name">{{ content.toolName }}</span>
            </div>
            <t-icon :name="mcpExpandedMap[index] ? 'chevron-up' : 'chevron-down'" class="mcp-toggle-icon" />
          </div>
          <div v-show="mcpExpandedMap[index]" class="mcp-body">
            <div class="mcp-args">
              <span class="mcp-label">参数:</span>
              <pre class="mcp-code">{{ formatJson(content.args) }}</pre>
            </div>
            <div class="mcp-result">
              <span class="mcp-label">结果:</span>
              <pre class="mcp-code">{{ formatJson(content.result) }}</pre>
            </div>
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
import type {MemoChatItemView, MemoFriendStaticView} from '@/entity/memo'
import XhAvatar from '@/components/avatar/XhAvatar.vue'
import MarkdownPreview from '@/components/common/MarkdownPreview.vue'
import {useSettingStore} from "@/store";
import {prettyMessageDate} from "@/util/lang/DateUtil.ts";

const props = defineProps<{
  message: MemoChatItemView
  friend: MemoFriendStaticView
}>()

const userAvatar = computed(() => useSettingStore().userAvatar);

const mcpExpandedMap = ref<Record<number, boolean>>({})

const toggleMcp = (index: number) => {
  mcpExpandedMap.value[index] = !mcpExpandedMap.value[index]
}

const isFirstTextAfterThinking = computed(() => {
  const firstTextIndex = props.message.content.findIndex(c => c.type === 'text')
  const lastThinkIndex = props.message.content.map(c => c.type).lastIndexOf('think')
  return firstTextIndex > -1 && lastThinkIndex > -1 && firstTextIndex > lastThinkIndex
})

const formatJson = (data: any): string => {
  try {
    return JSON.stringify(data, null, 2)
  } catch {
    return String(data)
  }
}
</script>

<style scoped lang="less">
@import 'less/MessageBubble.less';

.mcp-section {
  background: var(--td-bg-color-container);
  border: 1px solid var(--td-component-border);
  border-radius: 8px;
  margin: 4px 0;
  overflow: hidden;
  font-size: 12px;
}

.mcp-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: var(--td-bg-color-container-hover);
  color: var(--td-brand-color);
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s;

  &:hover {
    background: var(--td-bg-color-container-active);
  }
}

.mcp-header-left {
  display: flex;
  align-items: center;
  gap: 6px;
}

.mcp-tool-name {
  font-weight: 500;
}

.mcp-toggle-icon {
  font-size: 14px;
  color: var(--td-text-color-secondary);
  transition: transform 0.2s;
}

.mcp-body {
  padding: 8px 12px;
  border-top: 1px solid var(--td-component-border);
}

.mcp-args,
.mcp-result {
  margin-bottom: 8px;
}

.mcp-args:last-child,
.mcp-result:last-child {
  margin-bottom: 0;
}

.mcp-label {
  color: var(--td-text-color-secondary);
  margin-right: 8px;
}

.mcp-code {
  margin: 4px 0 0 0;
  padding: 8px;
  background: var(--td-bg-color-container-active);
  border-radius: 4px;
  overflow-x: auto;
  font-family: monospace;
  font-size: 11px;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
