<template>
  <div class="roundtable-create">
    <t-card>
      <t-steps :current="current">
        <t-step-item title="确定主题"/>
        <t-step-item title="选取 AI"/>
        <t-step-item title="最后设置"/>
      </t-steps>
    </t-card>
    <div class="roundtable-create-content">
      <t-card v-if="current === 0">
        <t-form>
          <t-form-item label-align="top" label="会议主题">
            <t-input v-model="meeting.topic"/>
          </t-form-item>
          <t-form-item label-align="top" label="会议内容">
            <t-textarea v-model="meeting.content"/>
          </t-form-item>
        </t-form>
        <div class="step-actions">
          <t-button v-if="meeting.topic" theme="primary" @click="current = 1">下一步</t-button>
        </div>
      </t-card>
      <t-card v-else-if="current === 1">
        <div class="participant-section">
          <div class="section-header">
            <h4 class="section-title">上帝 AI</h4>
            <t-button v-if="!hasAdmin" size="small" theme="primary" variant="outline"
                      @click="openRoleSelectDialog('admin')">
              <template #icon>
                <add-icon/>
              </template>
              新增
            </t-button>
          </div>
          <div class="participant-list admin-list">
            <div v-for="(participant, i) in adminParticipants" :key="i" class="participant-item admin-item">
              <div class="participant-info">
                <div class="participant-name">{{ participant.name }}</div>
                <div class="participant-meta">
                  <t-tag size="small" theme="warning">上帝AI</t-tag>
                  <span class="participant-stance">{{ participant.stance || '未设置立场' }}</span>
                </div>
              </div>
              <div class="participant-actions">
                <t-button size="small" variant="text" theme="primary" @click="editParticipant(participant)">
                  编辑
                </t-button>
                <t-button size="small" variant="text" theme="danger" @click="removeParticipant(i, 'admin')">
                  删除
                </t-button>
              </div>
            </div>
            <div v-if="!hasAdmin" class="empty-state">
              <p>暂无上帝 AI，点击上方按钮添加</p>
            </div>
          </div>
        </div>

        <div class="participant-section">
          <div class="section-header">
            <h4 class="section-title">成员 AI</h4>
            <t-button size="small" theme="primary" variant="outline" @click="openRoleSelectDialog('member')">
              <template #icon>
                <add-icon/>
              </template>
              新增
            </t-button>
          </div>
          <div class="participant-list member-list">
            <div v-for="(participant, i) in memberParticipants" :key="i" class="participant-item member-item">
              <div class="participant-number">{{ i + 1 }}</div>
              <div class="participant-info">
                <div class="participant-name">{{ participant.name }}</div>
                <div class="participant-meta">
                  <t-tag size="small" theme="default">成员</t-tag>
                  <span class="participant-stance">{{ participant.stance || '未设置立场' }}</span>
                </div>
              </div>
              <div class="participant-actions">
                <div class="sort-buttons">
                  <t-button size="small" variant="text" :disabled="i === 0" @click="moveParticipant(i, 'up')">
                    ↑
                  </t-button>
                  <t-button size="small" variant="text" :disabled="i === memberParticipants.length - 1"
                            @click="moveParticipant(i, 'down')">
                    ↓
                  </t-button>
                </div>
                <t-button size="small" variant="text" theme="primary" @click="editParticipant(participant)">
                  编辑
                </t-button>
                <t-button size="small" variant="text" theme="danger" @click="removeParticipant(i, 'member')">
                  删除
                </t-button>
              </div>
            </div>
            <div v-if="memberParticipants.length === 0" class="empty-state">
              <p>暂无成员 AI，点击上方按钮添加</p>
            </div>
          </div>
        </div>

        <div class="step-actions">
          <t-button theme="default" @click="current = 0">上一步</t-button>
          <t-button v-if="hasMemberParticipant" theme="primary" @click="current = 2">下一步</t-button>
        </div>
      </t-card>
      <t-card v-else-if="current === 2">
        <t-form>
          <t-form-item label-align="top" label="最大发言轮数" help="0 表示无限制">
            <t-input-number v-model="meeting.max_rounds" :min="0" placeholder="0 表示无限制"/>
          </t-form-item>
          <t-form-item label-align="top" label="总结间隔" help="每 N 轮后触发上帝AI总结">
            <t-input-number v-model="meeting.summary_interval" :min="1" placeholder="每 N 轮后总结"/>
          </t-form-item>
          <t-form-item label-align="top" label="自动总结" help="会议结束时是否自动触发最终总结">
            <t-switch v-model="meeting.auto_summary_on_end" :custom-value="[0, 1]"/>
          </t-form-item>
        </t-form>
        <div class="step-actions">
          <t-button theme="default" @click="current = 1">上一步</t-button>
          <t-button theme="primary" @click="submitMeeting">开启圆桌会议</t-button>
        </div>
      </t-card>
    </div>

  </div>
</template>
<script lang="ts" setup>
import {buildAiRtMeetingAdd, buildAiRtParticipantCore} from "@/entity/app/ai/roundtable";
import {listAiRtParticipantService} from "@/services/app/roundtable/AiRtParticipantService.ts";
import {addAiRtMeetingService} from "@/services/app/roundtable/AiRtMeetingService.ts";
import type {AiRtRoleType} from "@/entity/app/ai/roundtable";
import type {AiRtParticipantCore} from "@/entity/app/ai/roundtable";
import {AddIcon} from 'tdesign-icons-vue-next';
import MessageUtil from '@/util/model/MessageUtil.ts';
import {openParticipantConfig} from "@/pages/app/ai/roundtable/pages/create/func/ParticipantConfig.tsx";
import {openRoleSelect} from "@/pages/app/ai/roundtable/pages/create/func/RoleSelect.tsx";

const activeKey = defineModel({
  type: String,
  default: '/create/0'
})
const emit = defineEmits(['refresh']);

const current = ref(0);
const groupId = ref('');
const meeting = ref(buildAiRtMeetingAdd(groupId.value));
const selectRoleType = ref<AiRtRoleType | null>(null);

const hasAdmin = computed(() => {
  return meeting.value.participants.some(p => p.type === 'admin');
});

const hasMemberParticipant = computed(() => {
  return meeting.value.participants.some(p => p.type === 'member');
});

const adminCount = computed(() => {
  return meeting.value.participants.filter(p => p.type === 'admin').length;
});

const adminParticipants = computed(() => {
  return meeting.value.participants.filter(p => p.type === 'admin');
});

const memberParticipants = computed(() => {
  return meeting.value.participants.filter(p => p.type === 'member');
});

watch(activeKey, async (key) => {
  groupId.value = key.split('/').pop()!;
  meeting.value = buildAiRtMeetingAdd(groupId.value);
  if (groupId.value) {
    meeting.value.participants = await listAiRtParticipantService('group', groupId.value)
  }
}, {immediate: true})

const moveParticipant = (index: number, direction: 'up' | 'down') => {
  const memberList = [...memberParticipants.value];
  if (direction === 'up' && index > 0) {
    const temp = memberList[index - 1]!;
    memberList[index - 1] = memberList[index]!;
    memberList[index] = temp;
  } else if (direction === 'down' && index < memberList.length - 1) {
    const temp = memberList[index + 1]!;
    memberList[index + 1] = memberList[index]!;
    memberList[index] = temp;
  }
  const adminList = adminParticipants.value;
  const allParticipants = [...adminList, ...memberList];
  allParticipants.forEach((item, i) => {
    item.join_order = i + 1;
  });
  meeting.value.participants = allParticipants;
};

const openRoleSelectDialog = async (type: AiRtRoleType) => {
  selectRoleType.value = type;
  openRoleSelect(type, (role) => {
    if (role?.type === 'admin' && adminCount.value >= 1) {
      MessageUtil.warning('上帝AI（管理员角色）最多只能设置一个');
      return;
    }
    openParticipantConfig(role ? {
      ...role,
      scope: 'meeting',
      scope_id: '',
      scene_prompt: '',
      stance: '',
      join_order: meeting.value.participants.length + 1,
      is_active: 1
    } : buildAiRtParticipantCore(type), (res) => {
      meeting.value.participants.push(res);
    }, !!role)
  })
};


const editParticipant = (participant: AiRtParticipantCore) => {
  const index = meeting.value.participants.findIndex(p => p === participant);
  if (index !== -1) {
    openParticipantConfig(participant, (res) => {
      if (index >= 0) {
        meeting.value.participants[index] = res;
      } else {
        meeting.value.participants.push(res);
      }
    }, true)
  }
};

const removeParticipant = (index: number, type: AiRtRoleType) => {
  if (type === 'admin') {
    const adminList = adminParticipants.value;
    adminList.splice(index, 1);
    meeting.value.participants = [...adminList, ...memberParticipants.value];
  } else {
    const memberList = memberParticipants.value;
    memberList.splice(index, 1);
    meeting.value.participants = [...adminParticipants.value, ...memberList];
  }
  meeting.value.participants.forEach((item, i) => {
    item.join_order = i + 1;
  });
};

const submitMeeting = async () => {
  try {
    const id = await addAiRtMeetingService(meeting.value);
    MessageUtil.success('圆桌会议创建成功');
    activeKey.value = `/meeting/${groupId.value}/${id}?mode=create`;
    emit('refresh');
  } catch (error) {
    MessageUtil.error('创建失败', error);
  }
};
</script>
<style scoped lang="less">
@import "./roundtable-create.less";
</style>
