<template>
  <div class="diary-page">
    <div class="page-header">
      <h1 class="page-title">日记</h1>
      <p class="page-subtitle">记录你的每一天</p>
    </div>

    <div class="timeline-section">
      <div class="timeline-header">
        <h2 class="timeline-title">日记记录</h2>
        <span class="memo-count">{{ summaries.length }}篇日记</span>
      </div>
      <div class="timeline-content local-scroll" ref="scrollContainer" @scroll="handleScroll">
        <TransitionGroup name="timeline-item" tag="div" class="timeline">
          <div
            v-for="summary in summaries"
            :key="summary.id"
            class="timeline-item"
          >
            <div class="timeline-time">{{ formatTime(summary.created_at) }}</div>
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
        </TransitionGroup>

        <div v-if="loading" class="loading-more">
          <div class="loading-spinner"></div>
          <span>加载中...</span>
        </div>

        <div v-if="!loading && summaries.length === 0" class="empty-timeline">
          <span class="empty-emoji">📝</span>
          <p class="empty-text">还没有日记记录</p>
          <p class="empty-hint">开始对话，AI会帮你记录日记吧！</p>
        </div>

        <div v-if="!hasMore && summaries.length > 0" class="no-more">
          <p class="no-more-text">没有更多了</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { MemoChatSummary } from '@/entity/memo/MemoChatSummary.ts'
import { pageMemoChatSummary } from '@/services/memo/MemoChatSummaryService.ts'
import { useMemoFriendStore } from '@/store/MemoFriendStore.ts'
import XhAvatar from '@/components/avatar/XhAvatar.vue'

const router = useRouter()
const summaries = ref<MemoChatSummary[]>([])
const loading = ref(false)
const hasMore = ref(true)
const currentPage = ref(1)
const pageSize = 10
const scrollContainer = ref<HTMLElement>()

const friendStore = useMemoFriendStore()

const loadSummaries = async (page: number) => {
  if (loading.value || !hasMore.value) return
  
  loading.value = true
  try {
    const result = await pageMemoChatSummary(page, pageSize)
    if (result.records && result.records.length > 0) {
      if (page === 1) {
        summaries.value = result.records
      } else {
        summaries.value.push(...result.records)
      }
      hasMore.value = result.records.length === pageSize
    } else {
      hasMore.value = false
    }
  } catch (error) {
    console.error('Failed to load summaries:', error)
  } finally {
    loading.value = false
  }
}

const handleScroll = () => {
  if (!scrollContainer.value || loading.value || !hasMore.value) return
  
  const { scrollTop, scrollHeight, clientHeight } = scrollContainer.value
  const threshold = 50
  
  if (scrollTop + clientHeight >= scrollHeight - threshold) {
    currentPage.value++
    loadSummaries(currentPage.value)
  }
}

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp)
  return date.toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
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

const handleSummaryClick = (summaryId: string) => {
  router.push(`/memo/summary/${summaryId}`)
}

onMounted(async () => {
  await friendStore.loadFriends()
  await loadSummaries(1)
})
</script>

<style scoped lang="less">
@import "./DiaryPage.less";
</style>
