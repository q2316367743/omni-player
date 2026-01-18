<template>
  <div class="role-detail">
    <div class="detail-header">
      <h4>{{ role.name }}</h4>
      <t-button v-if="remove" theme="danger" variant="text" shape="square" @click="deleteRole(role)">
        <template #icon>
          <delete-icon />
        </template>
      </t-button>
    </div>
    <t-divider size="8px"/>
    <div class="detail-section">
      <t-tag theme="default" size="small" variant="light">公开身份</t-tag>
      <p>{{ role.identity }}</p>
    </div>
    <div class="detail-section">
      <t-tag theme="default" size="small" variant="light">性格描述</t-tag>
      <p>{{ role.personality }}</p>
    </div>
    <div class="detail-section">
      <t-tag theme="warning" size="small" variant="light">私有信息</t-tag>
      <p>{{ role.secret_info }}</p>
    </div>
    <div v-if="emotion" class="detail-section">
      <t-tag theme="success" size="small" variant="light">角色心情</t-tag>
      <div class="emotion-content">
        <span class="emotion-type">{{ emotion.emotion_type }}</span>
        <t-progress :percentage="emotion.intensity" :label="false" size="small"/>
      </div>
    </div>
    <div v-if="clues.length > 0" class="detail-section">
      <t-tag theme="primary" size="small" variant="light">潜在线索</t-tag>
      <div class="list-content">
        <div v-for="clue in clues" :key="clue.id" class="list-item">
          <span class="item-content">{{ clue.content }}</span>
          <t-tag :theme="getClueStatusTheme(clue.status)" size="small" variant="light">{{ getClueStatusText(clue.status) }}</t-tag>
        </div>
      </div>
    </div>
    <div v-if="beliefs.length > 0" class="detail-section">
      <t-tag theme="danger" size="small" variant="light">主观推断</t-tag>
      <div class="list-content">
        <div v-for="belief in beliefs" :key="belief.id" class="list-item">
          <span class="item-content">{{ belief.content }}</span>
          <t-tag v-if="belief.is_active === 1" theme="success" size="small" variant="light">置信度 {{ Math.round(belief.confidence * 100) }}%</t-tag>
          <t-tag v-else theme="default" size="small" variant="light">已撤回</t-tag>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import type {Screenplay, SpRole, SpRoleBelief, SpRoleEmotion, SpRoleLatentClue} from "@/entity/screenplay";
import {getSpRoleEmotionService, listSpRoleBeliefService, listSpRoleLatentClueService} from "@/services/screenplay";
import {openSpRoleDelete} from "@/pages/screenplay/func/SpRoleEdit.tsx";
import {DeleteIcon} from "tdesign-icons-vue-next";

const props = defineProps({
  screenplay: {
    type: Object as PropType<Screenplay>,
    required: true
  },
  role: {
    type: Object as PropType<SpRole>,
    required: true
  },
  remove: {
    type: Boolean,
    default: false
  }
});
const emit = defineEmits(['refresh']);

const emotion = ref<SpRoleEmotion>();
const clues = ref(new Array<SpRoleLatentClue>());
const beliefs = ref(new Array<SpRoleBelief>());

onMounted(async () => {
  emotion.value = await getSpRoleEmotionService(props.screenplay.id, props.role.id);
  clues.value = await listSpRoleLatentClueService(props.screenplay.id, props.role.id);
  beliefs.value = await listSpRoleBeliefService(props.screenplay.id, props.role.id);
})

const getClueStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    active: '激活',
    resolved: '解决',
    discarded: '废弃'
  };
  return statusMap[status] || status;
};

const getClueStatusTheme = (status: string): 'success' | 'default' | 'warning' | 'primary' | 'danger' => {
  const themeMap: Record<string, 'success' | 'default' | 'warning' | 'primary' | 'danger'> = {
    active: 'success',
    resolved: 'default',
    discarded: 'warning'
  };
  return themeMap[status] || 'default';
};

const deleteRole = (role: SpRole) => {
  openSpRoleDelete(role.id, () => {
    emit('refresh');
  })
}
</script>
<style scoped lang="less">
.role-detail {
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
      white-space: pre-line;
    }

    .emotion-content {
      margin-top: 8px;
      display: flex;
      align-items: center;
      gap: 12px;

      .emotion-type {
        font: var(--td-font-body-small);
        color: var(--td-text-color-primary);
        min-width: 60px;
      }
    }

    .list-content {
      margin-top: 8px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-height: 200px;
      overflow-y: auto;
      padding-right: 4px;

      .list-item {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 8px;
        padding: 8px;
        background: var(--td-bg-color-container-hover);
        border-radius: 4px;

        .item-content {
          flex: 1;
          font: var(--td-font-body-small);
          color: var(--td-text-color-secondary);
          line-height: var(--td-line-height-body-small);
          word-break: break-word;
        }
      }
    }
  }

}
</style>
