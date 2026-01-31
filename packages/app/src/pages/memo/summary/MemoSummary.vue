<template>
  <div class="memo-summary-container monica-container">
    <div class="summary-header">
      <t-button theme="default" variant="text" @click="goBack" shape="round" class="back-btn">
        <template #icon>
          <chevron-left-icon/>
        </template>
        返回
      </t-button>
      <h2 class="summary-title">{{ summary?.title || '' }}</h2>
    </div>

    <div class="summary-content local-scroll">
      <div class="ai-journal-card monica-card">
        <div class="ai-journal-header">
          <XhAvatar :value="friend?.avatar" :size="40" shape="circle" class="ai-avatar"/>
          <div class="ai-info">
            <div class="ai-name">{{ friend?.name }}</div>
            <div class="ai-time">{{ summary?.created_at ? formatTime(summary.created_at) : ''}}</div>
          </div>
        </div>
        <div class="ai-journal-text">
          {{ summary?.ai_journal || '' }}
        </div>
      </div>

      <div class="summary-card monica-card">
        <h3 class="section-title">对话总结</h3>
        <p class="summary-text">{{ summary?.summary || '' }}</p>
      </div>

      <div class="messages-section monica-card">
        <h3 class="section-title">聊天记录</h3>
        <div class="messages-list">
          <div
            v-for="message in messages"
            :key="message.id"
            class="message-wrapper"
            :class="message.role"
          >
            <div v-if="message.role === 'assistant'" class="message-avatar">
              <XhAvatar :value="friend?.avatar" :size="36" shape="circle" class="avatar"/>
            </div>
            <div v-else-if="message.role === 'user'" class="message-avatar">
              <XhAvatar :value="userAvatarUrl" :size="36" shape="circle" class="avatar"/>
            </div>
            <div class="message-content-wrapper">
              <div class="message-bubble">
                <MarkdownPreview :content="message.content"/>
              </div>
              <span class="message-time">{{ formatTime(message.created_at) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <t-back-top container=".summary-content" />
  </div>
</template>

<script lang="ts" setup>
import {useRoute, useRouter} from 'vue-router';
import {getMemoChatSummary} from '@/services/memo/MemoChatSummaryService';
import {listMemoMessage} from '@/services/memo/MemoMessageService';
import XhAvatar from '@/components/avatar/XhAvatar.vue';
import MarkdownPreview from '@/components/common/MarkdownPreview.vue';
import type {MemoChatSummary} from '@/entity/memo/MemoChatSummary';
import type {MemoMessage} from '@/entity/memo';
import {ChevronLeftIcon} from "tdesign-icons-vue-next";
import {useMemoFriendStore} from "@/store";

const route = useRoute();
const router = useRouter();

const summary = ref<MemoChatSummary>();
const messages = ref<MemoMessage[]>([]);

const friend = computed(() => summary.value?.friend_id ? useMemoFriendStore().friendMap.get(summary.value?.friend_id) : undefined);
const userAvatarUrl = ref('https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=user%20avatar%20profile%20picture&image_size=square');

onMounted(async () => {
  const id = route.params.id as string;
  if (id) {
    await loadSummary(id);
  }
});

async function loadSummary(id: string) {
  summary.value = await getMemoChatSummary(id);
  if (summary.value) {
    messages.value = await listMemoMessage(summary.value.session_id);
  }
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('zh-CN', {hour: '2-digit', minute: '2-digit'});
}

function goBack() {
  router.back();
}
</script>

<style scoped lang="less">
.memo-summary-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--monica-warm-bg);
  color: var(--monica-text-primary);
}

.summary-header {
  display: flex;
  align-items: center;
  padding: var(--monica-spacing-md) var(--monica-spacing-lg);
  background: linear-gradient(135deg, var(--monica-coral) 0%, var(--monica-coral-light) 100%);
  color: white;
  box-shadow: 0 2px 8px var(--monica-shadow);
  z-index: 10;

  .back-btn {
    color: white;
    margin-right: var(--monica-spacing-lg);

    &:hover {
      background: rgba(255, 255, 255, 0.15);
    }
  }

  .summary-title {
    margin: 0;
    font-size: var(--monica-font-xl);
    font-weight: 600;
    color: white;
    flex: 1;
  }
}

.summary-content {
  flex: 1;
  padding: var(--monica-spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--monica-spacing-lg);
}

.ai-journal-card {
  padding: var(--monica-spacing-lg);
  background: var(--td-bg-color-container);
  border: 1px solid var(--monica-border);
  box-shadow: 0 2px 8px var(--monica-shadow);
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 16px var(--monica-shadow-strong);
    transform: translateY(-2px);
  }

  .ai-journal-header {
    display: flex;
    align-items: center;
    gap: var(--monica-spacing-md);
    margin-bottom: var(--monica-spacing-md);

    .ai-avatar {
      border: 2px solid var(--monica-coral-light);
    }

    .ai-info {
      display: flex;
      flex-direction: column;
      gap: 2px;

      .ai-name {
        font-size: var(--monica-font-md);
        font-weight: 600;
        color: var(--monica-text-primary);
      }

      .ai-time {
        font-size: var(--monica-font-xs);
        color: var(--monica-coral);
        font-weight: 500;
      }
    }
  }

  .ai-journal-text {
    padding: var(--monica-spacing-md) var(--monica-spacing-lg);
    background: linear-gradient(135deg, var(--monica-lavender) 0%, var(--monica-rose) 100%);
    border-radius: var(--monica-radius-md);
    font-size: var(--monica-font-md);
    line-height: 1.8;
    color: var(--monica-text-primary);
    font-style: italic;
    position: relative;
    border-left: 3px solid var(--monica-coral-light);

    &::before {
      content: '"';
      position: absolute;
      top: -8px;
      left: 8px;
      font-size: 48px;
      color: var(--monica-coral-light);
      opacity: 0.3;
      font-family: Georgia, serif;
      line-height: 1;
    }
  }
}

.summary-card {
  padding: var(--monica-spacing-xl);
  background: var(--td-bg-color-container);
  border: 1px solid var(--monica-border);
  box-shadow: 0 2px 8px var(--monica-shadow);
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 16px var(--monica-shadow-strong);
    transform: translateY(-2px);
  }

  .section-title {
    margin: 0 0 var(--monica-spacing-md) 0;
    font-size: var(--monica-font-lg);
    font-weight: 600;
    color: var(--monica-coral);
    display: flex;
    align-items: center;
    gap: var(--monica-spacing-sm);
  }

  .summary-text {
    margin: 0;
    font-size: var(--monica-font-md);
    line-height: 1.8;
    color: var(--monica-text-primary);
    padding: var(--monica-spacing-md);
    background: var(--monica-warm-bg-secondary);
    border-radius: var(--monica-radius-md);
    border-left: 3px solid var(--monica-coral-light);
  }
}

.messages-section {
  padding: var(--monica-spacing-xl);
  background: var(--td-bg-color-container);
  border: 1px solid var(--monica-border);
  box-shadow: 0 2px 8px var(--monica-shadow);
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 16px var(--monica-shadow-strong);
    transform: translateY(-2px);
  }

  .section-title {
    margin: 0 0 var(--monica-spacing-lg) 0;
    font-size: var(--monica-font-lg);
    font-weight: 600;
    color: var(--monica-coral);
    display: flex;
    align-items: center;
    gap: var(--monica-spacing-sm);
  }

  .messages-list {
    display: flex;
    flex-direction: column;
    gap: var(--monica-spacing-lg);
  }

  .message-wrapper {
    width: 100%;
    display: flex;
    align-items: flex-start;

    &.user {
      flex-direction: row-reverse;
    }

    &.assistant {
      flex-direction: row;
    }
  }

  .message-avatar {
    margin: 0 var(--monica-spacing-sm);
    flex-shrink: 0;

    .avatar {
      border-radius: 50%;
      object-fit: cover;
    }
  }

  .message-content-wrapper {
    display: flex;
    flex-direction: column;
    max-width: 70vw;

    &.user {
      align-items: flex-end;
    }

    &.assistant {
      align-items: flex-start;
    }
  }

  .message-bubble {
    border-radius: var(--monica-radius-xl);
    font-size: var(--monica-font-md);
    line-height: 1.6;
    word-wrap: break-word;
    transition: all 0.2s ease;
    margin-left: 4px;
  }

  .message-wrapper.user .message-bubble {
    background: var(--monica-coral);
    margin-right: 6px;
    color: white;
    border-radius: var(--monica-radius-xl) var(--monica-radius-sm) var(--monica-radius-xl) var(--monica-radius-xl);
    border: 1px solid var(--monica-coral-light);
    box-shadow: 0 4px 12px rgba(255, 107, 107, 0.2);

    :deep(.cherry-preview-container) {
      .cherry {
        --base-font-color: white;
        --md-paragraph-color: white;
        color: white;
      }

      .cherry * {
        color: white !important;
      }
    }
  }

  .message-wrapper.assistant .message-bubble {
    background: var(--monica-warm-bg-secondary);
    color: var(--monica-text-primary);
    border-radius: var(--monica-radius-sm) var(--monica-radius-xl) var(--monica-radius-xl) var(--monica-radius-xl);
    border: 1px solid var(--monica-border);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .message-time {
    font-size: var(--monica-font-xs);
    opacity: 0.6;
    margin-top: var(--monica-spacing-xs);
  }

  .message-wrapper.user .message-time {
    text-align: right;
  }

  .message-wrapper.assistant .message-time {
    text-align: left;
  }
}
</style>
