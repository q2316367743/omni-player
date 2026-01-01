<template>
  <div class="session-list">
    <div class="session-header">
      <h3 class="session-title">
        <file-icon class="title-icon"/>
        账单记录
      </h3>
      <t-button theme="primary" variant="text" shape="square" @click="openAddSession(loadSessions)">
        <template #icon>
          <add-icon/>
        </template>
      </t-button>
    </div>
    <div class="session-items">
      <div
        v-for="session in sessions"
        :key="session.id"
        class="session-item"
        :class="{ active: selectedSessionId === session.id }"
        @click="handleSelectSession(session.id)"
        @contextmenu="handleSessionContextmenu(session, $event)"
      >
        <div class="session-icon" :class="session.source_type">
          <component :is="getSourceIcon(session)"/>
        </div>
        <div class="session-info">
          <div class="session-name">{{ session.filename }}</div>
          <div class="session-meta">
            <span class="session-type">{{ getSourceTypeName(session.source_type) }}</span>
            <span class="session-count">{{ session.record_count }}条记录</span>
          </div>
          <div class="session-date">
            {{ formatDateRange(session.date_range_start, session.date_range_end) }}
          </div>
        </div>
      </div>
      <div v-if="sessions.length === 0" class="empty-state">
        <div class="empty-icon">
          <file-icon/>
        </div>
        <div class="empty-text">暂无账单记录</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {FileIcon, AddIcon, LogoWechatpayIcon, LogoAlipayIcon} from "tdesign-icons-vue-next";
import type {AnalysisSession} from "@/entity/analysis/AnalysisSession.ts";
import {openSessionContextmenu} from "@/pages/app/bookkeeping/func/SessionEdit.tsx";
import {openAddSession} from "@/pages/app/bookkeeping/func/AddSession.tsx";
import {useSql} from "@/lib/sql.ts";

const emit = defineEmits<{
  select: [sessionId: string | null]
}>();

const sessions = ref<AnalysisSession[]>([]);
const selectedSessionId = ref<string | null>(null);

onMounted(async () => {
  await loadSessions();
});

const loadSessions = async () => {
  const sql = useSql();
  const query = await sql.query<AnalysisSession>('analysis_session');
  sessions.value = await query.orderByDesc('created_at').list();
};

const handleSelectSession = (id: string) => {
  if (selectedSessionId.value === id) {
    selectedSessionId.value = null;
    emit('select', null)
    return;
  }
  selectedSessionId.value = id;
  emit('select', id);
};

const getSourceIcon = (session: AnalysisSession) => {
  if (session.source_type === 'wechat') return LogoWechatpayIcon;
  if (session.source_type === 'alipay') return LogoAlipayIcon;
  return FileIcon;
};

const getSourceTypeName = (sourceType: 'wechat' | 'alipay') => {
  switch (sourceType) {
    case 'wechat':
      return '微信';
    case 'alipay':
      return '支付宝';
  }
};

const formatDateRange = (start: number, end: number) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const format = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  return `${format(startDate)} ~ ${format(endDate)}`;
};

const handleSessionContextmenu = (session: AnalysisSession, e: PointerEvent) => {
  e.preventDefault();
  e.stopPropagation();
  openSessionContextmenu(session, e, loadSessions);
};
</script>

<style scoped lang="less">
.session-list {
  height: calc(100% - 16px);
  display: flex;
  flex-direction: column;
  background: var(--td-bg-color-container);
  border-radius: var(--td-radius-medium);
  padding: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.session-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding: 0 4px;
}

.session-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--td-text-color-primary);
  letter-spacing: 0.5px;
}

.title-icon {
  font-size: 20px;
  color: var(--td-brand-color);
}

.session-items {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-right: 4px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--td-bg-color-component);
    border-radius: 3px;

    &:hover {
      background: var(--td-bg-color-component-hover);
    }
  }
}

.session-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: var(--td-radius-medium);
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--td-bg-color-container);
  border: 1px solid transparent;

  &:hover {
    background: var(--td-bg-color-container-hover);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  &.active {
    background: var(--td-bg-color-container-active);
    border-color: var(--td-brand-color);
    box-shadow: 0 4px 12px rgba(var(--td-brand-color-rgb), 0.2);
  }
}

.session-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--td-bg-color-page);
  font-size: 24px;
  color: var(--td-text-color-secondary);
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);

  &.wechat {
    color: #07c160;
    background: linear-gradient(135deg, #e8f7ed 0%, #d4f1e2 100%);
  }

  &.alipay {
    color: #1677ff;
    background: linear-gradient(135deg, #e8f0ff 0%, #d4e4ff 100%);
  }
}

.session-info {
  flex: 1;
  min-width: 0;
}

.session-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--td-text-color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 6px;
  letter-spacing: 0.3px;
}

.session-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 4px;
}

.session-type {
  font-size: 13px;
  color: var(--td-text-color-secondary);
  font-weight: 500;
  padding: 2px 8px;
  background: var(--td-bg-color-page);
  border-radius: 4px;
}

.session-count {
  font-size: 13px;
  color: var(--td-text-color-secondary);
  font-weight: 500;
}

.session-date {
  font-size: 12px;
  color: var(--td-text-color-placeholder);
  font-weight: 400;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--td-text-color-placeholder);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.2;
  color: var(--td-text-color-secondary);
}

.empty-text {
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.5px;
}
</style>
