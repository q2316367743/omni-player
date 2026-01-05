<template>
  <app-tool-layout>
    <template #title>
      <div class="flex gap-8px items-center">
        <t-button theme="primary" variant="text" shape="square" @click="collapsed = !collapsed">
          <template #icon>
            <view-list-icon/>
          </template>
        </t-button>
        <div>{{ selectedSession?.filename || '记账' }}</div>
      </div>
    </template>
    <template #action v-if="selectedSession">
      <div class="detail-meta">
        <span class="meta-item">{{ getSourceTypeName(selectedSession?.source_type) }}</span>
        <span class="meta-item">{{ selectedSession?.record_count }}条记录</span>
        <span class="meta-item">{{
            formatDateRange(selectedSession?.date_range_start, selectedSession?.date_range_end)
          }}</span>
      </div>
    </template>

    <t-layout class="bookkeeping-page">
      <t-aside :width="collapsed ? '0px' : '260px'" class="overflow-hidden shrink-0">
        <session-list @select="handleSelectSession" class="w-246px min-w-246px"/>
      </t-aside>
      <t-content>
        <session-detail :session-id="selectedSession?.id || null"/>
      </t-content>
    </t-layout>
  </app-tool-layout>
</template>

<script lang="ts" setup>
import SessionList from "@/pages/app/bookkeeping/components/SessionList.vue";
import SessionDetail from "@/pages/app/bookkeeping/components/SessionDetail.vue";
import {ViewListIcon} from "tdesign-icons-vue-next";
import {
  type AnalysisSession,
  getSourceTypeName
} from "@/entity/analysis/AnalysisSession.ts";

const selectedSession = ref<AnalysisSession>();
const collapsed = ref(false);

const handleSelectSession = (session: AnalysisSession | null) => {
  selectedSession.value = undefined;
  nextTick(() => {
    selectedSession.value = session || undefined;
    nextTick(() => {
      if (session) collapsed.value = true;
    })
  })
};
const formatDateRange = (start?: number, end?: number) => {
  if (!start || !end) return '';
  const startDate = new Date(start);
  const endDate = new Date(end);
  const format = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  return `${format(startDate)} ~ ${format(endDate)}`;
};
</script>

<style scoped lang="less">
.bookkeeping-page {
  height: 100%;

  :deep(.t-tabs__content) {
    height: calc(100% - 48px);
    overflow: auto;
  }
}

.detail-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;

  .meta-item {
    font-size: var(--td-font-size-body-small);
    color: var(--td-text-color-secondary);
    padding: 6px 14px;
    background: var(--td-bg-color-container-hover);
    border-radius: 8px;
    border: 1px solid var(--td-component-border);
    font-weight: 500;
  }
}
</style>
