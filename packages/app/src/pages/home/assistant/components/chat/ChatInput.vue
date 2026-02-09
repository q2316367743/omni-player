<template>
  <div class="chat-input-area">
    <div class="input-toolbar">
      <t-button
        v-if="supportThink"
        variant="text"
        shape="circle"
        size="small"
        :theme="thinkEnabled ? 'primary' : 'default'"
        @click="handleToggleThink"
      >
        <lightbulb-icon/>
      </t-button>
      <t-button variant="text" shape="circle" size="small">
        <image-icon/>
      </t-button>
      <t-button variant="text" shape="circle" size="small">
        <folder-icon/>
      </t-button>
      <t-button variant="text" shape="circle" size="small">
        <fact-check-icon/>
      </t-button>
      <div class="ml-auto mr-24px">
        <t-button variant="outline" size="small" :loading="summaryLoading" @click="handleToggleSummary()">
          总结
        </t-button>
      </div>
    </div>
    <div class="input-wrapper">
      <t-textarea
        v-model="inputContent"
        placeholder="输入消息..."
        :autosize="{ minRows: 1, maxRows: 4 }"
        :disabled="isLoading"
      />
      <t-button
        class="send-button"
        :disabled="!inputContent.trim() || isLoading"
        @click="handleSend"
      >
        <t-icon name="send"/>
      </t-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {FactCheckIcon, FolderIcon, ImageIcon, LightbulbIcon} from "tdesign-icons-vue-next";

const inputContent = ref('')

defineProps<{
  supportThink: boolean
  thinkEnabled: boolean
  isLoading: boolean
  summaryLoading: boolean
}>()

const emit = defineEmits<{
  (e: 'send', content: string): void
  (e: 'toggleThink'): void
  (e: 'toggleSummary'): void
}>()

const handleSend = () => {
  const content = inputContent.value.trim()
  if (!content) return

  emit('send', content)
  inputContent.value = ''
}

const handleToggleThink = () => {
  emit('toggleThink')
}
const handleToggleSummary = () => {
  emit('toggleSummary')
}
</script>

<style scoped lang="less">
@import './less/ChatInput.less';
</style>
