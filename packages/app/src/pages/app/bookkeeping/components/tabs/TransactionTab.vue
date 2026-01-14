<template>
  <div class="transaction-tab">
    <div class="tab-header">
      <div class="filter-row">
        <div class="filter-item">
          <span class="filter-label">时间</span>
          <t-date-picker
            v-model="selectedMonth"
            mode="month"
            clearable
            placeholder="选择月份"
            @change="handleFilterChange"
          />
        </div>
        <div class="filter-item">
          <span class="filter-label">分类</span>
          <t-select
            v-model="selectedCategory"
            clearable
            placeholder="选择分类"
            @change="handleFilterChange"
          >
            <t-option
              v-for="cat in categories"
              :key="cat"
              :value="cat"
            >
              {{ cat }}
            </t-option>
          </t-select>
        </div>
        <div class="filter-item">
          <span class="filter-label">类型</span>
          <t-select
            v-model="selectedType"
            clearable
            placeholder="选择类型"
            @change="handleFilterChange"
          >
            <t-option value="income">收入</t-option>
            <t-option value="expense">支出</t-option>
          </t-select>
        </div>
        <div class="filter-item">
          <span class="filter-label">商品</span>
          <t-input
            v-model="searchKeyword"
            placeholder="输入商品名称"
            clearable
            @change="handleFilterChange"
          />
        </div>
      </div>
      <div class="filter-row">
        <t-radio-group v-model="filterType" variant="default-filled">
          <t-radio-button value="all">全部交易</t-radio-button>
          <t-radio-button value="large">仅大额交易</t-radio-button>
          <t-radio-button value="small">仅小额交易</t-radio-button>
        </t-radio-group>
      </div>
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
      <div class="pagination-container">
        <t-pagination
          v-model="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :show-page-size="true"
          :page-size-options="[10, 20, 50, 100]"
          @change="handlePageChange"
          @page-size-change="handlePageSizeChange"
        />
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
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(0);
const allTransactions = ref<any[]>([]);
const selectedMonth = ref<string>('');
const selectedCategory = ref<string>('');
const selectedType = ref<string>('');
const searchKeyword = ref<string>('');
const categories = ref<string[]>([]);

watch(filterType, async () => {
  currentPage.value = 1;
  await loadTransactions();
});

watch([selectedMonth, selectedCategory, selectedType, searchKeyword], async () => {
  currentPage.value = 1;
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
    
    allTransactions.value = await query.orderByDesc('date').list();
    
    allTransactions.value = allTransactions.value.filter(item => {
      if (selectedMonth.value) {
        const itemDate = new Date(item.date);
        const monthStr = `${itemDate.getFullYear()}-${String(itemDate.getMonth() + 1).padStart(2, '0')}`;
        if (monthStr !== selectedMonth.value) return false;
      }
      
      if (selectedCategory.value && item.category !== selectedCategory.value) {
        return false;
      }
      
      if (selectedType.value && item.type !== selectedType.value) {
        return false;
      }
      
      if (searchKeyword.value) {
        const keyword = searchKeyword.value.toLowerCase();
        if (!item.product.toLowerCase().includes(keyword)) {
          return false;
        }
      }
      
      return true;
    });
    
    const uniqueCategories = [...new Set(allTransactions.value.map(item => item.category))];
    categories.value = uniqueCategories.sort();
    
    total.value = allTransactions.value.length;
    
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    transactions.value = allTransactions.value.slice(start, end);
  } finally {
    loading.value = false;
  }
};

const handleFilterChange = () => {
  currentPage.value = 1;
};

const handlePageChange = (pageInfo: any) => {
  currentPage.value = pageInfo.current;
  const start = (pageInfo.current - 1) * pageSize.value;
  const end = start + pageSize.value;
  transactions.value = allTransactions.value.slice(start, end);
};

const handlePageSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1;
  const start = 0;
  const end = size;
  transactions.value = allTransactions.value.slice(start, end);
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
  overflow: auto;
}

.tab-header {
  padding: 16px;
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  background: var(--td-bg-color-container);
  border-bottom: 1px solid var(--td-component-border);
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  z-index: 10;
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
  flex-wrap: wrap;

  &:last-child {
    margin-bottom: 0;
  }
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--td-text-color-secondary);
  white-space: nowrap;
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
  padding: 16px;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.transaction-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

.transaction-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  background: var(--td-bg-color-container);
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid var(--td-component-border);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);

  &:hover {
    background: var(--td-bg-color-container-hover);
    border-color: var(--td-brand-color-light);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }
}

.transaction-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--td-brand-color-light) 0%, var(--td-brand-color-light-1) 100%);
  color: var(--td-brand-color);
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 179, 173, 0.15);
}

.date-day {
  font-size: 20px;
  font-weight: 600;
  line-height: 1;
}

.date-month {
  font-size: 12px;
  margin-top: 4px;
  opacity: 0.9;
}

.transaction-info {
  flex: 1;
  min-width: 0;
}

.transaction-product {
  font-size: 15px;
  font-weight: 600;
  color: var(--td-text-color-primary);
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.transaction-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}

.transaction-category {
  font-size: 12px;
  color: var(--td-brand-color);
  padding: 4px 10px;
  background: var(--td-brand-color-light);
  border-radius: 6px;
  font-weight: 500;
}

.transaction-counterparty {
  font-size: 12px;
  color: var(--td-text-color-secondary);
  display: flex;
  align-items: center;
  
  &::before {
    content: '';
    display: inline-block;
    width: 4px;
    height: 4px;
    background: var(--td-text-color-placeholder);
    border-radius: 50%;
    margin-right: 6px;
  }
}

.transaction-remark {
  font-size: 12px;
  color: var(--td-text-color-placeholder);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-top: 4px;
}

.transaction-amount {
  font-size: 18px;
  font-weight: 700;
  flex-shrink: 0;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;

  &.income {
    color: #00baad;
    background: rgba(0, 186, 173, 0.08);
  }

  &.expense {
    color: #ff4d4f;
    background: rgba(255, 77, 79, 0.08);
  }
}

.pagination-container {
  padding: 20px 0 0 0;
  display: flex;
  justify-content: center;
  border-top: 1px solid var(--td-component-border);
  margin-top: 16px;
  background: var(--td-bg-color-container);
  border-radius: 0 0 12px 12px;
  flex-shrink: 0;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--td-text-color-placeholder);
  padding: 60px 20px;
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 20px;
  opacity: 0.2;
  color: var(--td-brand-color);
}

.empty-text {
  font-size: 15px;
  font-weight: 500;
  color: var(--td-text-color-secondary);
}
</style>
