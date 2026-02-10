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
          <DiaryTimeline v-for="summary in summaries" :key="summary.id" :summary="summary"/>
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
import type {DiaryItem} from '@/services/memo/MemoSessionSummaryService.ts'
import {pageDiaryItems} from '@/services/memo/MemoSessionSummaryService.ts'
import {useMemoFriendStore} from '@/store/MemoFriendStore.ts'
import DiaryTimeline from "@/pages/home/diary/DiaryTimeline.vue";

const summaries = ref<DiaryItem[]>([])
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
    const result = await pageDiaryItems(page, pageSize)
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

  const {scrollTop, scrollHeight, clientHeight} = scrollContainer.value
  const threshold = 50

  if (scrollTop + clientHeight >= scrollHeight - threshold) {
    currentPage.value++
    loadSummaries(currentPage.value)
  }
}

onMounted(async () => {
  await friendStore.loadFriends()
  await loadSummaries(1)
})
</script>

<style scoped lang="less">
@import "less/DiaryPage.less";
</style>
