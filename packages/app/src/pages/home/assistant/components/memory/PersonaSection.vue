<template>
  <div class="persona-section local-scroll">
    <div v-if="data.length === 0" class="empty-state">
      <span class="empty-icon">🎭</span>
      <p class="empty-text">暂无人格记录</p>
      <p class="empty-hint">记录你的人格特质变化</p>
    </div>
    <div v-else class="persona-list">
      <div
        v-for="item in data"
        :key="item.id"
        class="persona-card monica-card"
        :class="{ expired: isExpired(item) }"
      >
        <div class="persona-header">
          <span class="trait-badge">{{ getTraitLabel(item.trait_name) }}</span>
          <t-tag
            :theme="getDeltaTheme(item.delta)"
            size="small"
            class="delta-tag"
          >
            {{ item.delta > 0 ? '+' : '' }}{{ item.delta }}
          </t-tag>
          <t-tag
            :theme="getConfidenceTheme(item.confidence)"
            size="small"
            class="confidence-tag"
          >
            置信度 {{ item.confidence }}%
          </t-tag>
          <span class="expire-time">{{ getExpireText(item.expire_at) }}</span>
        </div>
        <div class="persona-body">
          <div class="baseline-section">
            <span class="baseline-label">基线水平：</span>
            <t-progress
            :percentage="item.baseline_trait"
            :label="true"
            :show-info="true"
            size="small"
          />
          </div>
          <div v-if="item.evidence_snippet" class="evidence-section">
            <span class="evidence-label">证据片段：</span>
            <p class="evidence-text">{{ item.evidence_snippet }}</p>
          </div>
        </div>
        <div class="persona-footer">
          <span class="source-label">{{ item.source === 'memo' ? '📝 Memo' : '💬 聊天' }}</span>
          <span class="created-time">{{ formatTime(item.created_at) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { MemoLayerPersona } from '@/entity/memo'

interface Props {
  data: MemoLayerPersona[]
}

defineProps<Props>()

const isExpired = (item: MemoLayerPersona) => {
  return Date.now() > item.expire_at
}

const getTraitLabel = (trait: string) => {
  const labels: Record<string, string> = {
    openness: '开放性',
    conscientiousness: '尽责性',
    extraversion: '外向性',
    agreeableness: '友好性',
    neuroticism: '神经质',
    resilience: '弹性',
    curiosity: '好奇心',
    optimism: '乐观'
  }
  return labels[trait] || trait
}

const getDeltaTheme = (delta: number): 'default' | 'primary' | 'warning' | 'danger' | 'success' => {
  if (delta > 10) return 'success'
  if (delta < -10) return 'danger'
  return 'default'
}

const getConfidenceTheme = (confidence: number): 'default' | 'primary' | 'warning' | 'danger' | 'success' => {
  if (confidence >= 80) return 'success'
  if (confidence >= 50) return 'warning'
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
</script>

<style scoped lang="less">
@import '@/assets/style/monica.less';

.persona-section {
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

.persona-list {
  display: flex;
  flex-direction: column;
  gap: var(--monica-spacing-md);
}

.persona-card {
  padding: var(--monica-spacing-lg);
  transition: all 0.3s ease;
}

.persona-card.expired {
  opacity: 0.5;
  text-decoration: line-through;
  background: var(--monica-warm-bg-secondary);
}

.persona-card.expired .trait-badge,
.persona-card.expired .evidence-text {
  color: var(--monica-text-tertiary);
}

.persona-header {
  display: flex;
  align-items: center;
  gap: var(--monica-spacing-sm);
  margin-bottom: var(--monica-spacing-md);
  flex-wrap: wrap;
}

.trait-badge {
  font-size: var(--monica-font-lg);
  font-weight: 600;
  color: var(--monica-text-primary);
  background: var(--monica-coral-light);
  padding: 4px 12px;
  border-radius: var(--monica-radius-sm);
}

.delta-tag,
.confidence-tag {
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

.persona-body {
  margin-bottom: var(--monica-spacing-md);
}

.baseline-section {
  display: flex;
  align-items: center;
  gap: var(--monica-spacing-sm);
  margin-bottom: var(--monica-spacing-md);
}

.baseline-label {
  font-size: var(--monica-font-sm);
  color: var(--monica-text-secondary);
  font-weight: 500;
  white-space: nowrap;
  min-width: 80px;
}

.baseline-section :deep(.t-progress) {
  flex: 1;
}

.evidence-section {
  display: flex;
  flex-direction: column;
  gap: var(--monica-spacing-xs);
}

.evidence-label {
  font-size: var(--monica-font-sm);
  color: var(--monica-text-secondary);
  font-weight: 500;
}

.evidence-text {
  font-size: var(--monica-font-sm);
  color: var(--monica-text-primary);
  line-height: 1.6;
  margin: 0;
  padding: var(--monica-spacing-sm);
  background: var(--monica-warm-bg-secondary);
  border-radius: var(--monica-radius-sm);
  border-left: 3px solid var(--monica-coral);
}

.persona-footer {
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
