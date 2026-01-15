<template>
  <div class="rm-participants">
    <div v-for="participant in participants" :key="participant.id" class="participant-card">
      <div class="participant-header">
        <div class="participant-avatar">{{ participant.name.charAt(0) }}</div>
        <div class="participant-info">
          <div class="participant-name">{{ participant.name }}</div>
          <div class="participant-type">{{ participant.type === 'admin' ? '上帝' : '成员' }}</div>
        </div>
        <t-tag v-if="currentParticipantId === participant.id" theme="success" size="small">发言中</t-tag>
        <t-tag v-else-if="participant.is_active === 0" theme="default" size="small">已禁言</t-tag>
        <t-tag v-else theme="default" size="small">等待中</t-tag>
      </div>
      <div class="participant-body">
        <div class="participant-stance" v-if="participant.stance">立场：{{ participant.stance }}</div>
        <div class="participant-prompt">{{ participant.prompt }}</div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import type {AiRtParticipant} from "@/entity/app/ai/roundtable";

const props = defineProps({
  // 全部的成员
  participants: {
    type: Array as PropType<Array<AiRtParticipant>>,
    default: () => []
  },
  // 当前发言的成员
  currentParticipantId: {
    type: String,
    default: ''
  }
});
const emit = defineEmits(['change']);
</script>
<style scoped lang="less">
.rm-participants {
  flex: 1;
  padding: 24px;
  overflow-y: auto;

  .participant-card {
    background: var(--fluent-card-bg);
    backdrop-filter: blur(10px);
    border: 1px solid var(--fluent-card-border);
    border-radius: var(--fluent-radius-card);
    box-shadow: var(--fluent-card-shadow);
    padding: 16px;
    margin-bottom: 16px;
    transition: all var(--fluent-transition-normal);

    &:hover {
      box-shadow: var(--fluent-card-shadow-hover);
      transform: translateY(-2px);
    }

    .participant-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;

      .participant-avatar {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: var(--fluent-gradient-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 20px;
        font-weight: 600;
        box-shadow: var(--fluent-elevation-2);
      }

      .participant-info {
        flex: 1;

        .participant-name {
          font-size: 16px;
          font-weight: 600;
          color: var(--td-text-color-primary);
        }

        .participant-type {
          font-size: 13px;
          color: var(--td-text-color-secondary);
        }
      }
    }

    .participant-body {
      .participant-stance {
        font-size: 14px;
        color: var(--td-text-color-secondary);
        margin-bottom: 8px;
      }

      .participant-prompt {
        font-size: 13px;
        color: var(--td-text-color-placeholder);
        line-height: 1.6;
      }
    }
  }
}
</style>
