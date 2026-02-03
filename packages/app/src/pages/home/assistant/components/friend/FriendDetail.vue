<template>
  <div class="friend-detail">
    <div v-if="loading" class="loading-state">
      <p>加载中...</p>
    </div>
    <template v-else>
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
              <span class="info-value">{{ getAgeRangeText(friend.age_range) }}{{ friend.age_exact ? `(${friend.age_exact}岁)` : '' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">如何称呼我</span>
              <span class="info-value">{{ friend.preferred_name || '无' }}</span>
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
            <div class="info-item full-width">
              <span class="info-label">禁忌话题</span>
              <span class="info-value">{{ friend.taboo_topics.join('、') || '无' }}</span>
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

        <div class="detail-section">
          <h4 class="section-title">朋友圈行为配置</h4>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">发圈风格</span>
              <span class="info-value">{{ getPostingStyleText(friend.posting_style) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">发圈周期</span>
              <span class="info-value">{{ friend.autopost_interval_hours }}小时</span>
            </div>
            <div class="info-item">
              <span class="info-label">每周上限</span>
              <span class="info-value">{{ friend.max_posts_per_week }}条</span>
            </div>
            <div class="info-item">
              <span class="info-label">活跃时段</span>
              <span class="info-value">{{ friend.active_hours.start }}:00 - {{ friend.active_hours.end }}:00</span>
            </div>
            <div class="info-item full-width">
              <span class="info-label">触发方式</span>
              <span class="info-value">{{ getPostingTriggersText(friend.posting_triggers) }}</span>
            </div>
            <div class="info-item full-width">
              <span class="info-label">触发关键词</span>
              <span class="info-value">{{ friend.trigger_keywords.join('、') || '无' }}</span>
            </div>
            <div class="info-item full-width" v-if="friend.state_trigger_condition">
              <span class="info-label">状态触发条件</span>
              <span class="info-value">{{ getStateTriggerText(friend.state_trigger_condition) }}</span>
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
              <span class="stat-label">上次互动</span>
              <span class="stat-value">{{ getTimeSinceLastInteraction(friend.last_interaction) }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">未知memo</span>
              <span class="stat-value">{{ friend.unknown_memo_count }}</span>
            </div>
            <div class="stat-item full-width">
              <span class="stat-label">已知memo分类</span>
              <span class="stat-value">{{ friend.known_memo_categories.join('、') || '全部分类' }}</span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h4 class="section-title">情绪状态</h4>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-label">当前情绪</span>
              <span class="stat-value">{{ getMoodText(friend.current_mood) }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">情绪持续时间</span>
              <span class="stat-value">{{ friend.mood_expires_at ? formatDate(friend.mood_expires_at) : '未设置' }}</span>
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
    </template>
  </div>
</template>

<script lang="ts" setup>
import type {MemoFriendStaticView, MemoFriendView} from '@/entity/memo'
import {
  getArchetypeText,
  getMoodText,
  getMemorySpanText,
  getGenderText,
  getAgeRangeText,
  getRelationText,
  moodToStatus,
  getPostingStyleText
} from '@/entity/memo/MemoFriend'
import XhAvatar from '@/components/avatar/XhAvatar.vue'
import { useMemoFriendStore } from '@/store/MemoFriendStore'
import { formatDate } from '@/util/lang/DateUtil.ts'

const props = defineProps<{
  friend: MemoFriendStaticView
}>()

defineEmits<{
  (e: 'close'): void
}>()

const memoFriendStore = useMemoFriendStore()

const fullFriend = ref<MemoFriendView | undefined>()
const loading = ref(true)

watch(() => props.friend.id, async (newId) => {
  if (newId) {
    loading.value = true
    fullFriend.value = await memoFriendStore.fetchFriend(newId)
    loading.value = false
  }
}, { immediate: true })

const friend = computed<MemoFriendView>(() => fullFriend.value || {
  ...props.friend,
  intimacy_score: 0,
  trust_level: 0,
  interaction_count: 0,
  last_interaction: 0,
  conversation_frequency: '',
  relationship_milestones: [],
  known_memo_categories: [],
  unknown_memo_count: 0,
  current_mood: 'happy',
  mood_expires_at: 0
})

const personalityTags = computed(() => friend.value.personality_tags)

async function handleAvatarUpdate(newAvatar: string) {
  await memoFriendStore.updateFriendStatic(props.friend.id, { avatar: newAvatar })
}

function getPostingTriggersText(triggers: string[]): string {
  const map: Record<string, string> = {
    keyword: '关键词触发',
    periodic: '定期触发',
    state_based: '基于状态触发'
  }
  return triggers.map(t => map[t] || t).join('、') || '无'
}

function getStateTriggerText(condition: any): string {
  if (!condition) return '无'
  const operatorMap: Record<string, string> = {
    '>': '大于',
    '>=': '大于等于',
    '=': '等于',
    '<=': '小于等于',
    '<': '小于',
    '!=': '不等于'
  }
  return `${condition.trait} ${operatorMap[condition.operator] || condition.operator} ${condition.threshold}`
}

function getTimeSinceLastInteraction(lastInteraction: number): string {
  if (!lastInteraction || lastInteraction <= 0) {
    return '很久以前'
  }

  const now = Date.now()
  let deltaMs = now - lastInteraction
  if (deltaMs < 0) deltaMs = 0

  const s = Math.floor(deltaMs / 1000)
  if (s < 60) return '刚刚'

  const m = Math.floor(s / 60)
  if (m < 60) return `${m}分钟前`

  const h = Math.floor(m / 60)
  if (h < 24) return `${h}小时前`

  const d = Math.floor(h / 24)
  if (d < 7) return `${d}天前`

  const w = Math.floor(d / 7)
  if (w < 5) return `${w}周前`

  const mon = Math.floor(d / 30)
  if (mon < 12) return `${mon}月前`

  const y = Math.floor(d / 365)
  return `${y}年前`
}
</script>

<style scoped lang="less">
@import 'less/FriendDetail.less';
</style>
