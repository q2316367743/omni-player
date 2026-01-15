<template>
  <div class="rm-participants">
    <div v-if="adminParticipants.length > 0" class="participant-section">
      <div class="section-title">管理员</div>
      <div v-for="(participant, index) in adminParticipants" :key="participant.id" class="participant-card">
        <div class="participant-header">
          <div class="participant-avatar">{{ participant.name.charAt(0) }}</div>
          <div class="participant-info">
            <div class="participant-name">{{ participant.name }}</div>
            <div class="participant-type">管理员</div>
          </div>
          <div class="flex items-center">
            <div class="mr-8px">
              <t-switch class="mr-8px" :value="participant.is_active !== 0" @change="handleChange(participant, getAdminIndex(index))"/>
            </div>
            <t-tag v-if="currentParticipantId === participant.id" theme="success" size="small">发言中</t-tag>
            <t-tag v-else-if="participant.is_active === 0" theme="default" size="small">已禁言</t-tag>
            <t-tag v-else theme="default" size="small">等待中</t-tag>
          </div>
        </div>
        <div class="participant-body">
          <div class="participant-stance" v-if="participant.stance">立场：{{ participant.stance }}</div>
          <div class="participant-prompt" :title="participant.prompt" v-if="participant.prompt">{{ participant.prompt }}</div>
        </div>
      </div>
    </div>

    <div v-if="memberParticipants.length > 0" class="participant-section">
      <div class="section-title">成员</div>
      <div v-for="(participant, index) in memberParticipants" :key="participant.id" class="participant-card">
        <div class="participant-header">
          <div class="participant-avatar">{{ participant.name.charAt(0) }}</div>
          <div class="participant-info">
            <div class="participant-name">{{ participant.name }}</div>
            <div class="participant-type">成员</div>
          </div>
          <div class="flex items-center">
            <div class="mr-8px">
              <t-switch class="mr-8px" :value="participant.is_active !== 0" @change="handleChange(participant, getMemberIndex(index))"/>
            </div>
            <t-tag v-if="currentParticipantId === participant.id" theme="success" size="small">发言中</t-tag>
            <t-tag v-else-if="participant.is_active === 0" theme="default" size="small">已禁言</t-tag>
            <t-tag v-else theme="default" size="small">等待中</t-tag>
          </div>
        </div>
        <div class="participant-body">
          <div class="participant-stance" v-if="participant.stance">立场：{{ participant.stance }}</div>
          <div class="participant-prompt" :title="participant.prompt" v-if="participant.prompt">{{ participant.prompt }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import type {AiRtParticipant} from "@/entity/app/ai/roundtable";
import {updateAiRtParticipantService} from "@/services/app/roundtable";
import {computed} from "vue";

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

const adminParticipants = computed(() => {
  return props.participants.filter(p => p.type === 'admin');
});

const memberParticipants = computed(() => {
  return props.participants.filter(p => p.type !== 'admin');
});

function getAdminIndex(adminIndex: number) {
  const admin = adminParticipants.value[adminIndex];
  if (!admin) return -1;
  return props.participants.findIndex(p => p.id === admin.id);
}

function getMemberIndex(memberIndex: number) {
  const member = memberParticipants.value[memberIndex];
  if (!member) return -1;
  return props.participants.findIndex(p => p.id === member.id);
}

async function handleChange(participant: AiRtParticipant, index: number) {
  await updateAiRtParticipantService(participant.id, {
    is_active: participant.is_active === 0 ? 1 : 0
  });
  participant.is_active = participant.is_active === 0 ? 1 : 0
  emit('change', {
    index,
    participant
  });
}

</script>
<style scoped lang="less">
.rm-participants {
  flex: 1;
  padding: 24px;
  overflow-y: auto;

  .participant-section {
    margin-bottom: 32px;

    &:last-child {
      margin-bottom: 0;
    }

    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--td-text-color-primary);
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 2px solid var(--fluent-border-color);
    }
  }

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
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
        text-overflow: ellipsis;
        word-break: break-word;
      }
    }
  }
}
</style>
