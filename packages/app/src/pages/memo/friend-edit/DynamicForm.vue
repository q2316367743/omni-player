<template>
  <div class="dynamic-form">
    <div class="form-section">
      <h3 class="section-title">关系状态</h3>
      <t-form :data="formData" label-align="top">
        <div class="form-row">
          <t-form-item label="亲密度">
            <t-slider :value="formData.intimacy_score" @change="(v: any) => updateField('intimacy_score', v)" :min="0" :max="100" :step="1" show-number />
          </t-form-item>
          <t-form-item label="信任度">
            <t-slider :value="formData.trust_level" @change="(v: any) => updateField('trust_level', v)" :min="0" :max="100" :step="1" show-number />
          </t-form-item>
        </div>
      </t-form>
    </div>

    <div class="form-section">
      <h3 class="section-title">互动统计</h3>
      <t-form :data="formData" label-align="top">
        <div class="form-row">
          <t-form-item label="对话次数">
            <t-input-number :value="formData.interaction_count" @change="(v: any) => updateField('interaction_count', v)" :min="0" />
          </t-form-item>
          <t-form-item label="互动频率">
            <t-select :value="formData.conversation_frequency" @change="(v: any) => updateField('conversation_frequency', v)" :options="frequencyOptions" />
          </t-form-item>
        </div>
        <t-form-item label="已知memo分类">
          <t-tag-input :value="knownMemoCategories" @change="(v: any) => knownMemoCategories = v" placeholder="输入分类后按回车添加" />
        </t-form-item>
        <t-form-item label="未知memo数量">
          <t-input-number :value="formData.unknown_memo_count" @change="(v: any) => updateField('unknown_memo_count', v)" :min="0" />
        </t-form-item>
      </t-form>
    </div>

    <div class="form-section">
      <h3 class="section-title">情绪状态</h3>
      <t-form :data="formData" label-align="top">
        <div class="form-row">
          <t-form-item label="当前情绪">
            <t-select :value="formData.current_mood" @change="(v: any) => updateField('current_mood', v)" :options="moodOptions" />
          </t-form-item>
          <t-form-item label="情绪持续时间">
            <t-date-picker 
              :value="moodExpiresAt"
              @change="updateMoodExpiresAt"
              enable-time-picker 
              format="YYYY-MM-DD HH:mm"
              placeholder="选择过期时间"
            />
          </t-form-item>
        </div>
      </t-form>
    </div>

    <div class="form-section">
      <h3 class="section-title">关系里程碑</h3>
      <t-form label-align="top">
        <div v-for="(milestone, index) in relationshipMilestones" :key="index" class="milestone-item">
          <t-input :value="milestone.event" @change="(v: any) => updateMilestone(index, 'event', v)" placeholder="事件名称" class="milestone-event" />
          <t-date-picker 
            :value="milestone.dateValue"
            @change="(v: any) => updateMilestoneDate(index, v)"
            format="YYYY-MM-DD"
            placeholder="选择日期"
            class="milestone-date"
          />
          <t-button variant="text" theme="danger" @click="removeMilestone(index)">
            <template #icon><delete-icon /></template>
          </t-button>
        </div>
        <t-button variant="dashed" block @click="addMilestone">
          <template #icon><add-icon /></template>
          添加里程碑
        </t-button>
      </t-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { DeleteIcon, AddIcon } from 'tdesign-icons-vue-next'
import { 
  type MemoFriendDynamicView,
  type MemoFriendMood,
  type MemoFriendMilestone,
  getMoodText
} from '@/entity/memo'
import { useMemoFriendStore } from '@/store/MemoFriendStore'
import MessageUtil from '@/util/model/MessageUtil'

export interface DynamicFormInitialData {
  intimacy_score?: number
  trust_level?: number
  interaction_count?: number
  conversation_frequency?: string
  unknown_memo_count?: number
  current_mood?: MemoFriendMood
  mood_expires_at?: number
  known_memo_categories?: string[]
  relationship_milestones?: MemoFriendMilestone[]
}

interface MilestoneItem extends MemoFriendMilestone {
  dateValue: Date
}

const props = defineProps<{
  friendId: string
  initialData?: DynamicFormInitialData
}>()

const memoFriendStore = useMemoFriendStore()

const defaultFormData = (): Partial<MemoFriendDynamicView> => ({
  intimacy_score: 0,
  trust_level: 0,
  interaction_count: 0,
  conversation_frequency: '',
  unknown_memo_count: 0,
  current_mood: 'happy' as MemoFriendMood,
  mood_expires_at: 0
})

const formData = reactive<Partial<MemoFriendDynamicView>>(defaultFormData())
const knownMemoCategories = ref<string[]>([])
const relationshipMilestones = ref<MilestoneItem[]>([])

const moodExpiresAt = computed(() => {
  return formData.mood_expires_at ? new Date(formData.mood_expires_at) : undefined
})

function initFromData(data?: DynamicFormInitialData) {
  if (!data) return
  
  Object.assign(formData, {
    intimacy_score: data.intimacy_score,
    trust_level: data.trust_level,
    interaction_count: data.interaction_count,
    conversation_frequency: data.conversation_frequency,
    unknown_memo_count: data.unknown_memo_count,
    current_mood: data.current_mood,
    mood_expires_at: data.mood_expires_at
  })
  
  knownMemoCategories.value = [...(data.known_memo_categories || [])]
  relationshipMilestones.value = (data.relationship_milestones || []).map(m => ({
    ...m,
    dateValue: new Date(m.date)
  }))
}

watch(() => props.initialData, (data) => {
  initFromData(data)
}, { immediate: true, deep: true })

function updateField(field: string, value: any) {
  (formData as any)[field] = value
}

function updateMoodExpiresAt(val: any) {
  if (!val) {
    formData.mood_expires_at = 0
    return
  }
  const date = val instanceof Date ? val : new Date(val)
  formData.mood_expires_at = date.getTime()
}

function updateMilestone(index: number, field: string, value: string) {
  const current = relationshipMilestones.value[index]!
  relationshipMilestones.value[index] = {
    event: current.event,
    date: current.date,
    desc: current.desc,
    dateValue: current.dateValue,
    [field]: value
  } as MilestoneItem
}

function updateMilestoneDate(index: number, value: any) {
  const current = relationshipMilestones.value[index]!
  const date = value instanceof Date ? value : new Date(value)
  relationshipMilestones.value[index] = {
    event: current.event,
    date: date.getTime(),
    desc: current.desc,
    dateValue: date
  }
}

function addMilestone() {
  const now = new Date()
  const newMilestone: MilestoneItem = {
    event: '',
    date: now.getTime(),
    desc: '',
    dateValue: now
  }
  relationshipMilestones.value.push(newMilestone)
}

function removeMilestone(index: number) {
  relationshipMilestones.value.splice(index, 1)
}

async function save() {
  const payload = {
    intimacy_score: formData.intimacy_score,
    trust_level: formData.trust_level,
    interaction_count: formData.interaction_count,
    conversation_frequency: formData.conversation_frequency,
    unknown_memo_count: formData.unknown_memo_count,
    current_mood: formData.current_mood,
    mood_expires_at: formData.mood_expires_at,
    known_memo_categories: JSON.stringify(knownMemoCategories.value),
    relationship_milestones: JSON.stringify(relationshipMilestones.value.map(m => ({
      event: m.event,
      date: m.dateValue.getTime(),
      desc: m.desc
    })))
  }
  
  await memoFriendStore.updateFriendDynamic(props.friendId, payload)
  MessageUtil.success('动态状态保存成功')
}

defineExpose({ save })

const moodOptions: { label: string; value: MemoFriendMood }[] = [
  { label: getMoodText('happy'), value: 'happy' },
  { label: getMoodText('excited'), value: 'excited' },
  { label: getMoodText('playful'), value: 'playful' },
  { label: getMoodText('concerned'), value: 'concerned' },
  { label: getMoodText('melancholy'), value: 'melancholy' }
]

const frequencyOptions = [
  { label: '高频', value: 'high' },
  { label: '中频', value: 'medium' },
  { label: '低频', value: 'low' },
  { label: '罕见', value: 'rare' },
  { label: '未知', value: 'unknown' }
]
</script>

<style scoped lang="less">
@import './FriendEdit.less';
</style>
