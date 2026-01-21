<template>

  <div :class="['home-chat-content', layout]">
    <div class="chat-list" ref="chatContentRef" @scroll="handleChatScroll">
      <div v-for="(item, index) in messages" :key="item.id" class="chat-item" :class="[item.role]">
        <div v-if="item.role === 'system'" class="system-message">
          <div class="system-content">{{ item.content }}</div>
        </div>
        <div v-else-if="item.role === 'assistant'" class="assistant-message">
          <div class="message-avatar assistant-avatar">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
          </div>
          <div class="message-body">
            <div v-if="item.thinking && item.thinking.length > 0" class="thinking-section"
                 :class="{collapsed: isThinkingCollapsed(item.id)}">
              <div class="thinking-header" @click="toggleThinking(item.id)">
                <chevron-right-icon class="collapse-icon" :class="{rotated: !isThinkingCollapsed(item.id)}"/>
                <check-circle-icon v-if="!isStreamLoad || index !== messages.length - 1" class="thinking-icon"/>
                <div v-else class="thinking-loading">
                  <span class="dot"></span>
                  <span class="dot"></span>
                  <span class="dot"></span>
                </div>
                <span class="thinking-text">{{
                    isStreamLoad && index === messages.length - 1 ? '思考中...' : '已深度思考'
                  }}</span>
              </div>
              <div class="thinking-content" v-show="!isThinkingCollapsed(item.id)">
                <markdown-preview :content="item.thinking" stream/>
              </div>
            </div>
            <div v-if="item.content" class="message-content"
                 :class="{'with-thinking': item.thinking && item.thinking.length > 0}">
              <markdown-preview :content="item.content" stream/>
            </div>
            <div class="message-footer">
                <span class="message-info">tokens used: {{ calculateTokens(item.content) }}, model: {{
                    item.model
                  }}</span>
              <div class="message-actions">
                <t-tooltip content="复制">
                  <t-button theme="primary" variant="text" shape="square" size="small"
                            @click="handleOperator('copy', item, index)">
                    <template #icon>
                      <copy-icon/>
                    </template>
                  </t-button>
                </t-tooltip>
                <t-popconfirm content="是否删除此对话，删除后无法恢复" confirm-btn="删除"
                              @confirm="handleOperator('delete', item, index)">
                  <t-button theme="danger" variant="text" shape="square" size="small">
                    <template #icon>
                      <delete-icon/>
                    </template>
                  </t-button>
                </t-popconfirm>
              </div>
            </div>
          </div>
        </div>
        <div v-else-if="item.role === 'user'" class="user-message">
          <div class="message-body">
            <div class="message-content">{{ item.content }}</div>
          </div>
          <div class="message-avatar user-avatar">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
        </div>
        <div v-else-if="item.role === 'model-change'" class="model-change-message">
          <div class="model-change-content" v-html="item.content"></div>
        </div>
        <div v-else-if="item.role === 'error'" class="error-message">
          <div class="error-content">{{ item.content }}</div>
        </div>
      </div>
    </div>
    <div class="chat-sender-wrapper">
      <t-chat-sender
        v-model="text"
        class="chat-sender"
        :textarea-props="{placeholder: '请输入消息...',disabled: isAsked}"
      >
        <template #suffix>
          <t-button theme="danger" shape="circle" v-if="isAsked" @click="handleStop">
            <template #icon>
              <stop-circle-icon/>
            </template>
          </t-button>
          <t-space size="small" v-else>
            <t-button variant="outline" shape="round" :disabled @click="onClear">
              <template #icon>
                <delete-icon/>
              </template>
              清空输入
            </t-button>
            <t-button shape="round" :disabled @click="onSend">发送</t-button>
          </t-space>
        </template>
        <template #footer-prefix>
          <home-assistant-select v-model="customModel"/>
        </template>
      </t-chat-sender>
    </div>
    <t-button v-if="isShowToBottom" variant="text" class="bottomBtn" @click="backBottom">
      <arrow-down-icon/>
    </t-button>
  </div>
</template>
<script lang="ts" setup>
import type {AiChatMessage} from "@/entity/app/ai/chat";
import {
  ArrowDownIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  CopyIcon,
  DeleteIcon,
  StopCircleIcon
} from "tdesign-icons-vue-next";
import HomeAssistantSelect from "@/pages/app/ai/chat/components/HomeAssistantSelect.vue";

const props = defineProps({
  messages: {
    type: Array as PropType<Array<AiChatMessage>>,
    default: () => []
  },
  layout: {
    type: String,
    default: 'compact'
  },
  isStreamLoad: {
    type: Boolean,
    default: false
  },
  model: {
    type: String,
    default: ''
  }
});
const emit = defineEmits(['send', 'stop', 'operator', 'update:model']);

const chatContentRef = ref<HTMLDivElement>();
const text = ref('');
const thinkingCollapsedMap = ref<Map<string, boolean>>(new Map());
const isShowToBottom = ref(false);
const isAsked = ref(false);
const isUserScrolling = ref(false);
const isAutoScroll = ref(true);
let scrollTimeout: ReturnType<typeof setTimeout> | null = null;

const customModel = computed({
  get: () => props.model,
  set: val => emit('update:model', val)
})

const disabled = computed(() => text.value.trim() === '');

const toggleThinking = (messageId: string) => {
  thinkingCollapsedMap.value.set(messageId, !thinkingCollapsedMap.value.get(messageId));
};

const isThinkingCollapsed = (messageId: string): boolean => {
  return thinkingCollapsedMap.value.get(messageId) ?? true;
};

// 是否显示回到底部按钮
const handleChatScroll = function (e: Event) {
  const target = e.target as HTMLDivElement;
  const scrollTop = target.scrollTop;
  const scrollHeight = target.scrollHeight;
  const clientHeight = target.clientHeight;
  const distanceToBottom = scrollHeight - scrollTop - clientHeight;

  isShowToBottom.value = distanceToBottom > 100;

  if (!isUserScrolling.value) {
    isUserScrolling.value = true;
    isAutoScroll.value = false;

    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }
    scrollTimeout = setTimeout(() => {
      isUserScrolling.value = false;
    }, 1500);
  }

  isAutoScroll.value = distanceToBottom < 50;
};
// 滚动到底部
const backBottom = () => {
  if (chatContentRef.value) {
    chatContentRef.value.scrollTo({
      top: chatContentRef.value.scrollHeight,
      behavior: 'smooth',
    });
  }
};

const calculateTokens = (content: string): number => {
  return Math.ceil(content.length / 4);
};

const onClear = () => {
  text.value = '';
}

const handleOperator = (operator: string, item: AiChatMessage, index: number) => {
  emit('operator', {operator, item, index});
}
const handleStop = () => {
  emit('stop');
}
const onSend = () => {
  if (text.value.trim() === '') {
    return;
  }
  emit('send', text.value);
  text.value = '';
}

const scrollToBottom = (behavior: 'auto' | 'smooth' = 'auto') => {
  if (chatContentRef.value) {
    chatContentRef.value.scrollTo({
      top: chatContentRef.value.scrollHeight,
      behavior,
    });
  }
};

watch(
  () => props.messages.length,
  async () => {
    await nextTick();
    if (isAutoScroll.value) {
      scrollToBottom();
    }
  }
);

watch(
  () => props.isStreamLoad,
  async (newVal, oldVal) => {
    if (newVal === false && oldVal === true) {
      await nextTick();
      if (isAutoScroll.value) {
        scrollToBottom();
      }
    }
  }
);

onMounted(() => {
  nextTick(() => {
    scrollToBottom();
  });
});

onUnmounted(() => {
  if (scrollTimeout) {
    clearTimeout(scrollTimeout);
  }
});
</script>
<style scoped lang="less">
@import "./CustomChat.less";
</style>
