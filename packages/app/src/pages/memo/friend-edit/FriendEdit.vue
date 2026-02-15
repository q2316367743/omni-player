<template>
  <div class="friend-edit monica-container">
    <div class="edit-header">
      <t-button theme="default" variant="text" @click="router.back()" shape="round" class="back-btn">
        <template #icon>
          <chevron-left-icon />
        </template>
        返回
      </t-button>
      <h2 class="edit-title">编辑朋友</h2>
      <t-button theme="primary" @click="handleSave" :loading="saving" class="save-btn">
        保存
      </t-button>
    </div>

    <div v-if="loading" class="loading-state">
      <t-loading text="加载中..." />
    </div>

    <div v-else class="edit-content">
      <t-card class="edit-card">
        <t-tabs v-model="activeTab">
          <t-tab-panel label="静态人设" :value="0">
            <StaticForm ref="staticFormRef" :friend-id="friendId" :initial-data="staticData" />
          </t-tab-panel>
          <t-tab-panel label="动态状态" :value="1">
            <DynamicForm ref="dynamicFormRef" :friend-id="friendId" :initial-data="dynamicData" />
          </t-tab-panel>
        </t-tabs>
      </t-card>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ChevronLeftIcon } from 'tdesign-icons-vue-next'
import StaticForm, { type StaticFormInitialData } from './StaticForm.vue'
import DynamicForm, { type DynamicFormInitialData } from './DynamicForm.vue'
import { useRouter, useRoute } from 'vue-router'
import { useMemoFriendStore } from '@/store/MemoFriendStore.ts'

const router = useRouter()
const route = useRoute()
const memoFriendStore = useMemoFriendStore()

const loading = ref(true)
const saving = ref(false)
const activeTab = ref(0)

const staticFormRef = ref<InstanceType<typeof StaticForm>>()
const dynamicFormRef = ref<InstanceType<typeof DynamicForm>>()

const friendId = computed(() => route.params.id as string)

const staticData = ref<StaticFormInitialData>({})
const dynamicData = ref<DynamicFormInitialData>({})

async function loadFriendData() {
  loading.value = true
  try {
    const friend = await memoFriendStore.fetchFriend(friendId.value)
    if (!friend) {
      router.back()
      return
    }
    
    staticData.value = {
      avatar: friend.avatar,
      name: friend.name,
      model: friend.model,
      gender: friend.gender,
      age_range: friend.age_range,
      age_exact: friend.age_exact,
      occupation: friend.occupation,
      relation: friend.relation,
      preferred_name: friend.preferred_name,
      archetype: friend.archetype,
      personality_prompt: friend.personality_prompt,
      speaking_style: friend.speaking_style,
      background_story: friend.background_story,
      memory_span: friend.memory_span,
      emotional_depth: friend.emotional_depth,
      proactivity_level: friend.proactivity_level,
      posting_style: friend.posting_style,
      autopost_interval_hours: friend.autopost_interval_hours,
      max_posts_per_week: friend.max_posts_per_week,
      active_hours: friend.active_hours ? { ...friend.active_hours } : undefined,
      personality_tags: friend.personality_tags,
      knowledge_scope: friend.knowledge_scope,
      taboo_topics: friend.taboo_topics,
      trigger_keywords: friend.trigger_keywords,
      posting_triggers: friend.posting_triggers
    }

    if (friend.intimacy_score !== undefined) {
      dynamicData.value = {
        intimacy_score: friend.intimacy_score,
        trust_level: friend.trust_level,
        interaction_count: friend.interaction_count,
        conversation_frequency: friend.conversation_frequency,
        unknown_memo_count: friend.unknown_memo_count,
        current_mood: friend.current_mood,
        mood_expires_at: friend.mood_expires_at,
        known_memo_categories: friend.known_memo_categories,
        relationship_milestones: friend.relationship_milestones
      }
    }
  } finally {
    loading.value = false
  }
}

async function handleSave() {
  saving.value = true
  try {
    if (activeTab.value === 0) {
      await staticFormRef.value?.save()
    } else {
      await dynamicFormRef.value?.save()
    }
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadFriendData()
})
</script>

<style scoped lang="less">
@import './FriendEdit.less';
</style>
