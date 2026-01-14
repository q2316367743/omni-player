<template>
  <div class="roundtable-create">
    <t-card>
      <t-steps :current="current">
        <t-step-item title="确定主题"/>
        <t-step-item title="选取 AI"/>
        <t-step-item title="最后设置"/>
      </t-steps>
    </t-card>
    <div class="mt-8px">
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
            <t-button v-if="!hasAdmin" size="small" theme="primary" variant="outline" @click="openRoleSelectDialog('admin')">
              <template #icon><add-icon /></template>
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
              <template #icon><add-icon /></template>
              新增
            </t-button>
          </div>
          <div ref="memberListRef" class="participant-list member-list">
             <div v-for="(participant, i) in memberParticipants" :key="i" class="participant-item member-item">
              <div class="participant-handle">
                <span class="drag-icon">⋮⋮</span>
              </div>
              <div class="participant-info">
                <div class="participant-name">{{ participant.name }}</div>
                <div class="participant-meta">
                  <t-tag size="small" theme="default">成员</t-tag>
                  <span class="participant-stance">{{ participant.stance || '未设置立场' }}</span>
                </div>
              </div>
              <div class="participant-actions">
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
          <t-form-item label-align="top" label="允许用户插话" help="是否允许用户随时插话打断">
            <t-switch v-model="meeting.allow_user_interruption" :custom-value="[0, 1]"/>
          </t-form-item>
        </t-form>
        <div class="step-actions">
          <t-button theme="default" @click="current = 1">上一步</t-button>
          <t-button theme="primary" @click="submitMeeting">开启圆桌会议</t-button>
        </div>
      </t-card>
    </div>

    <t-dialog v-model:visible="roleSelectVisible" header="选择角色" :footer="false" width="600px">
      <div class="role-select-content">
        <div v-if="loadingRoles" class="loading-state">
          <t-loading size="medium" />
        </div>
        <div v-else-if="availableRoles.length === 0" class="empty-state">
          <p>暂无可用角色，请先创建角色</p>
        </div>
        <div v-else class="role-grid">
          <div v-for="role in availableRoles" :key="role.id" class="role-card" @click="selectRole(role)">
            <div class="role-card-header">
              <h4 class="role-name">{{ role.name }}</h4>
              <t-tag size="small" :theme="role.type === 'admin' ? 'warning' : 'default'">
                {{ role.type === 'admin' ? '管理员' : '成员' }}
              </t-tag>
            </div>
            <div class="role-card-body">
              <p class="role-prompt">{{ role.prompt || '暂无提示词' }}</p>
            </div>
            <div class="role-card-footer">
              <span class="role-model">{{ role.model }}</span>
            </div>
          </div>
        </div>
      </div>
    </t-dialog>

    <t-dialog v-model:visible="participantConfigVisible" header="配置参与者" :footer="false" width="700px">
      <div v-if="selectedRole" class="participant-config">
        <div class="config-header">
          <div class="config-role-info">
            <h4 class="config-role-name">{{ selectedRole.name }}</h4>
            <t-tag size="small" :theme="selectedRole.type === 'admin' ? 'warning' : 'default'">
              {{ selectedRole.type === 'admin' ? '管理员' : '成员' }}
            </t-tag>
          </div>
        </div>
        <div class="config-section">
          <div class="config-label">角色提示词</div>
          <div class="config-prompt">{{ selectedRole.prompt || '暂无提示词' }}</div>
        </div>
        <t-form>
          <t-form-item label-align="top" label="场景提示词" class="config-form-item">
            <t-textarea v-model="tempParticipant.scene_prompt" placeholder="请输入场景提示词，描述具体的身份信息/行为信息" :autosize="{minRows: 3, maxRows: 6}" />
          </t-form-item>
          <t-form-item label-align="top" label="立场" class="config-form-item">
            <t-textarea v-model="tempParticipant.stance" placeholder="请输入该参与者的立场观点" :autosize="{minRows: 2, maxRows: 4}" />
          </t-form-item>
        </t-form>
        <t-collapse v-model="advancedExpanded" class="advanced-collapse">
          <t-collapse-panel header="高级参数" value="advanced">
            <t-form label-align="top">
              <t-form-item label="使用的模型">
                <t-input v-model="tempParticipant.model" />
              </t-form-item>
              <t-form-item label="最小响应字数">
                <t-input-number v-model="tempParticipant.min_response_length" :min="-1" />
              </t-form-item>
              <t-form-item label="最大响应字数">
                <t-input-number v-model="tempParticipant.max_response_length" :min="-1" />
              </t-form-item>
              <t-form-item label="生成随机性">
                <t-slider v-model="tempParticipant.temperature" :min="0" :max="1" :step="0.1" :marks="{0: '0', 0.5: '0.5', 1: '1'}" />
              </t-form-item>
              <t-form-item label="最大思考时间（秒）">
                <t-input-number v-model="tempParticipant.timeout_per_turn" :min="1" />
              </t-form-item>
              <t-form-item label="功能设置">
                <t-space direction="vertical">
                  <t-checkbox :model-value="!!tempParticipant.enable_fact_checking" @update:model-value="(val: boolean) => tempParticipant.enable_fact_checking = val ? 1 : 0">启用事实核查</t-checkbox>
                  <t-checkbox :model-value="!!tempParticipant.allow_cross_talk" @update:model-value="(val: boolean) => tempParticipant.allow_cross_talk = val ? 1 : 0">允许主动@他人</t-checkbox>
                </t-space>
              </t-form-item>
            </t-form>
          </t-collapse-panel>
        </t-collapse>
        <div class="config-actions">
          <t-button theme="default" @click="participantConfigVisible = false">取消</t-button>
          <t-button theme="primary" @click="saveParticipant">确定</t-button>
        </div>
      </div>
    </t-dialog>
  </div>
</template>
<script lang="ts" setup>
import {buildAiRtMeetingAdd} from "@/entity/app/ai/roundtable";
import {listAiRtParticipant} from "@/services/app/roundtable/AiRtParticipantService.ts";
import {listAiRtRoleService} from "@/services/app/roundtable/AiRtRoleService.ts";
import {addAiRtMeetingService} from "@/services/app/roundtable/AiRtMeetingService.ts";
import type {AiRtRole, AiRtRoleType} from "@/entity/app/ai/roundtable";
import type {AiRtParticipantCore} from "@/entity/app/ai/roundtable";
import Sortable from 'sortablejs';
import {AddIcon} from 'tdesign-icons-vue-next';
import MessageUtil from '@/util/model/MessageUtil.ts';

const props = defineProps({
  activeKey: {
    type: String,
    default: '/create/0'
  }
});

const current = ref(0);
const groupId = ref('');
const meeting = ref(buildAiRtMeetingAdd(groupId.value));
const roleSelectVisible = ref(false);
const participantConfigVisible = ref(false);
const availableRoles = ref<AiRtRole[]>([]);
const selectedRole = ref<AiRtRole | null>(null);
const tempParticipant = ref<Partial<AiRtParticipantCore>>({});
const loadingRoles = ref(false);
const editingIndex = ref(-1);
const advancedExpanded = ref([]);
const memberListRef = ref<HTMLElement>();
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

watch(() => props.activeKey, async (key) => {
  groupId.value = key.split('/').pop()!;
  meeting.value = buildAiRtMeetingAdd(groupId.value);
  if (groupId.value) {
    meeting.value.participants = await listAiRtParticipant('group', groupId.value)
  }
}, {immediate: true})

onMounted(() => {
  initSortable();
});

const initSortable = () => {
  if (memberListRef.value) {
    Sortable.create(memberListRef.value, {
      handle: '.participant-handle',
      animation: 150,
      onEnd: (evt) => {
        if (evt.oldIndex === undefined || evt.newIndex === undefined) return;
        const newMemberOrder = [...memberParticipants.value];
        const movedItem = newMemberOrder.splice(evt.oldIndex, 1)[0];
        if (!movedItem) return;
        newMemberOrder.splice(evt.newIndex, 0, movedItem);
        
        const adminList = adminParticipants.value;
        const allParticipants = [...adminList, ...newMemberOrder];
        
        allParticipants.forEach((item, index) => {
          item.join_order = index + 1;
        });
        
        meeting.value.participants = allParticipants;
      }
    });
  }
};

const openRoleSelectDialog = async (type: AiRtRoleType) => {
  selectRoleType.value = type;
  roleSelectVisible.value = true;
  loadingRoles.value = true;
  try {
    const allRoles = await listAiRtRoleService();
    if (type === 'admin') {
      availableRoles.value = allRoles.filter(r => r.type === 'admin');
    } else {
      availableRoles.value = allRoles.filter(r => r.type === 'member');
    }
  } finally {
    loadingRoles.value = false;
  }
};

const selectRole = (role: AiRtRole) => {
  if (role.type === 'admin' && adminCount.value >= 1) {
    MessageUtil.warning('上帝AI（管理员角色）最多只能设置一个');
    return;
  }
  selectedRole.value = role;
  roleSelectVisible.value = false;
  editingIndex.value = -1;
  tempParticipant.value = {
    ...role,
    scope: 'meeting',
    scope_id: '',
    scene_prompt: '',
    stance: '',
    join_order: meeting.value.participants.length + 1,
    is_active: 1
  };
  participantConfigVisible.value = true;
};

const editParticipant = (participant: AiRtParticipantCore) => {
  const index = meeting.value.participants.findIndex(p => p === participant);
  if (index !== -1) {
    editingIndex.value = index;
    selectedRole.value = {
      id: '',
      name: participant.name,
      prompt: participant.prompt,
      type: participant.type,
      model: participant.model,
      min_response_length: participant.min_response_length,
      max_response_length: participant.max_response_length,
      temperature: participant.temperature,
      enable_fact_checking: participant.enable_fact_checking,
      allow_cross_talk: participant.allow_cross_talk,
      timeout_per_turn: participant.timeout_per_turn,
      created_at: 0,
      updated_at: 0
    };
    tempParticipant.value = { ...participant };
    participantConfigVisible.value = true;
  }
};

const saveParticipant = () => {
  if (editingIndex.value >= 0) {
    meeting.value.participants[editingIndex.value] = { ...tempParticipant.value } as AiRtParticipantCore;
  } else {
    meeting.value.participants.push({ ...tempParticipant.value } as AiRtParticipantCore);
  }
  participantConfigVisible.value = false;
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
    await addAiRtMeetingService(meeting.value);
    MessageUtil.success('圆桌会议创建成功');
  } catch (error) {
    MessageUtil.error('创建失败', error);
  }
};
</script>
<style scoped lang="less">
.roundtable-create {
  padding: 8px;
}

.participant-section {
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--fluent-border-subtle);
}

.section-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--td-text-color-primary);
}

.participant-list {
  min-height: 200px;
  max-height: 500px;
  overflow-y: auto;
}

.admin-list {
  background: var(--td-bg-color-secondarycontainer);
  border-radius: var(--fluent-radius-card);
  padding: 8px;
  height: 76px;
  min-height: 76px;
  overflow: hidden;
}

.member-list {
  background: var(--fluent-card-bg);
  border-radius: var(--fluent-radius-card);
  padding: 8px;
}

.participant-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  margin-bottom: 8px;
  background: var(--fluent-card-bg);
  border: 1px solid var(--fluent-card-border);
  border-radius: var(--fluent-radius-card);
  box-shadow: var(--fluent-card-shadow);
  transition: all var(--fluent-transition-normal);
  cursor: move;

  &:hover {
    background: var(--fluent-card-bg-hover);
    box-shadow: var(--fluent-card-shadow-hover);
  }
}

.admin-item {
  background: var(--td-bg-color-container);
  border-color: var(--td-warning-color-3);
  cursor: default;

  &:hover {
    background: var(--td-bg-color-container);
    box-shadow: var(--fluent-card-shadow);
  }
}

.member-item {
  cursor: move;
}

.participant-handle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  margin-right: 12px;
  color: var(--td-text-color-placeholder);
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
}

.drag-icon {
  font-size: 16px;
  letter-spacing: -2px;
}

.participant-info {
  flex: 1;
  min-width: 0;
}

.participant-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--td-text-color-primary);
  margin-bottom: 6px;
}

.participant-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.participant-stance {
  font-size: 12px;
  color: var(--td-text-color-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.participant-actions {
  display: flex;
  gap: 8px;
}

.participant-actions-bottom {
  margin-top: 16px;
  text-align: center;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: var(--td-text-color-placeholder);
  font-size: 14px;
}

.role-select-content {
  max-height: 500px;
  overflow-y: auto;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.role-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 12px;
}

.role-card {
  padding: 16px;
  background: var(--fluent-card-bg);
  border: 1px solid var(--fluent-card-border);
  border-radius: var(--fluent-radius-card);
  box-shadow: var(--fluent-card-shadow);
  cursor: pointer;
  transition: all var(--fluent-transition-normal);

  &:hover {
    background: var(--fluent-card-bg-hover);
    box-shadow: var(--fluent-card-shadow-hover);
    border-color: var(--fluent-accent-color);
  }
}

.role-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.role-name {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--td-text-color-primary);
}

.role-card-body {
  margin-bottom: 12px;
}

.role-prompt {
  margin: 0;
  font-size: 12px;
  color: var(--td-text-color-secondary);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.role-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.role-model {
  font-size: 11px;
  color: var(--td-text-color-placeholder);
}

.participant-config {
  padding: 8px 0;
}

.config-header {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--fluent-border-subtle);
}

.config-role-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.config-role-name {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--td-text-color-primary);
}

.config-section {
  margin-bottom: 20px;
}

.config-label {
  font-size: 12px;
  color: var(--td-text-color-secondary);
  margin-bottom: 8px;
  font-weight: 500;
}

.config-prompt {
  padding: 12px;
  background: var(--td-bg-color-secondarycontainer);
  border-radius: var(--fluent-radius-smooth);
  font-size: 13px;
  color: var(--td-text-color-primary);
  line-height: 1.6;
  word-break: break-all;
}

.config-form-item {
  margin-bottom: 16px;
}

.advanced-collapse {
  margin: 20px 0;
}

.config-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--fluent-border-subtle);
}

.step-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--fluent-border-subtle);
}
</style>
