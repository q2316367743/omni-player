<template>
  <header class="scene-timeline">
    <div class="timeline-container">
      <t-popup v-for="(scene, index) in list" :key="scene.id" trigger="click" placement="bottom" show-arrow>
        <div
          :class="['timeline-item', { 'timeline-current': scene.id === currentSceneId, 'timeline-past': index < currentSceneIndex}]"
          @click="handleSelectScene(scene)"
        >
          <div class="timeline-dot"></div>
          <div class="timeline-content">
            <div class="timeline-scene-name">{{ scene.name }}</div>
            <div class="timeline-scene-desc">{{ scene.description }}</div>
          </div>
        </div>
        <template #content>
          <sp-scene-detail :scene="scene" />
        </template>
      </t-popup>
    </div>
  </header>
</template>
<script lang="ts" setup>
import type {SpRole, SpScene} from "@/entity/screenplay";
import type {SpRoleAppearance} from "@/entity/screenplay/SpRoleAppearance.ts";
import {MapWrapper} from "@/util";
import SpSceneDetail from "@/pages/screenplay/components/SpSceneDetail.vue";

const props = defineProps({
  scenes: {
    type: Array as PropType<Array<SpScene>>,
    required: true
  },
  roleMap: {
    type: Object as PropType<Map<string, SpRole>>,
    required: true
  },
  roleAppearanceMap: {
    type: Object as PropType<MapWrapper<string, Array<SpRoleAppearance>>>,
    default: () => new Map<string, Array<SpRoleAppearance>>(),
  },
  currentSceneId: {
    type: String,
  }
});
const emit = defineEmits(['select']);

const currentSceneIndex = computed(() => {
  return props.scenes.findIndex(scene => scene.id === props.currentSceneId);
});
const list = computed(() => {
  return props.scenes.map(scene => {
    return {
      ...scene,
      roles: props.roleAppearanceMap.getOrDefault(scene.id, []).map(e => props.roleMap.get(e.role_id)!),
    }
  });
});

const handleSelectScene = (scene: SpScene) => {
  emit('select', scene);
};

</script>
<style scoped lang="less">
@import "./less/ScreenplayScene";
</style>
