<template>
  <div class="cognitive-section local-scroll">
    <div v-if="data.length === 0" class="empty-state">
      <span class="empty-icon">🧠</span>
      <p class="empty-text">暂无认知记录</p>
      <p class="empty-hint">记录你的思考，发现认知模式</p>
    </div>
    <div v-else class="cognitive-list">
      <div
        v-for="item in data"
        :key="item.id"
        class="cognitive-card monica-card"
        :class="{ expired: isExpired(item) }"
      >
        <div class="cognitive-header">
          <span class="topic-badge">{{ item.topic }}</span>
          <t-tag
            :theme="getTypeTheme(item.type)"
            size="small"
            class="type-tag"
          >
            {{ getTypeLabel(item.type) }}
          </t-tag>
          <t-tag
            :theme="getImportanceTheme(item.importance)"
            size="small"
            class="importance-tag"
          >
            重要性 {{ item.importance }}/9
          </t-tag>
          <span class="expire-time">{{ getExpireText(item.expire_at) }}</span>
        </div>
        <div class="cognitive-body">
          <div class="distortion-section">
            <span class="distortion-label">认知扭曲：</span>
            <span class="distortion-value">{{ item.cognitive_distortion }}</span>
          </div>
        </div>
        <div class="cognitive-footer">
          <span class="source-label">{{ item.source === 'memo' ? '📝 Memo' : '💬 聊天' }}</span>
          <span class="created-time">{{ formatTime(item.created_at) }}</span>
        </div>
        <div class="cognitive-actions">
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
import type { MemoLayerCognitive } from '@/entity/memo'
import { openSetExpireDialog as openSetExpireDialogFn, openExtendExpireDialog as openExtendExpireDialogFn } from './MemoExpireDialog'

interface Props {
  data: MemoLayerCognitive[]
}

defineProps<Props>()
const emit = defineEmits(['refresh'])

const isExpired = (item: MemoLayerCognitive) => {
  return Date.now() > item.expire_at
}

const getTypeTheme = (type: string): 'default' | 'primary' | 'warning' | 'danger' | 'success' => {
  const themes: Record<string, 'default' | 'primary' | 'warning' | 'danger' | 'success'> = {
    value_conflict: 'danger',
    unsolved_problem: 'warning',
    growth_need: 'success',
    relationship_issue: 'warning',
    existential: 'default'
  }
  return themes[type] || 'default'
}

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    value_conflict: '价值观冲突',
    unsolved_problem: '未解决问题',
    growth_need: '成长需求',
    relationship_issue: '关系问题',
    existential: '存在性思考'
  }
  return labels[type] || type
}

const getImportanceTheme = (importance: number) => {
  if (importance >= 7) return 'danger'
  if (importance >= 4) return 'warning'
  return 'default'
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

const openSetExpireDialog = (item: MemoLayerCognitive) => {
  openSetExpireDialogFn(item.id, item.expire_at, isExpired(item), item.created_at, () => emit('refresh'), 'cognitive' as const)
}

const openExtendExpireDialog = (item: MemoLayerCognitive) => {
  openExtendExpireDialogFn(item.id, () => emit('refresh'), 'cognitive' as const)
}
</script>

<style scoped lang="less">
@import '@/assets/style/monica.less';

.cognitive-section {
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

.cognitive-list {
  display: flex;
  flex-direction: column;
  gap: var(--monica-spacing-md);
}

.cognitive-card {
  padding: var(--monica-spacing-lg);
  transition: all 0.3s ease;
  position: relative;
}

.cognitive-card.expired {
  opacity: 0.5;
  text-decoration: line-through;
  background: var(--monica-warm-bg-secondary);
}

.cognitive-card.expired .topic-badge,
.cognitive-card.expired .distortion-value {
  color: var(--monica-text-tertiary);
}

.cognitive-header {
  display: flex;
  align-items: center;
  gap: var(--monica-spacing-sm);
  margin-bottom: var(--monica-spacing-md);
  flex-wrap: wrap;
  padding-right: 40px;
}

.topic-badge {
  font-size: var(--monica-font-lg);
  font-weight: 600;
  color: var(--monica-text-primary);
  background: var(--monica-coral-light);
  padding: 4px 12px;
  border-radius: var(--monica-radius-sm);
}

.type-tag,
.importance-tag {
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

.cognitive-body {
  margin-bottom: var(--monica-spacing-md);
}

.distortion-section {
  display: flex;
  align-items: flex-start;
  gap: var(--monica-spacing-sm);
}

.distortion-label {
  font-size: var(--monica-font-sm);
  color: var(--monica-text-secondary);
  font-weight: 500;
  white-space: nowrap;
}

.distortion-value {
  font-size: var(--monica-font-md);
  color: var(--monica-text-primary);
  line-height: 1.6;
}

.cognitive-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--monica-spacing-md);
  border-top: 1px solid var(--monica-border);
}

.cognitive-actions {
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
