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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
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
  loadSummaries(1)
})
</script>

<style scoped lang="less">
.diary-page {
  height: 100%;
  padding: var(--monica-spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--monica-spacing-lg);
  overflow: hidden;
}

.page-header {
  text-align: center;
}

.page-title {
  font-size: var(--monica-font-xxl);
  font-weight: 600;
  color: var(--monica-text-primary);
  margin-bottom: var(--monica-spacing-xs);
}

.page-subtitle {
  font-size: var(--monica-font-md);
  color: var(--monica-text-tertiary);
}

.timeline-section {
  flex: 1;
  background: var(--td-bg-color-container);
  border-radius: var(--monica-radius-lg);
  box-shadow: 0 2px 12px var(--monica-shadow);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--monica-spacing-lg);
  border-bottom: 1px solid var(--monica-border);
}

.timeline-title {
  font-size: var(--monica-font-lg);
  font-weight: 600;
  color: var(--monica-text-primary);
  margin: 0;
}

.memo-count {
  font-size: var(--monica-font-sm);
  color: var(--monica-text-tertiary);
}

.timeline-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--monica-spacing-lg);
}

.timeline {
  position: relative;
}

.timeline-item {
  display: flex;
  gap: var(--monica-spacing-md);
  margin-bottom: var(--monica-spacing-lg);
}

.timeline-time {
  width: 80px;
  font-size: var(--monica-font-sm);
  color: var(--monica-text-tertiary);
  text-align: right;
  padding-top: 4px;
  flex-shrink: 0;
}

.timeline-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.marker-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--monica-coral);
  border: 2px solid var(--td-bg-color-container);
  box-shadow: 0 0 0 2px var(--monica-coral-light);
  z-index: 1;
}

.marker-line {
  width: 2px;
  flex: 1;
  background: var(--monica-border);
  margin-top: 4px;
}

.timeline-item:last-child .marker-line {
  display: none;
}

.timeline-card {
  flex: 1;
  padding: var(--monica-spacing-md);
  cursor: pointer;
  transition: all 0.2s ease;
}

.timeline-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px var(--monica-shadow);
}

.summary-title {
  font-size: var(--monica-font-lg);
  font-weight: 600;
  color: var(--monica-text-primary);
  margin: 0 0 var(--monica-spacing-sm) 0;
}

.summary-text {
  font-size: var(--monica-font-md);
  color: var(--monica-text-primary);
  line-height: 1.6;
  margin-bottom: var(--monica-spacing-md);
}

.ai-comment {
  background: var(--monica-warm-bg-secondary);
  border-radius: var(--monica-radius-md);
  padding: var(--monica-spacing-md);
  margin-bottom: var(--monica-spacing-md);
}

.ai-header {
  display: flex;
  align-items: center;
  gap: var(--monica-spacing-sm);
  margin-bottom: var(--monica-spacing-sm);
}

.ai-name {
  font-size: var(--monica-font-sm);
  font-weight: 600;
  color: var(--monica-text-primary);
}

.ai-text {
  font-size: var(--monica-font-sm);
  color: var(--monica-text-secondary);
  line-height: 1.6;
  margin: 0;
}

.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--monica-spacing-sm);
  padding: var(--monica-spacing-lg);
  color: var(--monica-text-tertiary);
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--monica-border);
  border-top-color: var(--monica-coral);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-timeline {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--monica-spacing-xl);
  text-align: center;
}

.empty-emoji {
  font-size: 48px;
  margin-bottom: var(--monica-spacing-md);
}

.empty-text {
  font-size: var(--monica-font-md);
  color: var(--monica-text-secondary);
  margin-bottom: var(--monica-spacing-xs);
}

.empty-hint {
  font-size: var(--monica-font-sm);
  color: var(--monica-text-tertiary);
}

.no-more {
  display: flex;
  justify-content: center;
  padding: var(--monica-spacing-lg);
}

.no-more-text {
  font-size: var(--monica-font-sm);
  color: var(--monica-text-tertiary);
  margin: 0;
}

.timeline-item-enter-active,
.timeline-item-leave-active {
  transition: all 0.3s ease;
}

.timeline-item-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.timeline-item-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
