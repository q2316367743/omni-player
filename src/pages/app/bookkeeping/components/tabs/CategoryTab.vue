<template>
  <div class="category-tab">
    <div v-if="loading" class="loading">
      <t-loading size="large"/>
    </div>
    <div v-else-if="categoryStats && categoryStats.length > 0" class="category-container">
      <div class="category-list">
        <div v-for="(stat, index) in categoryStats" :key="stat.category" class="category-item">
          <div class="category-rank">{{ index + 1 }}</div>
          <div class="category-info">
            <div class="category-name">{{ stat.category }}</div>
            <div class="category-meta">
              <span class="category-count">{{ stat.count }}笔</span>
              <span class="category-amount">{{ formatAmount(stat.total) }}</span>
            </div>
          </div>
          <div class="category-bar">
            <div class="bar-fill" :style="{ width: getPercentage(stat.total) + '%' }"/>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="empty-state">
      <div class="empty-icon">

      </div>
      <div class="empty-text">暂无分类数据</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {useSql} from "@/lib/sql.ts";
import type {AnalysisTransaction} from "@/entity/analysis/AnalysisTransaction.ts";

const props = defineProps<{
  sessionId: string
}>();

const loading = ref(true);
const categoryStats = ref<any[]>([]);
const maxTotal = ref(0);

onMounted(async () => {
  await loadData();
});

const loadData = async () => {
  loading.value = true;
  try {
    const sql = useSql();
    const query = await sql.query<AnalysisTransaction>('analysis_transaction');
    const transactions = await query.eq('session_id', props.sessionId).list();
    
    const categoryMap = new Map<string, { count: number, total: number }>();
    
    for (const tx of transactions) {
      if (!tx.category) continue;
      const existing = categoryMap.get(tx.category);
      if (existing) {
        existing.count++;
        existing.total += tx.amount;
      } else {
        categoryMap.set(tx.category, { count: 1, total: tx.amount });
      }
    }
    
    categoryStats.value = Array.from(categoryMap.entries())
      .map(([category, stats]) => ({ category, ...stats }))
      .sort((a, b) => b.total - a.total);
    
    if (categoryStats.value.length > 0) {
      maxTotal.value = Math.max(...categoryStats.value.map(s => s.total));
    }
  } finally {
    loading.value = false;
  }
};

const formatAmount = (amount: number) => {
  return `¥${amount.toFixed(2)}`;
};

const getPercentage = (total: number) => {
  if (maxTotal.value === 0) return 0;
  return (total / maxTotal.value) * 100;
};
</script>

<style scoped lang="less">
.category-tab {
  height: 100%;
  overflow-y: auto;
  padding: var(--td-comp-padding-m);
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.category-container {
  display: flex;
  flex-direction: column;
  gap: var(--td-comp-margin-s);
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: var(--td-comp-margin-s);
}

.category-item {
  display: flex;
  align-items: center;
  gap: var(--td-comp-margin-s);
  padding: var(--td-comp-padding-m);
  background: var(--td-bg-color-container-hover);
  border-radius: var(--td-radius-default);
}

.category-rank {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--td-radius-small);
  background: var(--td-brand-color);
  color: white;
  font-size: var(--td-font-size-body-medium);
  font-weight: var(--td-font-weight-medium);
  flex-shrink: 0;
}

.category-info {
  flex: 1;
  min-width: 0;
}

.category-name {
  font-size: var(--td-font-size-body-medium);
  font-weight: var(--td-font-weight-medium);
  color: var(--td-text-color-primary);
  margin-bottom: var(--td-comp-margin-xs);
}

.category-meta {
  display: flex;
  align-items: center;
  gap: var(--td-comp-margin-m);
}

.category-count {
  font-size: var(--td-font-size-body-small);
  color: var(--td-text-color-secondary);
}

.category-amount {
  font-size: var(--td-font-size-body-medium);
  font-weight: var(--td-font-weight-medium);
  color: var(--td-brand-color);
}

.category-bar {
  width: 120px;
  height: 8px;
  background: var(--td-bg-color-container);
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--td-brand-color-light), var(--td-brand-color));
  transition: width 0.3s ease;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
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
