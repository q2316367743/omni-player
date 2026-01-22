<template>

  <div :class="['home-chat-content', layout]">
    <div class="chat-container">
      <div class="chat-list" ref="chatContentRef" @scroll="handleChatScroll">
        <div v-for="(item, index) in messages" :key="item.id" class="chat-item" :class="[item.role]"
             :id="`message-${item.id}`">
          <div v-if="item.role === 'system'" class="system-message">
            <div class="system-content">{{ item.content }}</div>
          </div>
          <div v-else-if="item.role === 'assistant'" class="assistant-message">
            <div class="message-avatar assistant-avatar">
              <service-icon/>
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
            <div class="message-avatar user-avatar">
              <user-icon/>
            </div>
            <div class="message-body">
              <div class="message-content">{{ item.content }}</div>
              <div class="message-footer">
                  <span class="message-info">tokens used: {{ calculateTokens(item.content) }}</span>
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
          <div v-else-if="item.role === 'model-change'" class="model-change-message">
            <div class="model-change-content" v-html="item.content"></div>
          </div>
          <div v-else-if="item.role === 'error'" class="error-message">
            <div class="error-content">{{ item.content }}</div>
          </div>
        </div>
      </div>
      <div class="chat-toc">
        <div v-for="item in messages" :key="item.id" class="toc-item"
             :class="[item.role, {active: item.id === activeMessageId}]" @click="scrollToMessage(item.id)">
          <div class="toc-bar"></div>
          <div class="toc-name">{{ getTocName(item) }}</div>
        </div>
      </div>
    </div>
    <div class="chat-sender-wrapper">
      <chat-sender
        v-model="text"
        :model="model"
        :think="think"
        :disabled="isAsked"
        :show-stop="isAsked"
        @send="emit('send', $event)"
        @stop="emit('stop')"
      />
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
  UserIcon,
  ServiceIcon
} from "tdesign-icons-vue-next";

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
  },
  think: {
    type: Boolean,
    default: true
  }
});
const emit = defineEmits(['send', 'stop', 'operator', 'update:model', 'update:think']);

const chatContentRef = ref<HTMLDivElement>();
const text = ref('');
const thinkingCollapsedMap = ref<Map<string, boolean>>(new Map());
const isShowToBottom = ref(false);
const isAsked = ref(false);
const isUserScrolling = ref(false);
const isAutoScroll = ref(true);
const activeMessageId = ref<string>('');

let scrollTimeout: ReturnType<typeof setTimeout> | null = null;

const toggleThinking = (messageId: string) => {
  thinkingCollapsedMap.value.set(messageId, !thinkingCollapsedMap.value.get(messageId));
};

const isThinkingCollapsed = (messageId: string): boolean => {
  return thinkingCollapsedMap.value.get(messageId) ?? true;
};

const getTocName = (item: AiChatMessage) => {
  if (item.role === 'system') {
    return '系统';
  } else if (item.role === 'assistant') {
    return item.model || '助手';
  } else if (item.role === 'user') {
    return '用户';
  } else if (item.role === 'model-change') {
    return '模型切换';
  } else if (item.role === 'error') {
    return '错误';
  }
  return '';
};

const scrollToMessage = (messageId: string) => {
  const element = document.getElementById(`message-${messageId}`);
  if (element && chatContentRef.value) {
    element.scrollIntoView({behavior: 'smooth', block: 'start'});
  }
};

const updateActiveMessage = () => {
  if (!chatContentRef.value) return;

  const containerRect = chatContentRef.value.getBoundingClientRect();

  let maxOverlap = 0;
  let activeId = '';

  props.messages.forEach((message) => {
    const element = document.getElementById(`message-${message.id}`);
    if (element) {
      const elementRect = element.getBoundingClientRect();
      const overlap = Math.max(0, Math.min(elementRect.bottom, containerRect.bottom) - Math.max(elementRect.top, containerRect.top));

      if (overlap > maxOverlap) {
        maxOverlap = overlap;
        activeId = message.id;
      }
    }
  });

  if (activeId) {
    activeMessageId.value = activeId;
  }
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
  updateActiveMessage();
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

const handleOperator = (operator: string, item: AiChatMessage, index: number) => {
  emit('operator', {operator, item, index});
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
    isAsked.value = newVal;
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
