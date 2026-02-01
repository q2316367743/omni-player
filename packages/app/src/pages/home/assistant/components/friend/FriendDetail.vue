<template>
  <div class="friend-detail">
    <div class="detail-header">
      <div class="detail-avatar-wrap">
        <XhAvatar 
          :model-value="friend.avatar" 
          :size="64" 
          shape="circle" 
          :editable="true"
          folder="memo/friend"
          @update:model-value="handleAvatarUpdate"
        />
        <div class="detail-status" :class="moodToStatus(friend.current_mood)"></div>
      </div>
      <div class="detail-title">
        <h2 class="detail-name">{{ friend.name }}</h2>
        <span class="detail-archetype">{{ getArchetypeText(friend.archetype) }}</span>
      </div>
      <button class="detail-close-btn" @click="$emit('close')">×</button>
    </div>

    <div class="detail-content local-scroll">
      <div class="data-block static-block">
        <h3 class="block-title">静态人设</h3>
        <div class="detail-section">
          <h4 class="section-title">基础信息</h4>
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
          <h4 class="section-title">人设描述</h4>
          <p class="section-text">{{ friend.personality_prompt }}</p>
        </div>

        <div class="detail-section">
          <h4 class="section-title">性格标签</h4>
          <div class="tags-container">
            <span v-for="tag in personalityTags" :key="tag" class="detail-tag">{{ tag }}</span>
          </div>
        </div>

        <div class="detail-section">
          <h4 class="section-title">语言风格</h4>
          <p class="section-text">{{ friend.speaking_style }}</p>
        </div>

        <div class="detail-section">
          <h4 class="section-title">背景故事</h4>
          <p class="section-text">{{ friend.background_story }}</p>
        </div>

        <div class="detail-section">
          <h4 class="section-title">知识域</h4>
          <div class="info-grid">
            <div class="info-item full-width">
              <span class="info-label">擅长领域</span>
              <span class="info-value">{{ friend.knowledge_scope.domains.join('、') || '无' }}</span>
            </div>
            <div class="info-item full-width">
              <span class="info-label">知识盲区</span>
              <span class="info-value">{{ friend.knowledge_scope.blindspots.join('、') || '无' }}</span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h4 class="section-title">认知参数</h4>
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

      <div class="data-block dynamic-block">
        <h3 class="block-title">动态状态</h3>
        <div class="detail-section">
          <h4 class="section-title">关系状态</h4>
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
          <h4 class="section-title">互动统计</h4>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-label">对话次数</span>
              <span class="stat-value">{{ friend.interaction_count }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">互动频率</span>
              <span class="stat-value">{{ friend.conversation_frequency || '未知' }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">未知memo</span>
              <span class="stat-value">{{ friend.unknown_memo_count }}</span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h4 class="section-title">关系里程碑</h4>
          <div v-if="friend.relationship_milestones.length > 0" class="milestones-list">
            <div v-for="milestone in friend.relationship_milestones" :key="milestone.date" class="milestone-item">
              <span class="milestone-event">{{ milestone.event }}</span>
              <span class="milestone-date">{{ formatDate(milestone.date) }}</span>
            </div>
          </div>
          <p v-else class="section-text">暂无里程碑</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type {MemoFriendView} from '@/entity/memo'
import {
  getArchetypeText,
  getMoodText,
  getMemorySpanText,
  getGenderText,
  getAgeRangeText,
  getRelationText,
  moodToStatus
} from '@/entity/memo/MemoFriend'
import XhAvatar from '@/components/avatar/XhAvatar.vue'
import { useMemoFriendStore } from '@/store/MemoFriendStore'
import { formatDate } from '@/util/lang/FormatUtil'

const props = defineProps<{
  friend: MemoFriendView
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'update:friend', friend: MemoFriendView): void
}>()

const personalityTags = computed(() => props.friend.personality_tags)

const memoFriendStore = useMemoFriendStore()

async function handleAvatarUpdate(newAvatar: string) {
  await memoFriendStore.updateFriendStatic(props.friend.id, { avatar: newAvatar })
  emit('update:friend', {
    ...props.friend,
    avatar: newAvatar
  })
}
</script>

<style scoped lang="less">
@import 'less/FriendDetail.less';
</style>
