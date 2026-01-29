<template>
  <div class="behavior-section local-scroll">
    <div v-if="data.length === 0" class="empty-state">
      <span class="empty-icon">🎯</span>
      <p class="empty-text">暂无行为记录</p>
      <p class="empty-hint">记录你的行为，培养好习惯</p>
    </div>
    <div v-else class="behavior-list">
      <div
        v-for="item in data"
        :key="item.id"
        class="behavior-card monica-card"
        :class="{ expired: isExpired(item) }"
      >
        <div class="behavior-header">
          <t-tag
            :theme="getTypeTheme(item.type)"
            size="small"
            class="type-tag"
          >
            {{ getTypeLabel(item.type) }}
          </t-tag>
          <t-tag
            :theme="getPriorityTheme(item.priority)"
            size="small"
            class="priority-tag"
          >
            优先级 {{ item.priority }}/9
          </t-tag>
          <t-tag
            :theme="getStatusTheme(item.status)"
            size="small"
            class="status-tag"
          >
            {{ getStatusLabel(item.status) }}
          </t-tag>
          <span class="expire-time">{{ getExpireText(item.expire_at) }}</span>
        </div>
        <div class="behavior-body">
          <p class="behavior-text">{{ item.behavior }}</p>
          <div v-if="item.deadline > 0" class="deadline-section">
            <span class="deadline-label">截止时间：</span>
            <span class="deadline-value">{{ formatTime(item.deadline) }}</span>
          </div>
          <div v-if="item.reminder > 0" class="reminder-section">
            <span class="reminder-label">提醒时间：</span>
            <span class="reminder-value">{{ formatTime(item.reminder) }}</span>
          </div>
        </div>
        <div class="behavior-footer">
          <span class="source-label">{{ item.source === 'memo' ? '📝 Memo' : '💬 聊天' }}</span>
          <span class="created-time">{{ formatTime(item.created_at) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { MemoLayerBehavior } from '@/entity/memo'

interface Props {
  data: MemoLayerBehavior[]
}

defineProps<Props>()

const isExpired = (item: MemoLayerBehavior) => {
  return Date.now() > item.expire_at
}

const getTypeTheme = (type: string): 'default' | 'primary' | 'warning' | 'danger' | 'success' => {
  const themes: Record<string, 'default' | 'primary' | 'warning' | 'danger' | 'success'> = {
    todo: 'primary',
    habit_cue: 'success',
    social_intent: 'warning',
    avoidance: 'danger',
    seeking: 'default'
  }
  return themes[type] || 'default'
}

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    todo: '待办',
    habit_cue: '习惯提示',
    social_intent: '社交意图',
    avoidance: '回避',
    seeking: '寻求'
  }
  return labels[type] || type
}

const getPriorityTheme = (priority: number): 'default' | 'primary' | 'warning' | 'danger' | 'success' => {
  if (priority >= 7) return 'danger'
  if (priority >= 4) return 'warning'
  return 'default'
}

const getStatusTheme = (status: string): 'default' | 'primary' | 'warning' | 'danger' | 'success' => {
  const themes: Record<string, 'default' | 'primary' | 'warning' | 'danger' | 'success'> = {
    active: 'success',
    completed: 'default',
    snoozed: 'warning',
    expired: 'danger'
  }
  return themes[status] || 'default'
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    active: '进行中',
    completed: '已完成',
    snoozed: '已推迟',
    expired: '已过期'
  }
  return labels[status] || status
}

const getExpireText = (expireAt: number) => {
  const now = Date.now()
  const remaining = expireAt - now
  const days = Math.floor(remaining / (1000 * 60 * 60 * 24))

  if (remaining <= 0) return '已过期'
  if (days > 0) return `还剩 ${days} 天`
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
</script>

<style scoped lang="less">
@import '@/assets/style/monica.less';

.behavior-section {
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

.behavior-list {
  display: flex;
  flex-direction: column;
  gap: var(--monica-spacing-md);
}

.behavior-card {
  padding: var(--monica-spacing-lg);
  transition: all 0.3s ease;
}

.behavior-card.expired {
  opacity: 0.5;
  text-decoration: line-through;
  background: var(--monica-warm-bg-secondary);
}

.behavior-card.expired .behavior-text,
.behavior-card.expired .deadline-value,
.behavior-card.expired .reminder-value {
  color: var(--monica-text-tertiary);
}

.behavior-header {
  display: flex;
  align-items: center;
  gap: var(--monica-spacing-sm);
  margin-bottom: var(--monica-spacing-md);
  flex-wrap: wrap;
}

.type-tag,
.priority-tag,
.status-tag {
  margin-left: var(--monica-spacing-sm);
}

.expire-time {
  font-size: var(--monica-font-xs);
  color: var(--monica-text-tertiary);
  padding: 2px 8px;
  background: var(--monica-warm-bg-secondary);
  border-radius: var(--monica-radius-sm);
  margin-left: auto;
}

.behavior-body {
  margin-bottom: var(--monica-spacing-md);
}

.behavior-text {
  font-size: var(--monica-font-md);
  color: var(--monica-text-primary);
  line-height: 1.6;
  margin: 0 0 var(--monica-spacing-sm) 0;
}

.deadline-section,
.reminder-section {
  display: flex;
  align-items: center;
  gap: var(--monica-spacing-sm);
  font-size: var(--monica-font-sm);
}

.deadline-label,
.reminder-label {
  color: var(--monica-text-secondary);
  font-weight: 500;
}

.deadline-value,
.reminder-value {
  color: var(--monica-text-primary);
}

.behavior-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--monica-spacing-md);
  border-top: 1px solid var(--monica-border);
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
