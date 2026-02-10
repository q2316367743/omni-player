<template>
  <div class="timeline-item">
    <div class="timeline-time">{{ prettyMessageDate(summary.created_at) }}</div>
    <div class="timeline-marker">
      <div class="marker-dot"></div>
      <div class="marker-line"></div>
    </div>
    <div class="timeline-card monica-card" @click="handleSummaryClick(summary.id)">
      <h3 class="summary-title">{{ summary.title }}</h3>
      <p class="summary-text">{{ getTruncatedSummary(summary.summary) }}</p>
      <div v-if="summary.ai_journal" class="ai-comment">
        <div class="ai-header">
          <XhAvatar :value="getFriendAvatar(summary.friend_id)" :size="24" shape="circle" />
          <span class="ai-name">{{ getFriendName(summary.friend_id) }}</span>
        </div>
        <p class="ai-text">{{ getTruncatedSummary(summary.ai_journal) }}</p>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import type {DiaryItem} from "@/services/memo";
import XhAvatar from "@/components/avatar/XhAvatar.vue";
import { prettyMessageDate} from "@/util/lang/DateUtil.ts";
import {useMemoFriendStore} from "@/store";

defineProps({
  summary: {
    type: Object as PropType<DiaryItem>,
    required: true
  }
});

const router = useRouter();
const friendStore = useMemoFriendStore();

const handleSummaryClick = (summaryId: string) => {
  router.push(`/memo/summary/${summaryId}`)
}
const getTruncatedSummary = (text: string) => {
  if (!text) return ''
  const lines = text.split('\n')
  if (lines.length <= 3) return text
  return lines.slice(0, 3).join('\n') + '...'
}

const getFriendName = (friendId: string) => {
  const friend = friendStore.friendMap.get(friendId)
  return friend?.name || 'AI'
}

const getFriendAvatar = (friendId: string) => {
  const friend = friendStore.friendMap.get(friendId)
  return friend?.avatar || ''
}

</script>
<style scoped lang="less">
@import "less/DiaryTimeline.less";
</style>
