<template>
  <div class="emotion-section local-scroll">
    <div v-if="data.length === 0" class="empty-state">
      <span class="empty-icon">😊</span>
      <p class="empty-text">暂无情绪记录</p>
      <p class="empty-hint">记录你的情绪，让 AI 更懂你</p>
    </div>
    <div v-else class="emotion-list">
      <div
        v-for="item in data"
        :key="item.id"
        class="emotion-card monica-card"
        :class="{ expired: isExpired(item) }"
      >
        <div class="emotion-header">
          <span class="emotion-icon">{{ getEmotionIcon(item.emotion_type) }}</span>
          <span class="emotion-type">{{ getEmotionLabel(item.emotion_type) }}</span>
          <t-tag
            :theme="getIntensityTheme(item.intensity)"
            size="small"
            class="intensity-tag"
          >
            强度 {{ item.intensity }}/9
          </t-tag>
          <span class="expire-time">{{ getExpireText(item.expire_at) }}</span>
        </div>
        <div class="emotion-body">
          <p class="trigger-topic">{{ item.trigger_topic }}</p>
        </div>
        <div class="emotion-footer">
          <span class="source-label">{{ item.source === 'memo' ? '📝 Memo' : '💬 聊天' }}</span>
          <span class="created-time">{{ formatTime(item.created_at) }}</span>
        </div>
        <div class="emotion-actions">
          <t-dropdown trigger="click">
            <t-button size="small" variant="text" shape="square">
              <template #icon><t-icon name="more" /></template>
            </t-button>
            <t-dropdown-menu>
              <t-dropdown-item @click="openSetExpireDialog(item)">
                {{ isExpired(item) ? '设置过期时间' : '设为过期' }}
              </t-dropdown-item>
              <t-dropdown-item v-if="!isExpired(item)" @click="openExtendExpireDialog(item)">
                延长过期时间
              </t-dropdown-item>
            </t-dropdown-menu>
          </t-dropdown>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { MemoLayerEmotion } from '@/entity/memo'
import { openSetExpireDialog as openSetExpireDialogFn, openExtendExpireDialog as openExtendExpireDialogFn } from './MemoExpireDialog'

interface Props {
  data: MemoLayerEmotion[]
}

defineProps<Props>()
const emit = defineEmits(['refresh'])

const isExpired = (item: MemoLayerEmotion) => {
  return Date.now() > item.expire_at
}

const getEmotionIcon = (type: string) => {
  const icons: Record<string, string> = {
    anger: '😠',
    joy: '😊',
    anxiety: '😰',
    sadness: '😢',
    fear: '😨',
    disgust: '🤢',
    surprise: '😲',
    neutral: '😐'
  }
  return icons[type] || '😐'
}

const getEmotionLabel = (type: string) => {
  const labels: Record<string, string> = {
    anger: '生气',
    joy: '满足',
    anxiety: '焦虑',
    sadness: '悲伤',
    fear: '害怕',
    disgust: '厌恶',
    surprise: '惊讶',
    neutral: '中性'
  }
  return labels[type] || type
}

const getIntensityTheme = (intensity: number): 'default' | 'primary' | 'warning' | 'danger' | 'success' => {
  if (intensity >= 7) return 'danger'
  if (intensity >= 4) return 'warning'
  return 'default'
}

const getExpireText = (expireAt: number) => {
  const now = Date.now()
  const remaining = expireAt - now
  const hours = Math.floor(remaining / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)

  if (remaining <= 0) return '已过期'
  if (days > 0) return `还剩 ${days} 天`
  if (hours > 0) return `还剩 ${hours} 小时`
  return '即将过期'
}

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const openSetExpireDialog = (item: MemoLayerEmotion) => {
  openSetExpireDialogFn(item.id, item.expire_at, isExpired(item), item.created_at, () => emit('refresh'), 'emotion' as const)
}

const openExtendExpireDialog = (item: MemoLayerEmotion) => {
  openExtendExpireDialogFn(item.id, () => emit('refresh'), 'emotion' as const)
}
</script>

<style scoped lang="less">
@import '@/assets/style/monica.less';

.emotion-section {
  height: 100%;
  overflow-y: auto;
  padding: var(--monica-spacing-sm);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--monica-text-secondary);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: var(--monica-spacing-lg);
  opacity: 0.5;
}

.empty-text {
  font-size: var(--monica-font-lg);
  margin-bottom: var(--monica-spacing-sm);
}

.empty-hint {
  font-size: var(--monica-font-sm);
  color: var(--monica-text-tertiary);
}

.emotion-list {
  display: flex;
  flex-direction: column;
  gap: var(--monica-spacing-md);
}

.emotion-card {
  padding: var(--monica-spacing-lg);
  transition: all 0.3s ease;
  position: relative;
}

.emotion-card.expired {
  opacity: 0.5;
  text-decoration: line-through;
  background: var(--monica-warm-bg-secondary);
}

.emotion-card.expired .emotion-type,
.emotion-card.expired .trigger-topic {
  color: var(--monica-text-tertiary);
}

.emotion-header {
  display: flex;
  align-items: center;
  gap: var(--monica-spacing-sm);
  margin-bottom: var(--monica-spacing-md);
  padding-right: 40px;
}

.emotion-icon {
  font-size: 28px;
}

.emotion-type {
  font-size: var(--monica-font-lg);
  font-weight: 600;
  color: var(--monica-text-primary);
  flex: 1;
}

.intensity-tag {
  margin-left: var(--monica-spacing-sm);
}

.expire-time {
  font-size: var(--monica-font-xs);
  color: var(--monica-text-tertiary);
  padding: 2px 8px;
  background: var(--monica-warm-bg-secondary);
  border-radius: var(--monica-radius-sm);
}

.emotion-body {
  margin-bottom: var(--monica-spacing-md);
}

.trigger-topic {
  font-size: var(--monica-font-md);
  color: var(--monica-text-primary);
  line-height: 1.6;
  margin: 0;
}

.emotion-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--monica-spacing-md);
  border-top: 1px solid var(--monica-border);
}

.emotion-actions {
  position: absolute;
  top: var(--monica-spacing-md);
  right: var(--monica-spacing-md);
}

.source-label {
  font-size: var(--monica-font-sm);
  color: var(--monica-text-secondary);
}

.created-time {
  font-size: var(--monica-font-xs);
  color: var(--monica-text-tertiary);
}
</style>
