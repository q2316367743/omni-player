<template>
  <div class="friend-detail">
    <div class="detail-header">
      <div class="detail-avatar-wrap">
        <img :src="friend.avatar ?? defaultAvatar" class="detail-avatar" :alt="friend.name"/>
        <div class="detail-status" :class="moodToStatus(friend.current_mood)"></div>
      </div>
      <div class="detail-title">
        <h2 class="detail-name">{{ friend.name }}</h2>
        <span class="detail-archetype">{{ getArchetypeText(friend.archetype) }}</span>
      </div>
      <button class="detail-close-btn" @click="$emit('close')">×</button>
    </div>

    <div class="detail-content local-scroll">
      <div class="detail-section">
        <h3 class="section-title">基础信息</h3>
        <div class="info-grid">
          <div class="info-item full-width">
            <span class="info-label">职业</span>
            <span class="info-value">{{ friend.occupation }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">模型</span>
            <span class="info-value model-value">{{ friend.model }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">性别</span>
            <span class="info-value">{{ getGenderText(friend.gender) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">年龄</span>
            <span class="info-value">{{ getAgeRangeText(friend.age_range) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">关系</span>
            <span class="info-value">{{ getRelationText(friend.relation) }}</span>
          </div>
        </div>
      </div>

      <div class="detail-section">
        <h3 class="section-title">人设描述</h3>
        <p class="section-text">{{ friend.personality_prompt }}</p>
      </div>

      <div class="detail-section">
        <h3 class="section-title">性格标签</h3>
        <div class="tags-container">
          <span v-for="tag in personalityTags" :key="tag" class="detail-tag">{{ tag }}</span>
        </div>
      </div>

      <div class="detail-section">
        <h3 class="section-title">语言风格</h3>
        <p class="section-text">{{ friend.speaking_style }}</p>
      </div>

      <div class="detail-section">
        <h3 class="section-title">背景故事</h3>
        <p class="section-text">{{ friend.background_story }}</p>
      </div>

      <div class="detail-section">
        <h3 class="section-title">关系状态</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">亲密度</span>
            <span class="stat-value">{{ friend.intimacy_score }}/100</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">信任度</span>
            <span class="stat-value">{{ friend.trust_level }}/100</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">当前情绪</span>
            <span class="stat-value">{{ getMoodText(friend.current_mood) }}</span>
          </div>
        </div>
      </div>

      <div class="detail-section">
        <h3 class="section-title">认知参数</h3>
        <div class="params-grid">
          <div class="param-item">
            <span class="param-label">记忆跨度</span>
            <span class="param-value">{{ getMemorySpanText(friend.memory_span) }}</span>
          </div>
          <div class="param-item">
            <span class="param-label">共情能力</span>
            <span class="param-value">{{ friend.emotional_depth }}/10</span>
          </div>
          <div class="param-item">
            <span class="param-label">主动性</span>
            <span class="param-value">{{ friend.proactivity_level }}/10</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import type { MemoFriend } from '@/entity/memo'
import {
  getArchetypeText,
  getMoodText,
  getMemorySpanText,
  getGenderText,
  getAgeRangeText,
  getRelationText,
  parsePersonalityTags,
  moodToStatus
} from '@/entity/memo/MemoFriend'

const props = defineProps<{
  friend: MemoFriend
}>()

defineEmits<{
  (e: 'close'): void
}>()

const defaultAvatar = 'https://api.dicebear.com/7.x/personas/svg?seed=default'

const personalityTags = computed(() => parsePersonalityTags(props.friend.personality_tags))
</script>

<style scoped lang="less">
@import '@/assets/style/monica.less';

.friend-detail {
  position: fixed;
  right: 0;
  top: 0;
  bottom: 0;
  width: 450px;
  background: var(--td-bg-color-container);
  box-shadow: -4px 0 24px var(--monica-shadow-strong);
  display: flex;
  flex-direction: column;
  z-index: 100;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: var(--monica-spacing-lg);
  padding: var(--monica-spacing-lg);
  background: linear-gradient(135deg, var(--monica-coral) 0%, var(--monica-coral-light) 100%);
}

.detail-avatar-wrap {
  position: relative;
  display: inline-block;
}

.detail-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 3px solid var(--monica-warm-bg);
}

.detail-status {
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid var(--monica-warm-bg);
}

.detail-status.online {
  background: #4caf50;
}

.detail-status.busy {
  background: #ff9800;
}

.detail-title {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-name {
  color: white;
  font-size: var(--monica-font-xl);
  font-weight: 600;
  margin: 0;
}

.detail-archetype {
  color: rgba(255, 255, 255, 0.8);
  font-size: var(--monica-font-sm);
}

.detail-close-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.detail-close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.detail-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--monica-spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--monica-spacing-lg);
}

.detail-section {
  background: var(--monica-warm-bg-secondary);
  border-radius: var(--monica-radius-md);
  padding: var(--monica-spacing-lg);
}

.section-title {
  font-size: var(--monica-font-md);
  font-weight: 600;
  color: var(--monica-text-primary);
  margin: 0 0 var(--monica-spacing-sm) 0;
}

.section-text {
  font-size: var(--monica-font-sm);
  color: var(--monica-text-secondary);
  line-height: 1.6;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--monica-spacing-md);
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item.full-width {
  grid-column: span 2;
}

.info-label {
  font-size: var(--monica-font-xs);
  color: var(--monica-text-tertiary);
}

.info-value {
  font-size: var(--monica-font-sm);
  font-weight: 600;
  color: var(--monica-text-primary);
}

.info-value.model-value {
  color: var(--monica-coral);
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: var(--monica-spacing-xs);
}

.detail-tag {
  background: var(--monica-coral-light);
  color: var(--monica-text-primary);
  font-size: var(--monica-font-xs);
  padding: 4px 12px;
  border-radius: var(--monica-radius-sm);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--monica-spacing-md);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-item .stat-label {
  font-size: var(--monica-font-xs);
  color: var(--monica-text-tertiary);
}

.stat-item .stat-value {
  font-size: var(--monica-font-lg);
  font-weight: 600;
  color: var(--monica-coral);
}

.params-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--monica-spacing-md);
}

.param-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.param-label {
  font-size: var(--monica-font-xs);
  color: var(--monica-text-tertiary);
}

.param-value {
  font-size: var(--monica-font-md);
  font-weight: 600;
  color: var(--monica-text-primary);
}
</style>
