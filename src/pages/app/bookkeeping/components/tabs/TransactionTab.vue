<template>
  <div class="transaction-tab">
    <div class="tab-header">
      <t-radio-group v-model="filterType" variant="default-filled">
        <t-radio-button value="all">全部交易</t-radio-button>
        <t-radio-button value="large">仅大额交易</t-radio-button>
        <t-radio-button value="small">仅小额交易</t-radio-button>
      </t-radio-group>
    </div>
    <div v-if="loading" class="loading">
      <t-loading size="large"/>
    </div>
    <div v-else-if="transactions && transactions.length > 0" class="transaction-container">
      <div class="transaction-list">
        <div v-for="transaction in transactions" :key="transaction.id" class="transaction-item">
          <div class="transaction-date">
            <div class="date-day">{{ getDay(transaction.date) }}</div>
            <div class="date-month">{{ getMonth(transaction.date) }}</div>
          </div>
          <div class="transaction-info">
            <div class="transaction-product">{{ transaction.product }}</div>
            <div class="transaction-meta">
              <span class="transaction-category">{{ transaction.category }}</span>
              <span class="transaction-counterparty">{{ transaction.counterparty }}</span>
            </div>
            <div v-if="transaction.remark" class="transaction-remark">{{ transaction.remark }}</div>
          </div>
          <div class="transaction-amount" :class="transaction.type">
            {{ transaction.type === 'income' ? '+' : '-' }}{{ formatAmount(transaction.amount) }}
          </div>
        </div>
      </div>
    </div>
    <div v-else class="empty-state">
      <div class="empty-icon">
        <file-icon/>
      </div>
      <div class="empty-text">暂无交易记录</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {FileIcon} from "tdesign-icons-vue-next";
import {useSql} from "@/lib/sql.ts";
import type {AnalysisTransaction} from "@/entity/analysis/AnalysisTransaction.ts";

const props = defineProps<{
  sessionId: string
}>();

const filterType = ref<'all' | 'large' | 'small'>('all');
const loading = ref(true);
const transactions = ref<any[]>([]);

watch(filterType, async () => {
  await loadTransactions();
});

onMounted(async () => {
  await loadTransactions();
});

const loadTransactions = async () => {
  loading.value = true;
  try {
    const sql = useSql();
    let query = await sql.query<AnalysisTransaction>('analysis_transaction');
    query = query.eq('session_id', props.sessionId);
    
    if (filterType.value === 'large') {
      query = query.ge('amount', 100);
    } else if (filterType.value === 'small') {
      query = query.lt('amount', 100);
    }
    
    transactions.value = await query.orderByDesc('date').list();
  } finally {
    loading.value = false;
  }
};

const formatAmount = (amount: number) => {
  return `¥${amount.toFixed(2)}`;
};

const getDay = (timestamp: number) => {
  const date = new Date(timestamp);
  return String(date.getDate()).padStart(2, '0');
};

const getMonth = (timestamp: number) => {
  const date = new Date(timestamp);
  return `${date.getMonth() + 1}月`;
};
</script>

<style scoped lang="less">
.transaction-tab {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.tab-header {
  padding: var(--td-comp-padding-m);
  border-bottom: 1px solid var(--td-component-border);
  flex-shrink: 0;
}

.loading {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.transaction-container {
  flex: 1;
  overflow-y: auto;
  padding: var(--td-comp-padding-m);
}

.transaction-list {
  display: flex;
  flex-direction: column;
  gap: var(--td-comp-margin-s);
}

.transaction-item {
  display: flex;
  align-items: flex-start;
  gap: var(--td-comp-margin-m);
  padding: var(--td-comp-padding-m);
  background: var(--td-bg-color-container-hover);
  border-radius: var(--td-radius-default);
  transition: all var(--td-duration);

  &:hover {
    background: var(--td-bg-color-container-active);
  }
}

.transaction-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: var(--td-radius-default);
  background: var(--td-brand-color-light);
  color: var(--td-brand-color);
  flex-shrink: 0;
}

.date-day {
  font-size: var(--td-font-size-title-medium);
  font-weight: var(--td-font-weight-medium);
  line-height: 1;
}

.date-month {
  font-size: var(--td-font-size-body-small);
  margin-top: 2px;
}

.transaction-info {
  flex: 1;
  min-width: 0;
}

.transaction-product {
  font-size: var(--td-font-size-body-medium);
  font-weight: var(--td-font-weight-medium);
  color: var(--td-text-color-primary);
  margin-bottom: var(--td-comp-margin-xs);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.transaction-meta {
  display: flex;
  align-items: center;
  gap: var(--td-comp-margin-m);
  margin-bottom: var(--td-comp-margin-xs);
}

.transaction-category {
  font-size: var(--td-font-size-body-small);
  color: var(--td-text-color-secondary);
  padding: 2px 8px;
  background: var(--td-bg-color-container);
  border-radius: var(--td-radius-small);
}

.transaction-counterparty {
  font-size: var(--td-font-size-body-small);
  color: var(--td-text-color-placeholder);
}

.transaction-remark {
  font-size: var(--td-font-size-body-small);
  color: var(--td-text-color-placeholder);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.transaction-amount {
  font-size: var(--td-font-size-title-small);
  font-weight: var(--td-font-weight-medium);
  flex-shrink: 0;

  &.income {
    color: #00baad;
  }

  &.expense {
    color: #ff4d4f;
  }
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--td-text-color-placeholder);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: var(--td-comp-margin-m);
  opacity: 0.3;
}

.empty-text {
  font-size: var(--td-font-size-body-medium);
}
</style>
