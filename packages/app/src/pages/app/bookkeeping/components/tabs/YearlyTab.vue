<template>
  <div class="yearly-tab">
    <div v-if="loading" class="loading">
      <t-loading size="large"/>
    </div>
    <div v-else-if="stats" class="yearly-container">
      <div class="stats-cards">
        <div class="stat-card balance">
          <div class="stat-icon">
            <chart-icon/>
          </div>
          <div class="stat-content">
            <div class="stat-label">年度收支</div>
            <div class="stat-value" :class="stats.balance >= 0 ? 'positive' : 'negative'">
              {{ formatAmount(Math.abs(stats.balance)) }}
            </div>
            <div class="stat-desc">{{ getBalanceDesc() }}</div>
          </div>
        </div>
        <div class="stat-card expense">
          <div class="stat-icon">
            <arrow-down-icon/>
          </div>
          <div class="stat-content">
            <div class="stat-label">年度支出</div>
            <div class="stat-value">{{ formatAmount(stats.expense.total) }}</div>
            <div class="stat-desc">{{ stats.expense.count }}笔支出 日均 {{ formatAmount(stats.expense.daily) }} 元</div>
          </div>
        </div>
        <div class="stat-card income">
          <div class="stat-icon">
            <arrow-up-icon/>
          </div>
          <div class="stat-content">
            <div class="stat-label">年度收入</div>
            <div class="stat-value">{{ formatAmount(stats.income.total) }}</div>
            <div class="stat-desc">{{ stats.income.count }}笔收入 月均 {{ formatAmount(stats.income.monthly) }} 元</div>
          </div>
        </div>
        <div class="stat-card transaction">
          <div class="stat-icon">
            <transform-icon/>
          </div>
          <div class="stat-content">
            <div class="stat-label">交易情况</div>
            <div class="stat-value">{{ stats.total.count }}笔</div>
            <div class="stat-desc">平均 {{ formatAmount(stats.total.avg) }} 元/笔 {{ stats.total.tradingDays }} 个交易日</div>
          </div>
        </div>
      </div>

      <div class="trend-section">
        <t-card title="支出趋势 / 收入趋势">
          <template #actions>
            <t-radio-group v-model="trendType" variant="default-filled" size="small">
              <t-radio-button value="expense">支出</t-radio-button>
              <t-radio-button value="income">收入</t-radio-button>
            </t-radio-group>
          </template>
          <div ref="trendChartRef" class="chart-container"></div>
        </t-card>
      </div>

      <div class="category-section">
        <t-card title="支出分类">
          <div ref="categoryChartRef" class="chart-container"></div>
        </t-card>
      </div>
    </div>
    <div v-else class="empty-state">
      <div class="empty-icon">
        <chart-icon/>
      </div>
      <div class="empty-text">暂无年度数据</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ChartIcon, ArrowUpIcon, ArrowDownIcon, TransformIcon} from "tdesign-icons-vue-next";
import {useMpSql} from "@/lib/sql.ts";
import type {AnalysisTransaction} from "@/entity/analysis/AnalysisTransaction.ts";
import * as echarts from 'echarts';

const props = defineProps<{
  sessionId: string
}>();

const loading = ref(true);
const stats = ref<any>(null);
const trendType = ref<'expense' | 'income'>('expense');
const trendChartRef = ref<HTMLElement | null>(null);
const categoryChartRef = ref<HTMLElement | null>(null);
let trendChart: echarts.ECharts | null = null;
let categoryChart: echarts.ECharts | null = null;

onMounted(async () => {
  await loadData();
  await nextTick();
  initCharts();
});

onUnmounted(() => {
  if (trendChart) {
    trendChart.dispose();
    trendChart = null;
  }
  if (categoryChart) {
    categoryChart.dispose();
    categoryChart = null;
  }
});

watch(trendType, () => {
  updateTrendChart();
});

const loadData = async () => {
  loading.value = true;
  try {
    const sql = useMpSql();
    const query = sql.query<AnalysisTransaction>('analysis_transaction');
    const transactions = await query.eq('session_id', props.sessionId).list();
    
    if (transactions.length === 0) {
      stats.value = null;
      return;
    }

    let incomeTotal = 0;
    let incomeCount = 0;
    let expenseTotal = 0;
    let expenseCount = 0;
    const tradingDays = new Set<number>();
    
    for (const tx of transactions) {
      const date = new Date(tx.date);
      const dayKey = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
      tradingDays.add(dayKey);
      
      if (tx.type === 'income') {
        incomeTotal += tx.amount;
        incomeCount++;
      } else if (tx.type === 'expense') {
        expenseTotal += tx.amount;
        expenseCount++;
      }
    }

    const firstTx = transactions.reduce((min, tx) => tx.date < min.date ? tx : min);
    const lastTx = transactions.reduce((max, tx) => tx.date > max.date ? tx : max);
    const daysDiff = Math.max(1, Math.ceil((lastTx.date - firstTx.date) / (1000 * 60 * 60 * 24)));
    const monthsDiff = Math.max(1, daysDiff / 30);

    stats.value = {
      balance: incomeTotal - expenseTotal,
      income: {
        total: incomeTotal,
        count: incomeCount,
        monthly: incomeTotal / monthsDiff
      },
      expense: {
        total: expenseTotal,
        count: expenseCount,
        daily: expenseTotal / daysDiff
      },
      total: {
        count: transactions.length,
        avg: (incomeTotal + expenseTotal) / transactions.length,
        tradingDays: tradingDays.size
      },
      transactions
    };
  } finally {
    loading.value = false;
  }
};

const formatAmount = (amount: number) => {
  return `¥${amount.toFixed(2)}`;
};

const getBalanceDesc = () => {
  if (!stats.value) return '';
  const { balance, income, expense } = stats.value;
  if (balance >= 0) {
    return `收入大于支出 结余 ${formatAmount(balance)}`;
  } else {
    const ratio = expense.total / income.total * 100;
    return `支大于收 超支比例 ${ratio.toFixed(2)}%`;
  }
};

const initCharts = () => {
  if (!stats.value) return;
  
  initTrendChart();
  initCategoryChart();
};

const initTrendChart = () => {
  if (!trendChartRef.value || !stats.value) return;
  
  trendChart = echarts.init(trendChartRef.value);
  updateTrendChart();
  
  window.addEventListener('resize', () => {
    trendChart?.resize();
  });
};

const updateTrendChart = () => {
  if (!trendChart || !stats.value) return;
  
  const monthlyData = new Map<number, { income: number, expense: number }>();
  
  for (const tx of stats.value.transactions) {
    const date = new Date(tx.date);
    const monthKey = date.getFullYear() * 100 + date.getMonth() + 1;
    const existing = monthlyData.get(monthKey);
    if (existing) {
      if (tx.type === 'income') {
        existing.income += tx.amount;
      } else if (tx.type === 'expense') {
        existing.expense += tx.amount;
      }
    } else {
      monthlyData.set(monthKey, {
        income: tx.type === 'income' ? tx.amount : 0,
        expense: tx.type === 'expense' ? tx.amount : 0
      });
    }
  }
  
  const sortedMonths = Array.from(monthlyData.keys()).sort((a, b) => a - b);
  const xAxisData = sortedMonths.map(month => {
    const year = Math.floor(month / 100);
    const m = month % 100;
    return `${year}-${String(m).padStart(2, '0')}`;
  });
  const seriesData = sortedMonths.map(month => {
    const data = monthlyData.get(month)!;
    return trendType.value === 'income' ? data.income : data.expense;
  });
  
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const param = params[0];
        return `${param.name}<br/>${trendType.value === 'income' ? '收入' : '支出'}: ¥${param.value.toFixed(2)}`;
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: xAxisData,
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (value: number) => `¥${value.toFixed(0)}`
      }
    },
    series: [
      {
        name: trendType.value === 'income' ? '收入' : '支出',
        type: 'bar',
        data: seriesData,
        itemStyle: {
          color: trendType.value === 'income' ? '#52c41a' : '#ff4d4f'
        },
        barWidth: '60%'
      }
    ]
  };
  
  trendChart.setOption(option);
};

const initCategoryChart = () => {
  if (!categoryChartRef.value || !stats.value) return;
  
  categoryChart = echarts.init(categoryChartRef.value);
  updateCategoryChart();
  
  window.addEventListener('resize', () => {
    categoryChart?.resize();
  });
};

const updateCategoryChart = () => {
  if (!categoryChart || !stats.value) return;
  
  const categoryData = new Map<string, number>();
  
  for (const tx of stats.value.transactions) {
    if (tx.type === 'expense') {
      const existing = categoryData.get(tx.category);
      if (existing) {
        categoryData.set(tx.category, existing + tx.amount);
      } else {
        categoryData.set(tx.category, tx.amount);
      }
    }
  }
  
  const sortedCategories = Array.from(categoryData.entries())
    .sort((a, b) => b[1] - a[1]);
  
  const chartData = sortedCategories.map(([category, amount]) => ({
    name: category,
    value: amount
  }));
  
  const total = chartData.reduce((sum, item) => sum + item.value, 0);
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const percent = (params.value / total * 100).toFixed(2);
        return `${params.name}<br/>金额: ¥${params.value.toFixed(2)}<br/>占比: ${percent}%`;
      }
    },
    legend: {
      orient: 'vertical',
      right: '10%',
      top: 'center',
      type: 'scroll'
    },
    series: [
      {
        name: '支出分类',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          position: 'outside',
          formatter: (params: any) => {
            const percent = (params.value / total * 100).toFixed(1);
            return `${params.name}\n${percent}%`;
          },
          fontSize: 12
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: true
        },
        data: chartData
      }
    ]
  };
  
  categoryChart.setOption(option);
};
</script>

<style scoped lang="less">
.yearly-tab {
  height: calc(100% - 16px);
  overflow-y: auto;
  padding: 8px;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.yearly-container {
  display: flex;
  flex-direction: column;
  gap: var(--td-comp-margin-m);
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--td-comp-margin-m);
}

.stat-card {
  display: flex;
  align-items: center;
  gap: var(--td-comp-margin-m);
  padding: var(--td-comp-paddingTB-m) var(--td-comp-paddingLR-m);
  background: linear-gradient(135deg, var(--td-bg-color-container) 0%, var(--td-bg-color-container-hover) 100%);
  border-radius: var(--td-radius-large);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--td-component-border);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: var(--td-radius-medium);
  font-size: 28px;
  transition: all 0.3s ease;

  .balance & {
    background: linear-gradient(135deg, var(--td-brand-color) 0%, var(--td-brand-color-light) 100%);
    color: var(--td-text-color-white);
    box-shadow: 0 4px 12px rgba(var(--td-brand-color-rgb), 0.3);
  }

  .expense & {
    background: linear-gradient(135deg, var(--td-error-color) 0%, var(--td-error-color-light) 100%);
    color: var(--td-text-color-white);
    box-shadow: 0 4px 12px rgba(var(--td-error-color-rgb), 0.3);
  }

  .income & {
    background: linear-gradient(135deg, var(--td-success-color) 0%, var(--td-success-color-light) 100%);
    color: var(--td-text-color-white);
    box-shadow: 0 4px 12px rgba(var(--td-success-color-rgb), 0.3);
  }

  .transaction & {
    background: linear-gradient(135deg, var(--td-warning-color) 0%, var(--td-warning-color-light) 100%);
    color: var(--td-text-color-white);
    box-shadow: 0 4px 12px rgba(var(--td-warning-color-rgb), 0.3);
  }
}

.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-label {
  font-size: var(--td-font-size-body-small);
  color: var(--td-text-color-secondary);
  margin-bottom: var(--td-comp-margin-xs);
  font-weight: 500;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: var(--td-comp-margin-xs);
  letter-spacing: -0.5px;

  &.positive {
    background: linear-gradient(135deg, var(--td-success-color) 0%, var(--td-success-color-light) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  &.negative {
    background: linear-gradient(135deg, var(--td-error-color) 0%, var(--td-error-color-light) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}

.stat-desc {
  font-size: var(--td-font-size-body-small);
  color: var(--td-text-color-placeholder);
  line-height: 1.4;
}

.trend-section,
.category-section {
  margin-top: var(--td-comp-margin-m);
}

.chart-container {
  width: 100%;
  height: 400px;
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

@media (max-width: 1200px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }

  .chart-container {
    height: 300px;
  }
}
</style>
