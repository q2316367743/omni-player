<template>
  <div class="session-detail">
    <div v-if="!sessionId" class="empty-state">
      <div class="empty-icon">
        <file-icon/>
      </div>
      <div class="empty-text">请选择一个账单记录</div>
    </div>
    <div v-else class="detail-content">
      <t-tabs v-model="activeTab" placement="top" size="medium">
        <t-tab-panel value="home" label="首页">
          <home-tab :session-id="sessionId"/>
        </t-tab-panel>
        <t-tab-panel value="yearly" label="年度总览">
          <yearly-tab :session-id="sessionId"/>
        </t-tab-panel>
        <t-tab-panel value="month" label="月度分析">
          <month-tab :session-id="sessionId"/>
        </t-tab-panel>
        <t-tab-panel value="category" label="分类分析">
          <category-tab :session-id="sessionId"/>
        </t-tab-panel>
        <t-tab-panel value="event" label="时间分析">
          <time-tab :session-id="sessionId"/>
        </t-tab-panel>
        <t-tab-panel value="insight" label="消费洞察">
          <insight-tab :session-id="sessionId"/>
        </t-tab-panel>
        <t-tab-panel value="transaction" label="交易记录">
          <transaction-tab :session-id="sessionId"/>
        </t-tab-panel>
      </t-tabs>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {FileIcon} from "tdesign-icons-vue-next";
import type {AnalysisSession} from "@/entity/analysis/AnalysisSession.ts";
import {useMpSql} from "@/lib/sql.ts";
import HomeTab from "./tabs/HomeTab.vue";
import YearlyTab from "./tabs/YearlyTab.vue";
import MonthTab from "./tabs/MonthTab.vue";
import CategoryTab from "./tabs/CategoryTab.vue";
import TimeTab from "./tabs/TimeTab.vue";
import InsightTab from "./tabs/InsightTab.vue";
import TransactionTab from "./tabs/TransactionTab.vue";

const props = defineProps<{
  sessionId: string | null
}>();

const activeTab = ref('home');
const session = ref<AnalysisSession | null>(null);

watch(() => props.sessionId, async (newId) => {
  if (newId) {
    const sql = useMpSql();
    const query = sql.query<AnalysisSession>('analysis_session');
    session.value = await query.eq('id', newId).first();
  } else {
    session.value = null;
  }
}, { immediate: true });
</script>

<style scoped lang="less">
.session-detail {
  height: calc(100% - 36px);
  display: flex;
  flex-direction: column;
  background: var(--td-bg-color-container);
  border-radius: var(--td-radius-medium);
  border: 1px solid var(--td-component-border);
  padding: 8px;
  margin: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--td-text-color-placeholder);
  padding: 40px;
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 24px;
  opacity: 0.4;
}

.empty-text {
  font-size: var(--td-font-size-body-large);
  color: var(--td-text-color-secondary);
}

.detail-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.detail-header {
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--td-component-border);
}

.detail-title {
  margin: 0 0 16px 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--td-text-color-primary);
  line-height: 1.4;
}



</style>
