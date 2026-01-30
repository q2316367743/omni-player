<template>
  <div class="group-management">
    <div class="page-header">
      <div class="header-content">
        <div class="flex items-center">
          <t-button class="menu-toggle-btn" theme="primary" variant="text" shape="square" @click="toggleCollapsed()" v-if="collapsed">
            <template #icon>
              <menu-fold-icon/>
            </template>
          </t-button>
          <t-divider layout="vertical" v-if="collapsed"/>
          <h1 class="page-title">分组管理</h1>
        </div>
        <p class="page-description">管理圆桌会议的讨论组，配置会议参数和默认设置</p>
      </div>
      <t-button theme="primary" @click="handleAddGroup">
        <template #icon>
          <add-icon/>
        </template>
        新增分组
      </t-button>
    </div>

    <div class="content-container">
      <div v-if="groups.length === 0" class="empty-state">
        <usergroup-icon class="empty-icon"/>
        <p class="empty-text">暂无讨论组</p>
        <t-button theme="default" variant="outline" @click="handleAddGroup">
          新增讨论组
        </t-button>
      </div>

      <div v-else class="group-grid">
        <t-popup
          v-for="group in groups"
          :key="group.id"
          placement="right"
          :show-arrow="true"
          trigger="hover"
        >
          <template #content>
            <div class="group-detail-popup">
              <div class="detail-item">
                <span class="detail-label">最大发言轮数：</span>
                <span class="detail-value">{{ group.max_rounds === 0 ? '无限制' : group.max_rounds }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">总结间隔：</span>
                <span class="detail-value">每 {{ group.summary_interval }} 轮</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">自动总结：</span>
                <span class="detail-value">{{ group.auto_summary_on_end === 1 ? '是' : '否' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">用户角色：</span>
                <span class="detail-value">{{ group.user_role }}</span>
              </div>
            </div>
          </template>
          <div
            class="group-card"
            @contextmenu="(e) => handleContextMenu(e, group)"
          >
            <div class="card-header">
              <div class="group-avatar">
                <usergroup-icon/>
              </div>
              <div class="group-info">
                <h3 class="group-name">{{ group.name }}</h3>
                <div class="group-meta">
                  <t-tag size="small" theme="default">{{ group.max_rounds === 0 ? '无限制' : group.max_rounds + ' 轮' }}</t-tag>
                  <t-tag size="small" theme="primary">{{ group.summary_interval + ' 轮/总结' }}</t-tag>
                </div>
              </div>
            </div>
          </div>
        </t-popup>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type {AiRtGroup} from '@/entity/app/ai/roundtable'
import {listAiRtGroupService} from '@/services/app/roundtable'
import {openRoundtableGroupCxt} from '@/pages/app/ai/roundtable/func/RoundtableGroupEdit'
import {AddIcon, UsergroupIcon, MenuFoldIcon} from 'tdesign-icons-vue-next'
import MessageUtil from '@/util/model/MessageUtil.ts'

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

const groups = ref<Array<AiRtGroup>>([])

const loadGroups = async () => {
  try {
    groups.value = await listAiRtGroupService()
  } catch (e) {
    MessageUtil.error('加载分组列表失败', e)
  }
}

const handleAddGroup = () => {
}

const handleContextMenu = (e: PointerEvent, group: AiRtGroup) => {
  openRoundtableGroupCxt(e, group, loadGroups)
}

onMounted(() => {
  loadGroups()
})
</script>

<style scoped lang="less">
.group-management {
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

.content-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
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

.group-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  padding: 16px;
}

.group-card {
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
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
}

.group-avatar {
  width: 48px;
  height: 48px;
  border-radius: var(--fluent-radius-smooth);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
  flex-shrink: 0;
  background: linear-gradient(135deg, var(--td-brand-color) 0%, var(--td-brand-color-hover) 100%);
}

.group-info {
  flex: 1;
  min-width: 0;
}

.group-name {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--td-text-color-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.group-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.group-detail-popup {
  padding: 8px 0;
  min-width: 200px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  font-size: 14px;
}

.detail-label {
  color: var(--td-text-color-secondary);
}

.detail-value {
  color: var(--td-text-color-primary);
  font-weight: 500;
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
