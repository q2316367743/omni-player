<template>
  <div class="chat-area">
    <div class="chat-header">
      <t-popup trigger="click" placement="bottom-left" :showArrow="true">
        <div class="chat-header-left">
          <XhAvatar :value="friend.avatar" :size="40" shape="circle" />
          <div class="chat-header-info">
            <h3 class="chat-header-name">{{ friend.name }}</h3>
            <p class="chat-header-status">在线</p>
          </div>
        </div>
        <template #content>
          <div class="friend-info-popup">
            <div class="popup-header">
              <div class="popup-avatar-wrap">
                <XhAvatar :value="friend.avatar" :size="64" shape="circle" />
              </div>
              <div class="popup-title">
                <h3 class="popup-name">{{ friend.name }}</h3>
                <span class="popup-archetype">{{ getArchetypeText(friend.archetype) }}</span>
              </div>
            </div>

            <div class="popup-content local-scroll">
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
                  <span v-for="tag in friend.personality_tags" :key="tag" class="detail-tag">{{ tag }}</span>
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
          </div>
        </template>
      </t-popup>
      <div class="chat-header-actions">
        <t-button variant="text" shape="circle">
          <t-icon name="phone" />
        </t-button>
        <t-button variant="text" shape="circle">
          <t-icon name="ellipsis" />
        </t-button>
      </div>
    </div>

    <div class="chat-messages local-scroll" ref="messagesContainer">
      <div class="message-date-divider">
        <span class="date-divider-text">今天</span>
      </div>
      <MessageBubble
        v-for="message in messages"
        :key="message.id"
        :message="message"
        :friend="friend"
      />
    </div>

    <ChatInput @send="handleSend" />
  </div>
</template>

<script lang="ts" setup>
import type {MemoFriendStaticView} from '@/entity/memo'
import {
  getArchetypeText,
  getGenderText,
  getAgeRangeText,
  getRelationText,
  getMemorySpanText,
  getPostingStyleText
} from '@/entity/memo/MemoFriend'
import XhAvatar from '@/components/avatar/XhAvatar.vue'
import MessageBubble from './MessageBubble.vue'
import ChatInput from './ChatInput.vue'

const props = defineProps<{
  friend: MemoFriendStaticView
  messages: Array<{
    id: string
    sender: 'user' | 'friend'
    content: string
    timestamp: number
  }>
}>()

const emit = defineEmits<{
  (e: 'send', content: string): void
}>()

const messagesContainer = ref<HTMLElement>()

const handleSend = (content: string) => {
  emit('send', content)
}

watch(() => props.messages.length, () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}, { flush: 'post' })

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
</script>

<style scoped lang="less">
@import './less/ChatArea.less';
</style>
