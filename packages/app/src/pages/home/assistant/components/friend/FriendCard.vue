<template>
  <div
    class="partner-card monica-card"
    :class="{ active: active, locked: friend.is_locked === 1 }"
    @click="handleClick"
  >
    <div class="partner-avatar-wrap">
      <img :src="friend.avatar ?? defaultAvatar" class="partner-avatar" :alt="friend.name"/>
      <div class="partner-status" :class="moodToStatus(friend.current_mood)"></div>
      <div v-if="friend.is_locked === 1" class="locked-badge">🔒</div>
    </div>
    <h3 class="partner-name">{{ friend.name }}</h3>
    <p class="partner-personality">{{ getArchetypeText(friend.archetype) }}</p>
    <p class="partner-desc">{{ friend.personality_prompt }}</p>
    <div class="partner-tags">
      <span v-for="tag in visibleTags" :key="tag" class="partner-tag">{{ tag }}</span>
      <t-tooltip v-if="hiddenTagsCount > 0" :content="allTags.join('、')">
        <span class="partner-tag more-tag">+{{ hiddenTagsCount }}</span>
      </t-tooltip>
    </div>
    <div class="partner-stats">
      <div class="stat">
        <span class="stat-value">{{ friend.trust_level }}</span>
        <span class="stat-label">信任度</span>
      </div>
      <div class="stat">
        <span class="stat-value">{{ friend.intimacy_score }}</span>
        <span class="stat-label">亲密度</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import type { MemoFriend } from '@/entity/memo'
import {
  getArchetypeText,
  parsePersonalityTags,
  moodToStatus
} from '@/entity/memo/MemoFriend'

const props = defineProps<{
  friend: MemoFriend
  active?: boolean
}>()

const emit = defineEmits<{
  (e: 'click', friend: MemoFriend): void
}>()

const defaultAvatar = 'https://api.dicebear.com/7.x/personas/svg?seed=default'

const allTags = computed(() => parsePersonalityTags(props.friend.personality_tags))
const maxVisible = 6

const visibleTags = computed(() => {
  return allTags.value.slice(0, maxVisible)
})

const hiddenTagsCount = computed(() => {
  return Math.max(0, allTags.value.length - maxVisible)
})

const handleClick = () => {
  if (props.friend.is_locked === 1) return
  emit('click', props.friend)
}
</script>

<style scoped lang="less">
@import '@/assets/style/monica.less';

.partner-card {
  padding: var(--monica-spacing-lg);
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.partner-card:hover {
  transform: translateY(-4px);
}

.partner-card.active {
  border-color: var(--monica-coral);
  background: linear-gradient(135deg, var(--monica-warm-bg-secondary) 0%, var(--td-bg-color-container) 100%);
}

.partner-card.locked {
  opacity: 0.6;
  cursor: not-allowed;
}

.partner-card.locked:hover {
  transform: none;
}

.partner-avatar-wrap {
  position: relative;
  display: inline-block;
  margin-bottom: var(--monica-spacing-md);
}

.partner-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid var(--monica-coral-light);
}

.partner-status {
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid var(--monica-warm-bg);
}

.partner-status.online {
  background: #4caf50;
}

.partner-status.busy {
  background: #ff9800;
}

.locked-badge {
  position: absolute;
  top: 0;
  right: 0;
  width: 24px;
  height: 24px;
  background: var(--monica-warm-bg);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  box-shadow: 0 2px 4px var(--monica-shadow);
}

.partner-name {
  font-size: var(--monica-font-lg);
  font-weight: 600;
  color: var(--monica-text-primary);
  margin-bottom: var(--monica-spacing-xs);
}

.partner-personality {
  font-size: var(--monica-font-sm);
  color: var(--monica-coral);
  margin-bottom: var(--monica-spacing-sm);
}

.partner-desc {
  font-size: var(--monica-font-sm);
  color: var(--monica-text-tertiary);
  margin-bottom: var(--monica-spacing-md);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-word;
}

.partner-tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--monica-spacing-xs);
  margin-bottom: var(--monica-spacing-md);
}

.partner-tag {
  background: var(--monica-warm-bg-secondary);
  color: var(--monica-text-secondary);
  font-size: var(--monica-font-xs);
  padding: 2px 8px;
  border-radius: var(--monica-radius-sm);
}

.partner-tag.more-tag {
  background: var(--monica-coral-light);
  color: var(--monica-coral);
  font-weight: 600;
  cursor: pointer;
}

.partner-stats {
  display: flex;
  justify-content: center;
  gap: var(--monica-spacing-xl);
  padding-top: var(--monica-spacing-md);
  border-top: 1px solid var(--monica-border);
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: var(--monica-font-lg);
  font-weight: 600;
  color: var(--monica-coral);
}

.stat-label {
  font-size: var(--monica-font-xs);
  color: var(--monica-text-tertiary);
}
</style>
