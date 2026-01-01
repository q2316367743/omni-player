<template>
  <app-tool-layout title="记账">
    <div class="bookkeeping-page">
      <vertical-split-panel :default-left-width="30" :min-left-width="20" :min-right-width="40">
        <template #left>
          <session-list @select="handleSelectSession"/>
        </template>
        <template #right>
          <session-detail :session-id="selectedSessionId"/>
        </template>
      </vertical-split-panel>
    </div>
  </app-tool-layout>
</template>

<script lang="ts" setup>
import VerticalSplitPanel from "@/components/common/VerticalSplitPanel.vue";
import SessionList from "@/pages/app/bookkeeping/components/SessionList.vue";
import SessionDetail from "@/pages/app/bookkeeping/components/SessionDetail.vue";

const selectedSessionId = ref<string | null>(null);

const handleSelectSession = (sessionId: string | null) => {
  selectedSessionId.value = sessionId;
};
</script>

<style scoped lang="less">
.bookkeeping-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--td-comp-margin-m);
  :deep(.t-tabs__content) {
    height: calc(100% - 48px);
    overflow: auto;
  }
}
</style>
