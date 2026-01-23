<template>
  <div class="scene-detail">
    <div class="detail-header">
      <h4>{{ scene.name }}</h4>
    </div>
    <t-divider size="8px"/>
    <div class="detail-section">
      <h4>场景描述</h4>
      <p>{{ scene.description }}</p>
      <h4>本场景必须达成的叙事目标</h4>
      <p>{{ scene.narrative_goal }}</p>
      <h4>必须在此场景揭露的关键线索</h4>
      <ul>
        <li v-for="(k, i) in key_clues" :key="i">{{ k }}</li>
      </ul>
      <h4>必须发生的角色坦白/冲突</h4>
      <ul>
        <li v-for="(r, i) in required_revelations" :key="i">{{ r }}</li>
      </ul>
      <h4 v-if="scene.roles && scene.roles.length > 0">出场角色</h4>
      <t-space v-if="scene.roles && scene.roles.length > 0" break-line>
        <t-tooltip v-for="role in scene.roles" :key="role.id" :content="role?.name">
          <t-avatar>
            {{ role?.name?.substring(0, 1) }}
          </t-avatar>
        </t-tooltip>
      </t-space>
    </div>
  </div>
</template>
<script lang="ts" setup>
import type {SpRole, SpScene} from "@/entity/screenplay";

const props = defineProps({
  scene: {
    type: Object as PropType<SpScene & {
      roles: Array<SpRole>
    }>,
    required: true
  }
});
const key_clues = computed(() => {
  try {
    return JSON.parse(props.scene.key_clues);
  } catch (e) {
    console.log(e);
    return []
  }
})
const required_revelations = computed(() => {
  try {
    return JSON.parse(props.scene.required_revelations);
  } catch (e) {
    console.log(e);
    return []
  }
})
</script>
<style scoped lang="less">
.scene-detail {
  margin: 12px;
  max-width: 350px;
  background: var(--fluent-card-bg);

  .detail-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    h4 {
      margin: 0;
      font: var(--td-font-subtitle-medium);
      color: var(--td-text-color-primary);
    }
  }


  .detail-section {
    margin-bottom: 16px;

    p {
      margin: 8px 0 0 0;
      font: var(--td-font-body-small);
      color: var(--td-text-color-secondary);
      line-height: var(--td-line-height-body-small);
      white-space: pre-line; /* 只保留换行，空格仍折叠 */
    }
    ul {
      margin: 0;
    }
  }

}
</style>
