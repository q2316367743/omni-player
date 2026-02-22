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
import {getMemoSessionSummary} from '@/services/memo/MemoSessionSummaryService.ts';
import {listMemoMessage} from '@/services/memo/MemoMessageService';
import XhAvatar from '@/components/xiaohei/XhAvatar.vue';
import MarkdownPreview from '@/components/common/MarkdownPreview.vue';
import type {MemoSessionSummary} from '@/entity/memo/MemoSessionSummary.ts';
import type {MemoMessage} from '@/entity/memo';
import {ChevronLeftIcon} from "tdesign-icons-vue-next";
import {useMemoFriendStore} from "@/store";

const route = useRoute();
const router = useRouter();

const summary = ref<MemoSessionSummary>();
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
  summary.value = await getMemoSessionSummary(id);
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
@import "MemoSummary.less";
</style>
