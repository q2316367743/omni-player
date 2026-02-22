<template>
  <div class="static-form">
    <div class="form-section">
      <h3 class="section-title">基础信息</h3>
      <t-form :data="formData" label-align="top">
        <div class="form-row">
          <t-form-item label="头像" class="avatar-item">
            <XhAvatar 
              :model-value="formData.avatar"
              :size="80" 
              folder="memo/friend" 
              :editable="true"
              @update:model-value="updateField('avatar', $event)"
            />
          </t-form-item>
        </div>
        <div class="form-row">
          <t-form-item label="名称">
            <t-input :value="formData.name" @change="(v: any) => updateField('name', v)" placeholder="请输入名称" />
          </t-form-item>
          <t-form-item label="模型">
            <t-select v-model="formData.model" :options="thinkOptions" @change="(v: any) => updateField('model', v)" placeholder="请输入模型"/>
          </t-form-item>
        </div>
        <div class="form-row">
          <t-form-item label="性别">
            <t-select :value="formData.gender" @change="(v: any) => updateField('gender', v)" :options="genderOptions" />
          </t-form-item>
          <t-form-item label="年龄范围">
            <t-select :value="formData.age_range" @change="(v: any) => updateField('age_range', v)" :options="ageRangeOptions" />
          </t-form-item>
          <t-form-item label="具体年龄">
            <t-input-number :value="formData.age_exact" @change="(v: any) => updateField('age_exact', v)" placeholder="可选" :min="1" :max="150" />
          </t-form-item>
        </div>
        <div class="form-row">
          <t-form-item label="职业">
            <t-input :value="formData.occupation" @change="(v: any) => updateField('occupation', v)" placeholder="请输入职业" />
          </t-form-item>
          <t-form-item label="关系">
            <t-select :value="formData.relation" @change="(v: any) => updateField('relation', v)" :options="relationOptions" />
          </t-form-item>
        </div>
        <div class="form-row">
          <t-form-item label="如何称呼我">
            <t-input :value="formData.preferred_name" @change="(v: any) => updateField('preferred_name', v)" placeholder="请输入称呼" />
          </t-form-item>
          <t-form-item label="荣格原型">
            <t-select :value="formData.archetype" @change="(v: any) => updateField('archetype', v)" :options="archetypeOptions" />
          </t-form-item>
        </div>
      </t-form>
    </div>

    <div class="form-section">
      <h3 class="section-title">人设描述</h3>
      <t-form :data="formData" label-align="top">
        <t-form-item label="详细Prompt">
          <t-textarea 
            :value="formData.personality_prompt"
            @change="(v: any) => updateField('personality_prompt', v)"
            :autosize="{ minRows: 4, maxRows: 8 }"
            placeholder="如：你是一个有点毒舌但内心温柔的咖啡师..."
          />
        </t-form-item>
        <t-form-item label="性格标签">
          <t-tag-input :value="personalityTags" @change="(v: any) => personalityTags = v" placeholder="输入标签后按回车添加" />
        </t-form-item>
        <t-form-item label="语言风格">
          <t-textarea 
            :value="formData.speaking_style"
            @change="(v: any) => updateField('speaking_style', v)"
            :autosize="{ minRows: 2, maxRows: 4 }"
            placeholder="请输入语言风格说明"
          />
        </t-form-item>
        <t-form-item label="背景故事">
          <t-textarea 
            :value="formData.background_story"
            @change="(v: any) => updateField('background_story', v)"
            :autosize="{ minRows: 3, maxRows: 6 }"
            placeholder="请输入背景故事"
          />
        </t-form-item>
      </t-form>
    </div>

    <div class="form-section">
      <h3 class="section-title">知识域</h3>
      <t-form :data="formData" label-align="top">
        <t-form-item label="擅长领域">
          <t-tag-input :value="knowledgeDomains" @change="(v: any) => knowledgeDomains = v" placeholder="输入领域后按回车添加" />
        </t-form-item>
        <t-form-item label="知识盲区">
          <t-tag-input :value="knowledgeBlindspots" @change="(v: any) => knowledgeBlindspots = v" placeholder="输入盲区后按回车添加" />
        </t-form-item>
        <t-form-item label="禁忌话题">
          <t-tag-input :value="tabooTopics" @change="(v: any) => tabooTopics = v" placeholder="输入话题后按回车添加" />
        </t-form-item>
      </t-form>
    </div>

    <div class="form-section">
      <h3 class="section-title">认知参数</h3>
      <t-form :data="formData" label-align="top">
        <div class="form-row">
          <t-form-item label="记忆跨度">
            <t-select :value="formData.memory_span" @change="(v: any) => updateField('memory_span', v)" :options="memorySpanOptions" />
          </t-form-item>
          <t-form-item label="共情能力">
            <t-slider :value="formData.emotional_depth" @change="(v: any) => updateField('emotional_depth', v)" :min="0" :max="10" :step="1" show-number />
          </t-form-item>
          <t-form-item label="主动性">
            <t-slider :value="formData.proactivity_level" @change="(v: any) => updateField('proactivity_level', v)" :min="0" :max="10" :step="1" show-number />
          </t-form-item>
        </div>
      </t-form>
    </div>

    <div class="form-section">
      <h3 class="section-title">朋友圈行为配置</h3>
      <t-form :data="formData" label-align="top">
        <div class="form-row">
          <t-form-item label="发圈风格">
            <t-select :value="formData.posting_style" @change="(v: any) => updateField('posting_style', v)" :options="postingStyleOptions" />
          </t-form-item>
          <t-form-item label="发圈周期(小时)">
            <t-input-number :value="formData.autopost_interval_hours" @change="(v: any) => updateField('autopost_interval_hours', v)" :min="1" :max="720" />
          </t-form-item>
        </div>
        <div class="form-row">
          <t-form-item label="每周上限">
            <t-input-number :value="formData.max_posts_per_week" @change="(v: any) => updateField('max_posts_per_week', v)" :min="1" :max="20" />
          </t-form-item>
          <t-form-item label="活跃时段">
            <div class="time-range">
              <t-input-number :value="formData.active_hours?.start" @change="(v: any) => updateActiveHours('start', v)" :min="0" :max="23" />
              <span class="time-separator">:</span>
              <span class="time-suffix">00 - </span>
              <t-input-number :value="formData.active_hours?.end" @change="(v: any) => updateActiveHours('end', v)" :min="0" :max="23" />
              <span class="time-separator">:</span>
              <span class="time-suffix">00</span>
            </div>
          </t-form-item>
        </div>
        <t-form-item label="触发方式">
          <t-checkbox-group :value="postingTriggers" @change="(v: any) => postingTriggers = v">
            <t-checkbox v-for="opt in postingTriggerOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</t-checkbox>
          </t-checkbox-group>
        </t-form-item>
        <t-form-item label="触发关键词">
          <t-tag-input :value="triggerKeywords" @change="(v: any) => triggerKeywords = v" placeholder="输入关键词后按回车添加" />
        </t-form-item>
      </t-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import XhAvatar from '@/components/xiaohei/XhAvatar.vue'
import {
  type MemoFriendStaticView,
  type MemoFriendPostingTrigger,
  type MemoFriendGender,
  type MemoFriendAgeRange,
  type MemoFriendRelation,
  type MemoFriendArchetype,
  type MemoFriendMemorySpan,
  type MemoFriendPostingStyle,
  getGenderText,
  getAgeRangeText,
  getRelationText,
  getArchetypeText,
  getMemorySpanText,
  getPostingStyleText, type MemoFriendStatic
} from '@/entity/memo'
import {useSettingStore} from "@/store"
import { useMemoFriendStore } from '@/store/MemoFriendStore'
import MessageUtil from '@/util/model/MessageUtil'

export interface StaticFormInitialData {
  avatar?: string
  name?: string
  model?: string
  gender?: MemoFriendGender
  age_range?: MemoFriendAgeRange
  age_exact?: number
  occupation?: string
  relation?: MemoFriendRelation
  preferred_name?: string
  archetype?: MemoFriendArchetype
  personality_prompt?: string
  speaking_style?: string
  background_story?: string
  memory_span?: MemoFriendMemorySpan
  emotional_depth?: number
  proactivity_level?: number
  posting_style?: MemoFriendPostingStyle
  autopost_interval_hours?: number
  max_posts_per_week?: number
  active_hours?: { start: number; end: number }
  personality_tags?: string[]
  knowledge_scope?: { domains: string[]; blindspots: string[] }
  taboo_topics?: string[]
  trigger_keywords?: string[]
  posting_triggers?: MemoFriendPostingTrigger[]
}

const props = defineProps<{
  friendId: string
  initialData?: StaticFormInitialData
}>()

const memoFriendStore = useMemoFriendStore()
const thinkOptions = computed(() => useSettingStore().aiSetting.model?.map(e => ({label: e, value: e})) || [])

const defaultFormData = (): Partial<MemoFriendStaticView> => ({
  avatar: '',
  name: '',
  model: '',
  gender: 'unknown' as MemoFriendGender,
  age_range: 'young' as MemoFriendAgeRange,
  age_exact: 0,
  occupation: '',
  relation: 'friend' as MemoFriendRelation,
  preferred_name: '',
  archetype: 'everyman' as MemoFriendArchetype,
  personality_prompt: '',
  speaking_style: '',
  background_story: '',
  memory_span: 'medium' as MemoFriendMemorySpan,
  emotional_depth: 5,
  proactivity_level: 5,
  posting_style: 'encouraging' as MemoFriendPostingStyle,
  autopost_interval_hours: 72,
  max_posts_per_week: 3,
  active_hours: { start: 8, end: 22 }
})

const formData = reactive<Partial<MemoFriendStaticView>>(defaultFormData())
const personalityTags = ref<string[]>([])
const knowledgeDomains = ref<string[]>([])
const knowledgeBlindspots = ref<string[]>([])
const tabooTopics = ref<string[]>([])
const triggerKeywords = ref<string[]>([])
const postingTriggers = ref<MemoFriendPostingTrigger[]>([])

function initFromData(data?: StaticFormInitialData) {
  if (!data) return
  
  Object.assign(formData, {
    avatar: data.avatar,
    name: data.name,
    model: data.model,
    gender: data.gender,
    age_range: data.age_range,
    age_exact: data.age_exact,
    occupation: data.occupation,
    relation: data.relation,
    preferred_name: data.preferred_name,
    archetype: data.archetype,
    personality_prompt: data.personality_prompt,
    speaking_style: data.speaking_style,
    background_story: data.background_story,
    memory_span: data.memory_span,
    emotional_depth: data.emotional_depth,
    proactivity_level: data.proactivity_level,
    posting_style: data.posting_style,
    autopost_interval_hours: data.autopost_interval_hours,
    max_posts_per_week: data.max_posts_per_week,
    active_hours: data.active_hours ? { ...data.active_hours } : { start: 8, end: 22 }
  })
  
  personalityTags.value = [...(data.personality_tags || [])]
  knowledgeDomains.value = [...(data.knowledge_scope?.domains || [])]
  knowledgeBlindspots.value = [...(data.knowledge_scope?.blindspots || [])]
  tabooTopics.value = [...(data.taboo_topics || [])]
  triggerKeywords.value = [...(data.trigger_keywords || [])]
  postingTriggers.value = [...(data.posting_triggers || [])]
}

watch(() => props.initialData, (data) => {
  initFromData(data)
}, { immediate: true, deep: true })

function updateField(field: string, value: any) {
  (formData as any)[field] = value
}

function updateActiveHours(field: 'start' | 'end', value: number) {
  formData.active_hours = { ...formData.active_hours, [field]: value } as { start: number; end: number }
}

async function save() {
  const payload: Partial<MemoFriendStatic> = {
    ...formData,
    state_trigger_condition: formData.state_trigger_condition ? JSON.stringify(formData.state_trigger_condition) : '',
    conversation_strategy: formData.conversation_strategy ? JSON.stringify(formData.conversation_strategy) : '',
    personality_tags: JSON.stringify(personalityTags.value),
    knowledge_scope: JSON.stringify({
      domains: knowledgeDomains.value,
      blindspots: knowledgeBlindspots.value
    }),
    taboo_topics: JSON.stringify(tabooTopics.value),
    trigger_keywords: JSON.stringify(triggerKeywords.value),
    active_hours: JSON.stringify(formData.active_hours),
    posting_triggers: JSON.stringify(postingTriggers.value)
  }
  
  await memoFriendStore.updateFriendStatic(props.friendId, payload)
  MessageUtil.success('静态人设保存成功')
}

defineExpose({ save })

const genderOptions: { label: string; value: MemoFriendGender }[] = [
  { label: getGenderText('male'), value: 'male' },
  { label: getGenderText('female'), value: 'female' },
  { label: getGenderText('neutral'), value: 'neutral' },
  { label: getGenderText('unknown'), value: 'unknown' }
]

const ageRangeOptions: { label: string; value: MemoFriendAgeRange }[] = [
  { label: getAgeRangeText('teen'), value: 'teen' },
  { label: getAgeRangeText('young'), value: 'young' },
  { label: getAgeRangeText('middle'), value: 'middle' },
  { label: getAgeRangeText('senior'), value: 'senior' },
  { label: getAgeRangeText('ageless'), value: 'ageless' }
]

const relationOptions: { label: string; value: MemoFriendRelation }[] = [
  { label: getRelationText('friend'), value: 'friend' },
  { label: getRelationText('mentor'), value: 'mentor' },
  { label: getRelationText('peer'), value: 'peer' },
  { label: getRelationText('caregiver'), value: 'caregiver' },
  { label: getRelationText('mystery'), value: 'mystery' },
  { label: getRelationText('teammate'), value: 'teammate' }
]

const archetypeOptions: { label: string; value: MemoFriendArchetype }[] = [
  { label: getArchetypeText('caregiver'), value: 'caregiver' },
  { label: getArchetypeText('jester'), value: 'jester' },
  { label: getArchetypeText('sage'), value: 'sage' },
  { label: getArchetypeText('rebel'), value: 'rebel' },
  { label: getArchetypeText('lover'), value: 'lover' },
  { label: getArchetypeText('explorer'), value: 'explorer' },
  { label: getArchetypeText('ruler'), value: 'ruler' },
  { label: getArchetypeText('everyman'), value: 'everyman' }
]

const memorySpanOptions: { label: string; value: MemoFriendMemorySpan }[] = [
  { label: getMemorySpanText('short'), value: 'short' },
  { label: getMemorySpanText('medium'), value: 'medium' },
  { label: getMemorySpanText('long'), value: 'long' }
]

const postingStyleOptions: { label: string; value: MemoFriendPostingStyle }[] = [
  { label: getPostingStyleText('encouraging'), value: 'encouraging' },
  { label: getPostingStyleText('teasing'), value: 'teasing' },
  { label: getPostingStyleText('observational'), value: 'observational' },
  { label: getPostingStyleText('poetic'), value: 'poetic' },
  { label: getPostingStyleText('sarcastic'), value: 'sarcastic' }
]

const postingTriggerOptions: { label: string; value: MemoFriendPostingTrigger }[] = [
  { label: '关键词触发', value: 'keyword' },
  { label: '定期触发', value: 'periodic' },
  { label: '基于状态触发', value: 'state_based' }
]
</script>

<style scoped lang="less">
@import './FriendEdit.less';
</style>
