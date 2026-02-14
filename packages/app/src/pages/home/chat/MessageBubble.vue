<template>
  <div class="message-wrapper" :class="message.sender">
    <div v-if="message.sender === 'assistant'" class="message-avatar">
      <XhAvatar :value="friend.avatar" :size="36" shape="circle" />
    </div>
    <div v-if="message.sender === 'user'" class="message-avatar">
      <XhAvatar :value="userAvatar" :size="36" shape="circle" />
    </div>
    <div v-if="message.sender === 'summary'" class="summary-card" @click="summaryExpanded = !summaryExpanded">
      <div class="summary-header">
        <t-icon name="history" size="16" />
        <span class="summary-title">对话总结</span>
        <t-icon :name="summaryExpanded ? 'chevron-up' : 'chevron-down'" size="16" class="summary-toggle" />
      </div>
      <div class="summary-preview" :class="{'is-expanded': summaryExpanded}">
        <template v-for="(content, index) in message.content" :key="index">
          <MarkdownPreview v-if="content.type === 'text'" :content="content.content" />
        </template>
      </div>
      <span class="message-time summary-time">{{ prettyMessageDate(message.timestamp) }}</span>
    </div>
    <div v-else class="message-content">
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
          <MarkdownPreview v-if="message.sender === 'assistant'" :content="content.content" />
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

const summaryExpanded = ref(false)

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

.summary-card {
  width: 100%;
  background: linear-gradient(135deg, var(--td-brand-color-light) 0%, var(--td-bg-color-container) 100%);
  border: 1px solid var(--td-brand-color);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
}

.summary-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: var(--td-brand-color-light);
  border-bottom: 1px solid var(--td-component-border);
  color: var(--td-brand-color);
  font-weight: 500;
}

.summary-title {
  flex: 1;
  font-size: 13px;
}

.summary-toggle {
  color: var(--td-text-color-secondary);
}

.summary-preview {
  padding: 12px 14px;
  max-height: 24px;
  overflow: hidden;
  transition: max-height 0.3s ease;
  font-size: 13px;
  color: var(--td-text-color-secondary);
  line-height: 1.5;

  &.is-expanded {
    max-height: 500px;
    color: var(--td-text-color-primary);
  }

  :deep(.cherry-preview-container) {
    .cherry {
      p {
        margin: 0;
      }
    }
  }
}

.summary-time {
  display: block;
  padding: 0 14px 10px;
  text-align: right;
}

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
