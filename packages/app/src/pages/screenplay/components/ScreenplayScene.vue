<template>
  <header class="scene-timeline">
    <div class="timeline-container">
      <div
        v-for="(scene, index) in scenes"
        :key="scene.id"
        :class="['timeline-item',
        {
          'timeline-current': scene.id === currentSceneId,
          'timeline-past': index < currentSceneIndex,
        }
          ]"
        @click="handleSelectScene(scene)"
      >
        <div class="timeline-dot"></div>
        <div class="timeline-content">
          <div class="timeline-scene-name">{{ scene.name }}</div>
          <div class="timeline-scene-desc">{{ scene.description }}</div>
        </div>
      </div>
    </div>
  </header>
</template>
<script lang="ts" setup>
import type {SpScene} from "@/entity/screenplay";

const props = defineProps({
  scenes: {
    type: Array as PropType<Array<SpScene>>,
    required: true
  },
  currentSceneId: {
    type: String,
    required: true
  }
});
const emit = defineEmits(['select']);

const currentSceneIndex = computed(() => {
  return props.scenes.findIndex(scene => scene.id === props.currentSceneId);
});

const handleSelectScene = (scene: SpScene) => {
  emit('select', scene);
};

</script>
<style scoped lang="less">
@import "./less/ScreenplayScene";
</style>
