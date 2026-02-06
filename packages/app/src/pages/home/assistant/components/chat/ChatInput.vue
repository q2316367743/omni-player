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
        <t-icon name="lightbulb" />
      </t-button>
      <t-button variant="text" shape="circle" size="small">
        <t-icon name="image" />
      </t-button>
      <t-button variant="text" shape="circle" size="small">
        <t-icon name="folder" />
      </t-button>
      <t-button variant="text" shape="circle" size="small">
        <t-icon name="emoji" />
      </t-button>
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
        <t-icon name="send" />
      </t-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
const inputContent = ref('')

defineProps<{
  supportThink: boolean
  thinkEnabled: boolean
  isLoading: boolean
}>()

const emit = defineEmits<{
  (e: 'send', content: string): void
  (e: 'toggleThink'): void
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
</script>

<style scoped lang="less">
@import './less/ChatInput.less';
</style>
