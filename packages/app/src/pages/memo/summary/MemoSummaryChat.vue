<template>
  <div class="memo-summary-container monica-container">
    <div class="summary-header">
      <t-button theme="default" variant="text" @click="goBack" shape="round" class="back-btn">
        <template #icon>
          <chevron-left-icon/>
        </template>
        返回
      </t-button>
      <h2 v-if="summary" class="summary-title">{{
          prettyMessageDate(summary.start_time)
        }}到{{ prettyMessageDate(summary.end_time) }}的聊天总结</h2>
    </div>

    <div class="summary-content local-scroll">
      <div class="ai-journal-card monica-card">
        <div class="ai-journal-header">
          <XhAvatar :value="friend?.avatar" :size="40" shape="circle" class="ai-avatar"/>
          <div class="ai-info">
            <div class="ai-name">{{ friend?.name }}</div>
            <div class="ai-time">{{ summary?.created_at ? prettyMessageDate(summary.created_at) : '' }}</div>
          </div>
        </div>
        <div class="ai-journal-text">
          {{ summary?.ai_journal || '' }}
        </div>
      </div>

      <div class="summary-card monica-card">
        <h3 class="section-title">对话总结</h3>
        <p class="summary-text">{{ summary?.content || '' }}</p>
      </div>

      <div class="messages-section monica-card">
        <h3 class="section-title">聊天记录</h3>
        <div v-if="friend" class="messages-list">
          <MessageBubble
            v-for="message in data"
            :key="message.id"
            :message="message"
            :friend="friend"
          />
        </div>
      </div>
    </div>
    <t-back-top container=".summary-content"/>
  </div>
</template>

<script lang="ts" setup>
import {ChevronLeftIcon} from "tdesign-icons-vue-next";
import type {MemoChatItemView, MemoChatSummaryView, MemoChatView} from '@/entity/memo';
import {useMemoFriendStore} from "@/store";
import {prettyMessageDate} from "@/util/lang/DateUtil.ts";
import MessageBubble from "@/pages/home/chat/MessageBubble.vue";
import {getMemoChatSummary, listMemoChatBetween} from "@/services/memo";

const route = useRoute();
const router = useRouter();

const summary = ref<MemoChatSummaryView>();
const messages = ref<MemoChatView[]>([]);

const friend = computed(() => summary.value?.friend_id ? useMemoFriendStore().friendMap.get(summary.value?.friend_id) : undefined);

const data = computed<Array<MemoChatItemView>>(() => messages.value.map(chat => ({
  id: chat.id,
  sender: chat.role,
  content: chat.content,
  timestamp: chat.created_at
})))

onMounted(async () => {
  const id = route.params.id as string;
  if (id) {
    await loadSummary(id);
  }
});

async function loadSummary(id: string) {
  summary.value = await getMemoChatSummary(id);
  if (summary.value) {
    messages.value = await listMemoChatBetween(summary.value.friend_id, summary.value.start_time, summary.value.end_time);
  }
}

function goBack() {
  router.back();
}
</script>

<style scoped lang="less">
@import "MemoSummary.less";
</style>
