<template>
  <div class="memory-page">
    <div class="page-header">
      <h1 class="page-title">记忆碎片</h1>
      <p class="page-subtitle">你的情绪、认知、行为与人格轨迹</p>
    </div>

    <div class="memory-content monica-card">
      <t-tabs v-model="activeTab" >
        <t-tab-panel value="emotion" label="情绪层">
          <EmotionSection :data="emotionData"/>
        </t-tab-panel>
        <t-tab-panel value="cognitive" label="认知层">
          <CognitiveSection :data="cognitiveData"/>
        </t-tab-panel>
        <t-tab-panel value="behavior" label="行为层">
          <BehaviorSection :data="behaviorData"/>
        </t-tab-panel>
        <t-tab-panel value="persona" label="人格层">
          <PersonaSection :data="personaData"/>
        </t-tab-panel>
      </t-tabs>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {MessagePlugin} from 'tdesign-vue-next'
import {
  listActiveMemoLayerBehaviors,
  listActiveMemoLayerCognitive,
  listActiveMemoLayerPersonas,
  listActiveMemoLayerEmotions
} from '@/services/memo'
import type {MemoLayerBehavior, MemoLayerCognitive, MemoLayerEmotion, MemoLayerPersona} from '@/entity/memo'
import EmotionSection from './EmotionSection.vue'
import CognitiveSection from './CognitiveSection.vue'
import BehaviorSection from './BehaviorSection.vue'
import PersonaSection from './PersonaSection.vue'
import MessageUtil from "@/util/model/MessageUtil.ts";

const activeTab = ref('emotion')
const emotionData = ref<MemoLayerEmotion[]>([])
const cognitiveData = ref<MemoLayerCognitive[]>([])
const behaviorData = ref<MemoLayerBehavior[]>([])
const personaData = ref<MemoLayerPersona[]>([])

const loadData = async () => {
  try {
    const [emotions, cognitive, behaviors, personas] = await Promise.all([
      listActiveMemoLayerEmotions(),
      listActiveMemoLayerCognitive(),
      listActiveMemoLayerBehaviors(),
      listActiveMemoLayerPersonas()
    ])
    emotionData.value = emotions
    cognitiveData.value = cognitive
    behaviorData.value = behaviors
    personaData.value = personas
  } catch (error) {
    MessageUtil.error('加载记忆数据失败', error);
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="less">
@import '@/assets/style/monica.less';

.memory-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--monica-warm-bg);
  padding: var(--monica-spacing-xl);
}

.page-header {
  margin-bottom: var(--monica-spacing-xl);
}

.page-title {
  font-size: var(--monica-font-xxl);
  font-weight: 600;
  color: var(--monica-text-primary);
  margin: 0 0 var(--monica-spacing-xs) 0;
}

.page-subtitle {
  font-size: var(--monica-font-md);
  color: var(--monica-text-tertiary);
  margin: 0;
}

.memory-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

</style>
