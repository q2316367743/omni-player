<template>
  <div class="home-tab">
    <div v-if="loading" class="loading">
      <t-loading size="large"/>
    </div>
    <div v-else-if="stats" class="stats-container">
      <div class="stat-cards">
        <div class="stat-card">
          <div class="stat-icon income">
            <arrow-up-icon/>
          </div>
          <div class="stat-content">
            <div class="stat-label">总收入</div>
            <div class="stat-value income">{{ formatAmount(stats.income.total) }}</div>
            <div class="stat-count">{{ stats.income.count }}笔</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon expense">
            <arrow-down-icon/>
          </div>
          <div class="stat-content">
            <div class="stat-label">总支出</div>
            <div class="stat-value expense">{{ formatAmount(stats.expense.total) }}</div>
            <div class="stat-count">{{ stats.expense.count }}笔</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon total">
            <chart-icon/>
          </div>
          <div class="stat-content">
            <div class="stat-label">总交易</div>
            <div class="stat-value">{{ formatAmount(stats.total.total) }}</div>
            <div class="stat-count">{{ stats.total.count }}笔</div>
          </div>
        </div>
      </div>
      <div class="recent-section">
        <h3 class="section-title">最近交易</h3>
        <div class="transaction-list">
          <div v-for="transaction in recentTransactions" :key="transaction.id" class="transaction-item">
            <div class="transaction-info">
              <div class="transaction-product">{{ transaction.product }}</div>
              <div class="transaction-meta">
                <span class="transaction-category">{{ transaction.category }}</span>
                <span class="transaction-date">{{ formatDate(transaction.date) }}</span>
              </div>
            </div>
            <div class="transaction-amount" :class="transaction.type">
              {{ transaction.type === 'income' ? '+' : '-' }}{{ formatAmount(transaction.amount) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ArrowUpIcon, ArrowDownIcon, ChartIcon} from "tdesign-icons-vue-next";
import {useSql} from "@/lib/sql.ts";
import type {AnalysisTransaction} from "@/entity/analysis/AnalysisTransaction.ts";

const props = defineProps<{
  sessionId: string
}>();

const loading = ref(true);
const stats = ref<any>(null);
const recentTransactions = ref<any[]>([]);

onMounted(async () => {
  await loadData();
});

const loadData = async () => {
  loading.value = true;
  try {
    const sql = useSql();
    const query = await sql.query<AnalysisTransaction>('analysis_transaction');
    const transactions = await query.eq('session_id', props.sessionId).list();
    
    let incomeTotal = 0;
    let incomeCount = 0;
    let expenseTotal = 0;
    let expenseCount = 0;
    
    for (const tx of transactions) {
      if (tx.type === 'income') {
        incomeTotal += tx.amount;
        incomeCount++;
      } else if (tx.type === 'expense') {
        expenseTotal += tx.amount;
        expenseCount++;
      }
    }
    
    stats.value = {
      total: { count: transactions.length, total: incomeTotal + expenseTotal },
      income: { count: incomeCount, total: incomeTotal },
      expense: { count: expenseCount, total: expenseTotal }
    };
    
    recentTransactions.value = transactions
      .sort((a, b) => b.date - a.date)
      .slice(0, 10);
  } finally {
    loading.value = false;
  }
};

const formatAmount = (amount: number) => {
  return `¥${amount.toFixed(2)}`;
};

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};
</script>

<style scoped lang="less">
.home-tab {
  padding: 8px;
  height: calc(100% - 16px);
  overflow-y: auto;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.stats-container {
  margin: 0 auto;
}

.stat-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 8px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: var(--td-comp-paddingTB-m) var(--td-comp-paddingLR-m);
  background: linear-gradient(135deg, var(--td-bg-color-container) 0%, var(--td-bg-color-container-hover) 100%);
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid var(--td-component-border);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.06);
  }
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 14px;
  font-size: 28px;
  transition: all 0.3s ease;

  &.income {
    background: linear-gradient(135deg, var(--td-success-color) 0%, var(--td-success-color-light) 100%);
    color: var(--td-text-color-white);
    box-shadow: 0 4px 12px rgba(var(--td-success-color-rgb), 0.3);
  }

  &.expense {
    background: linear-gradient(135deg, var(--td-error-color) 0%, var(--td-error-color-light) 100%);
    color: var(--td-text-color-white);
    box-shadow: 0 4px 12px rgba(var(--td-error-color-rgb), 0.3);
  }

  &.total {
    background: linear-gradient(135deg, var(--td-brand-color) 0%, var(--td-brand-color-light) 100%);
    color: var(--td-text-color-white);
    box-shadow: 0 4px 12px rgba(var(--td-brand-color-rgb), 0.3);
  }
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: var(--td-font-size-body-small);
  color: var(--td-text-color-secondary);
  margin-bottom: var(--td-comp-margin-s);
  font-weight: 500;
  letter-spacing: 0.3px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: var(--td-comp-margin-xs);
  letter-spacing: -0.5px;

  &.income {
    background: linear-gradient(135deg, var(--td-success-color) 0%, var(--td-success-color-light) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  &.expense {
    background: linear-gradient(135deg, var(--td-error-color) 0%, var(--td-error-color-light) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}

.stat-count {
  font-size: var(--td-font-size-body-small);
  color: var(--td-text-color-placeholder);
  font-weight: 500;
}

.recent-section {
  background: linear-gradient(135deg, var(--td-bg-color-container) 0%, var(--td-bg-color-container-hover) 100%);
  border-radius: 16px;
  padding: var(--td-comp-paddingTB-m) var(--td-comp-paddingLR-m);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04);
  border: 1px solid var(--td-component-border);
}

.section-title {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--td-text-color-primary);
  letter-spacing: 0.3px;
  padding-bottom: var(--td-comp-margin-s);
  border-bottom: 2px solid var(--td-component-border);
}

.transaction-list {
  display: flex;
  flex-direction: column;
  gap: var(--td-comp-margin-s);
}

.transaction-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--td-comp-paddingTB-m) var(--td-comp-paddingLR-m);
  border-radius: 12px;
  background: linear-gradient(135deg, var(--td-bg-color-container-hover) 0%, var(--td-bg-color-container) 100%);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid var(--td-component-border);

  &:hover {
    background: linear-gradient(135deg, var(--td-bg-color-container) 0%, var(--td-bg-color-container-hover) 100%);
    transform: translateX(4px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }
}

.transaction-info {
  flex: 1;
  min-width: 0;
}

.transaction-product {
  font-size: var(--td-font-size-body-medium);
  font-weight: 600;
  color: var(--td-text-color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: var(--td-comp-margin-xs);
}

.transaction-meta {
  display: flex;
  align-items: center;
  gap: var(--td-comp-margin-m);
}

.transaction-category {
  font-size: var(--td-font-size-body-small);
  color: var(--td-text-color-secondary);
  background: var(--td-brand-color-1);
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.transaction-date {
  font-size: var(--td-font-size-body-small);
  color: var(--td-text-color-placeholder);
  font-weight: 500;
}

.transaction-amount {
  font-size: var(--td-font-size-body-large);
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 8px;
  transition: all 0.3s ease;

  &.income {
    background: linear-gradient(135deg, var(--td-success-color-1) 0%, var(--td-success-color-2) 100%);
    color: var(--td-success-color);
  }

  &.expense {
    background: linear-gradient(135deg, var(--td-error-color-1) 0%, var(--td-error-color-2) 100%);
    color: var(--td-error-color);
  }
}

@media (max-width: 768px) {
  .stats-container {
    padding: var(--td-comp-paddingTB-m) var(--td-comp-paddingLR-m);
  }

  .stat-cards {
    grid-template-columns: 1fr;
    gap: var(--td-comp-margin-m);
  }

  .stat-card {
    padding: var(--td-comp-paddingTB-m) var(--td-comp-paddingLR-m);
  }

  .stat-value {
    font-size: 20px;
  }
}
</style>
