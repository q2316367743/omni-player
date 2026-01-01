<template>
  <app-tool-layout>
    <template #title>
      <div class="flex gap-8px items-center">
        <div>记账</div>
        <t-button theme="primary" variant="text" shape="square" @click="collapsed = !collapsed">
          <template #icon>
            <view-list-icon />
          </template>
        </t-button>
      </div>
    </template>
    <t-layout class="bookkeeping-page">
      <t-aside :width="collapsed ? '0px' : '260px'" class="overflow-hidden shrink-0">
        <session-list @select="handleSelectSession" class="w-246px min-w-246px"/>
      </t-aside>
      <t-content>
        <session-detail :session-id="selectedSessionId"/>
      </t-content>
    </t-layout>
  </app-tool-layout>
</template>

<script lang="ts" setup>
import SessionList from "@/pages/app/bookkeeping/components/SessionList.vue";
import SessionDetail from "@/pages/app/bookkeeping/components/SessionDetail.vue";
import {ViewListIcon} from "tdesign-icons-vue-next";

const selectedSessionId = ref<string | null>(null);
const collapsed = ref(false);

const handleSelectSession = (sessionId: string | null) => {
  selectedSessionId.value = sessionId;
  nextTick(() => {
    if (sessionId) collapsed.value = true;
  })
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
</style>
