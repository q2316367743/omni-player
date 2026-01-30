<template>
  <div class="role-management">
    <div class="page-header">
      <div class="header-content">
        <div class="flex items-center">
          <t-button class="menu-toggle-btn" theme="primary" variant="text" shape="square" @click="toggleCollapsed()" v-if="collapsed">
            <template #icon>
              <menu-fold-icon/>
            </template>
          </t-button>
          <t-divider layout="vertical" v-if="collapsed"/>
          <h1 class="page-title">角色管理</h1>
        </div>
        <p class="page-description">管理圆桌会议的 AI 角色，包括管理员角色和参与者角色</p>
        <t-alert
          theme="info"
          message="提示：此处的提示词是角色本身的提示词，不要写行为/立场等提示词"
          :close="false"
          class="page-alert"
        />
      </div>
    </div>

    <div class="content-container">
      <div class="role-section">
        <div class="section-header">
          <div class="section-title-group">
            <h2 class="section-title">
              <setting-icon class="title-icon"/>
              管理员角色
            </h2>
            <t-tooltip content="管理员角色是讨论组的管理员，负责总结各个 AI 的发言，引导讨论方向">
              <info-circle-icon class="info-icon"/>
            </t-tooltip>
          </div>
          <div class="section-actions">
            <span class="role-count">{{ adminRoles.length }} 个角色</span>
            <t-button variant="outline" size="small" @click="handleAddRole('admin')">
              <template #icon>
                <add-icon/>
              </template>
              新增
            </t-button>
          </div>
        </div>

        <div v-if="adminRoles.length === 0" class="empty-state">
          <usergroup-icon class="empty-icon"/>
          <p class="empty-text">暂无管理员角色</p>
          <t-button theme="default" variant="outline" @click="handleAddRole('admin')">
            新增管理员角色
          </t-button>
        </div>

        <div v-else class="role-grid">
          <t-popup
            v-for="role in adminRoles"
            :key="role.id"
            placement="right"
            :show-arrow="true"
            trigger="hover"
          >
            <template #content>
              <role-detail-popup :role="role"/>
            </template>
            <div
              class="role-card admin-card"
              @contextmenu="(e) => handleContextMenu(e, role)"
            >
              <div class="card-header">
                <div class="role-avatar admin-avatar">
                  <setting-icon/>
                </div>
                <div class="role-info">
                  <h3 class="role-name">{{ role.name }}</h3>
                  <t-tag size="small" theme="primary">管理员角色</t-tag>
                </div>
              </div>
            </div>
          </t-popup>
        </div>
      </div>

      <div class="role-section">
        <div class="section-header">
          <div class="section-title-group">
            <h2 class="section-title">
              <user-icon class="title-icon"/>
              参与者角色
            </h2>
            <t-tooltip content="参与者角色是参与讨论的 AI 成员，根据角色设定进行发言">
              <info-circle-icon class="info-icon"/>
            </t-tooltip>
          </div>
          <div class="section-actions">
            <span class="role-count">{{ memberRoles.length }} 个角色</span>
            <t-button theme="default" variant="outline" size="small" @click="handleAddRole('member')">
              <template #icon>
                <add-icon/>
              </template>
              新增
            </t-button>
          </div>
        </div>

        <div v-if="memberRoles.length === 0" class="empty-state">
          <user-icon class="empty-icon"/>
          <p class="empty-text">暂无参与者角色</p>
          <t-button theme="default" variant="outline" @click="handleAddRole('member')">
            新增参与者角色
          </t-button>
        </div>

        <div v-else class="role-grid">
          <t-popup
            v-for="role in memberRoles"
            :key="role.id"
            placement="right"
            :show-arrow="true"
            trigger="hover"
          >
            <template #content>
              <role-detail-popup :role="role"/>
            </template>
            <div
              class="role-card member-card"
              @contextmenu="(e) => handleContextMenu(e, role)"
            >
              <div class="card-header">
                <div class="role-avatar member-avatar">
                  <user-icon/>
                </div>
                <div class="role-info">
                  <h3 class="role-name">{{ role.name }}</h3>
                  <t-tag size="small" theme="default">参与者角色</t-tag>
                </div>
              </div>
            </div>
          </t-popup>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type {AiRtRole, AiRtRoleType} from '@/entity/app/ai/roundtable'
import {listAiRtRoleService} from '@/services/app/roundtable/AiRtRoleService'
import {openRoundtableRoleAdd, openRoundtableRoleCxt} from '@/pages/app/ai/roundtable/func/RoundtableRoleEdit'
import {AddIcon, UserIcon, InfoCircleIcon, SettingIcon, UsergroupIcon, MenuFoldIcon} from 'tdesign-icons-vue-next'
import MessageUtil from '@/util/model/MessageUtil.ts'
import RoleDetailPopup from "@/pages/app/ai/roundtable/components/RoleDetailPopup.vue";

defineProps({
  collapsed: {
    type: Boolean,
    default: false
  }
});
const emit = defineEmits(['toggleCollapsed']);
const toggleCollapsed = () => {
  emit('toggleCollapsed');
}

const roles = ref<Array<AiRtRole>>([])

const adminRoles = computed(() => roles.value.filter(r => r.type === 'admin'))
const memberRoles = computed(() => roles.value.filter(r => r.type === 'member'))

const loadRoles = async () => {
  try {
    roles.value = await listAiRtRoleService()
  } catch (e) {
    MessageUtil.error('加载角色列表失败', e)
  }
}

const handleAddRole = (type: AiRtRoleType) => {
  openRoundtableRoleAdd(type, loadRoles)
}

const handleContextMenu = (e: PointerEvent, role: AiRtRole) => {
  openRoundtableRoleCxt(e, role, loadRoles)
}

onMounted(() => {
  loadRoles()
})
</script>

<style scoped lang="less">
.role-management {
  height: calc(100vh - 16px);
  background: var(--td-bg-color-page);
  padding: 8px;
  overflow: auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding: 8px;
  background: var(--fluent-card-bg);
  border-radius: var(--fluent-radius-large);
  box-shadow: var(--fluent-elevation-2);
  border: 1px solid var(--fluent-border-subtle);
  backdrop-filter: var(--fluent-acrylic-blur);
}

.header-content {
  flex: 1;
}

.page-title {
  margin: 0 0 8px 0;
  line-height: 28px;
  font-size: 28px;
  font-weight: 600;
  background: linear-gradient(135deg, var(--td-brand-color) 0%, var(--td-brand-color-hover) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-description {
  color: var(--td-text-color-secondary);
  font-size: 14px;
  margin: 8px 0 0;
}

.page-alert {
  margin-top: 16px;
}

.content-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.role-section {
  background: var(--fluent-card-bg);
  border-radius: var(--fluent-radius-smooth);
  box-shadow: var(--fluent-elevation-1);
  border: 1px solid var(--fluent-border-subtle);
  overflow: hidden;
  transition: all var(--fluent-transition-fast);
  backdrop-filter: var(--fluent-acrylic-blur);

  &:hover {
    box-shadow: var(--fluent-elevation-2);
  }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--fluent-border-subtle);
}

.section-title-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--td-text-color-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-icon {
  font-size: 20px;
  color: var(--td-brand-color);
}

.info-icon {
  font-size: 18px;
  color: var(--td-text-color-placeholder);
  cursor: help;
  transition: color var(--fluent-transition-fast);

  &:hover {
    color: var(--td-brand-color);
  }
}

.role-count {
  color: var(--td-text-color-secondary);
  font-size: 14px;
  font-weight: 500;
}

.section-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  color: var(--td-text-color-placeholder);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.3;
  color: var(--td-text-color-secondary);
}

.empty-text {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 24px;
}

.role-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  padding: 16px;
}

.role-card {
  background: var(--fluent-card-bg);
  border-radius: var(--fluent-radius-smooth);
  border: 1px solid var(--fluent-border-subtle);
  overflow: hidden;
  cursor: pointer;
  transition: all var(--fluent-transition-fast);
  backdrop-filter: var(--fluent-acrylic-blur);

  &:hover {
    transform: translateY(-1px);
    box-shadow: var(--fluent-elevation-2);
    border-color: var(--td-brand-color);
  }

  &.admin-card {
    border-left: 3px solid var(--td-brand-color);
  }

  &.member-card {
    border-left: 3px solid var(--td-success-color);
  }
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
}

.role-avatar {
  width: 40px;
  height: 40px;
  border-radius: var(--fluent-radius-smooth);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
  flex-shrink: 0;

  &.admin-avatar {
    background: var(--td-brand-color);
  }

  &.member-avatar {
    background: var(--td-success-color);
  }
}

.role-info {
  flex: 1;
  min-width: 0;
}

.role-name {
  margin: 0 0 6px 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--td-text-color-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.t-alert) {
  margin-top: 8px;

  .t-alert__message {
    font-size: 12px;
  }
}

.menu-toggle-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--fluent-radius-smooth);
  transition: all var(--fluent-transition-fast);
  margin-right: 8px;

  &:hover {
    background: var(--td-brand-color-light);
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }

  :deep(.t-icon) {
    font-size: 20px;
  }
}


</style>
