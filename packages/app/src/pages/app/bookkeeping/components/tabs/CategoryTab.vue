<template>
  <div class="category-tab">
    <div v-if="loading" class="loading">
      <t-loading size="large"/>
    </div>
    <div v-else-if="stats" class="category-container">
      <div class="filter-section">
        <div class="filter-left">
          <t-select v-model="selectedCategory" placeholder="选择分类" style="width: 200px">
            <t-option v-for="cat in categories" :key="cat" :value="cat">
              {{ cat }}
            </t-option>
          </t-select>
        </div>
        <div class="filter-right">
          <t-radio-group v-model="timeRange" variant="default-filled" size="small">
            <t-radio-button value="all">所有</t-radio-button>
            <t-radio-button value="monthly">月度</t-radio-button>
          </t-radio-group>
          <span v-if="timeRange === 'all'" class="time-label">所有</span>
          <t-select v-else v-model="selectedMonth" placeholder="选择年月" style="width: 140px">
            <t-option v-for="month in availableMonths" :key="month.value" :value="month.value">
              {{ month.label }}
            </t-option>
          </t-select>
        </div>
      </div>

      <div class="stats-cards">
        <div class="stat-card total">
          <div class="stat-icon">
            <chart-icon/>
          </div>
          <div class="stat-content">
            <div class="stat-label">分类总支出</div>
            <div class="stat-value">{{ formatAmount(stats.categoryTotal) }}</div>
            <div class="stat-desc">{{ stats.categoryCount }} 笔交易 平均 {{ formatAmount(stats.categoryAvg) }} 元/笔</div>
          </div>
        </div>
        <div class="stat-card percentage">
          <div class="stat-icon">
            <percent-icon/>
          </div>
          <div class="stat-content">
            <div class="stat-label">支出占比</div>
            <div class="stat-value">{{ stats.percentage.toFixed(2) }}%</div>
            <div class="stat-desc">占总支出 {{ formatAmount(stats.totalExpense) }}</div>
          </div>
        </div>
        <div class="stat-card monthly">
          <div class="stat-icon">
            <calendar-icon/>
          </div>
          <div class="stat-content">
            <div class="stat-label">月均支出</div>
            <div class="stat-value">{{ formatAmount(stats.monthlyAvg) }}</div>
            <div class="stat-desc">{{ stats.monthCount }} 个月</div>
          </div>
        </div>
        <div class="stat-card frequency">
          <div class="stat-icon">
            <time-icon/>
          </div>
          <div class="stat-content">
            <div class="stat-label">消费频率</div>
            <div class="stat-value">{{ stats.frequency.toFixed(2) }} 次/天</div>
            <div class="stat-desc">{{ stats.daysDiff }} 天内 {{ stats.categoryCount }} 次消费</div>
          </div>
        </div>
      </div>

      <div class="trend-section">
        <t-card title="支出趋势">
          <div ref="trendChartRef" class="chart-container"></div>
        </t-card>
      </div>

      <div class="pattern-section">
        <t-card title="消费规律分析">
          <div ref="patternChartRef" class="chart-container"></div>
        </t-card>
      </div>

      <div class="distribution-section">
        <t-card title="金额分布">
          <div ref="distributionChartRef" class="chart-container"></div>
        </t-card>
      </div>
    </div>
    <div v-else class="empty-state">
      <div class="empty-icon">
        <chart-icon/>
      </div>
      <div class="empty-text">暂无分类数据</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ChartIcon, CalendarIcon, TimeIcon, PercentIcon} from "tdesign-icons-vue-next";
import {useSql} from "@/lib/sql.ts";
import type {AnalysisTransaction} from "@/entity/analysis/AnalysisTransaction.ts";
import * as echarts from 'echarts';

const props = defineProps<{
  sessionId: string
}>();

const loading = ref(true);
const stats = ref<any>(null);
const categories = ref<string[]>([]);
const selectedCategory = ref<string>('');
const timeRange = ref<'all' | 'monthly'>('all');
const selectedMonth = ref<number>(0);
const availableMonths = ref<Array<{ value: number, label: string }>>([]);
const allTransactions = ref<AnalysisTransaction[]>([]);

const trendChartRef = ref<HTMLElement | null>(null);
const patternChartRef = ref<HTMLElement | null>(null);
const distributionChartRef = ref<HTMLElement | null>(null);

let trendChart: echarts.ECharts | null = null;
let patternChart: echarts.ECharts | null = null;
let distributionChart: echarts.ECharts | null = null;

watch([selectedCategory, timeRange], async () => {
  if (timeRange.value === 'monthly') {
    const categoryTransactions = allTransactions.value.filter(tx => 
      tx.type === 'expense' && tx.category === selectedCategory.value
    );
    
    const monthSet = new Set<number>();
    for (const tx of categoryTransactions) {
      const date = new Date(tx.date);
      const monthKey = date.getFullYear() * 100 + date.getMonth() + 1;
      monthSet.add(monthKey);
    }
    
    const sortedMonths = Array.from(monthSet).sort((a, b) => a - b);
    availableMonths.value = sortedMonths.map(month => {
      const year = Math.floor(month / 100);
      const m = month % 100;
      return {
        value: month,
        label: `${year}年${m}月`
      };
    });
    
    if (availableMonths.value.length > 0) {
      const currentMonthInList = availableMonths.value.find(m => m.value === selectedMonth.value);
      if (!currentMonthInList) {
        const lastMonth = availableMonths.value[availableMonths.value.length - 1];
        if (lastMonth) {
          selectedMonth.value = lastMonth.value;
        }
      }
    }
  } else {
    const monthSet = new Set<number>();
    for (const tx of allTransactions.value) {
      const date = new Date(tx.date);
      const monthKey = date.getFullYear() * 100 + date.getMonth() + 1;
      monthSet.add(monthKey);
    }
    
    const sortedMonths = Array.from(monthSet).sort((a, b) => a - b);
    availableMonths.value = sortedMonths.map(month => {
      const year = Math.floor(month / 100);
      const m = month % 100;
      return {
        value: month,
        label: `${year}年${m}月`
      };
    });
  }
  
  await loadData();
  await nextTick();
  setTimeout(() => {
    updateCharts();
  }, 100);
});

watch(selectedMonth, async () => {
  if (timeRange.value === 'monthly') {
    await loadData();
    await nextTick();
    setTimeout(() => {
      updateCharts();
    }, 100);
  }
});

onMounted(async () => {
  await loadData();
  await nextTick();
  setTimeout(() => {
    initCharts();
  }, 100);
});

onUnmounted(() => {
  if (trendChart) {
    trendChart.dispose();
    trendChart = null;
  }
  if (patternChart) {
    patternChart.dispose();
    patternChart = null;
  }
  if (distributionChart) {
    distributionChart.dispose();
    distributionChart = null;
  }
});

const loadData = async () => {
  loading.value = true;
  try {
    if (allTransactions.value.length === 0) {
      const sql = useSql();
      const query = await sql.query<AnalysisTransaction>('analysis_transaction');
      allTransactions.value = await query.eq('session_id', props.sessionId).list();
      
      if (allTransactions.value.length === 0) {
        stats.value = null;
        return;
      }

      const categorySet = new Set<string>();
      const monthSet = new Set<number>();
      
      for (const tx of allTransactions.value) {
        if (tx.category && tx.type === 'expense') {
          categorySet.add(tx.category);
        }
        const date = new Date(tx.date);
        const monthKey = date.getFullYear() * 100 + date.getMonth() + 1;
        monthSet.add(monthKey);
      }

      categories.value = Array.from(categorySet).sort();
      if (categories.value.length > 0 && !selectedCategory.value) {
        selectedCategory.value = categories.value[0] || '';
      }

      const sortedMonths = Array.from(monthSet).sort((a, b) => a - b);
      availableMonths.value = sortedMonths.map(month => {
        const year = Math.floor(month / 100);
        const m = month % 100;
        return {
          value: month,
          label: `${year}年${m}月`
        };
      });

      if (!selectedMonth.value && availableMonths.value.length > 0) {
        const lastMonth = availableMonths.value[availableMonths.value.length - 1];
        if (lastMonth) {
          selectedMonth.value = lastMonth.value;
        }
      }
    }

    let filteredTransactions = allTransactions.value.filter(tx => 
      tx.type === 'expense' && tx.category === selectedCategory.value
    );

    let allExpenseTransactions = allTransactions.value.filter(tx => tx.type === 'expense');

    if (timeRange.value === 'monthly') {
      filteredTransactions = filteredTransactions.filter(tx => {
        const date = new Date(tx.date);
        const monthKey = date.getFullYear() * 100 + date.getMonth() + 1;
        return monthKey === selectedMonth.value;
      });
      
      allExpenseTransactions = allExpenseTransactions.filter(tx => {
        const date = new Date(tx.date);
        const monthKey = date.getFullYear() * 100 + date.getMonth() + 1;
        return monthKey === selectedMonth.value;
      });
    }

    if (filteredTransactions.length === 0) {
      stats.value = null;
      return;
    }
    
    let totalExpense = 0;
    for (const tx of allExpenseTransactions) {
      totalExpense += tx.amount;
    }

    const categoryTotal = filteredTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    const categoryCount = filteredTransactions.length;
    const categoryAvg = categoryTotal / categoryCount;

    const firstTx = filteredTransactions.reduce((min, tx) => tx.date < min.date ? tx : min);
    const lastTx = filteredTransactions.reduce((max, tx) => tx.date > max.date ? tx : max);
    const daysDiff = Math.max(1, Math.ceil((lastTx.date - firstTx.date) / (1000 * 60 * 60 * 24)));
    const frequency = categoryCount / daysDiff;

    const monthSet = new Set<number>();
    for (const tx of filteredTransactions) {
      const date = new Date(tx.date);
      const monthKey = date.getFullYear() * 100 + date.getMonth() + 1;
      monthSet.add(monthKey);
    }
    const monthCount = monthSet.size;
    const monthlyAvg = categoryTotal / monthCount;

    stats.value = {
      categoryTotal,
      categoryCount,
      categoryAvg,
      totalExpense,
      percentage: (categoryTotal / totalExpense) * 100,
      monthlyAvg,
      monthCount,
      frequency,
      daysDiff,
      transactions: filteredTransactions,
      allTransactions: allExpenseTransactions
    };
  } finally {
    loading.value = false;
  }
};

const formatAmount = (amount: number) => {
  return `¥${amount.toFixed(2)}`;
};

const initCharts = () => {
  if (!stats.value) return;
  
  initTrendChart();
  initPatternChart();
  initDistributionChart();
};

const updateCharts = () => {
  if (!stats.value) return;
  
  updateTrendChart();
  updatePatternChart();
  updateDistributionChart();
};

const initTrendChart = () => {
  if (!trendChartRef.value || !stats.value) return;
  
  if (trendChart) {
    trendChart.dispose();
  }
  
  trendChart = echarts.init(trendChartRef.value);
  updateTrendChart();
  
  window.addEventListener('resize', () => {
    trendChart?.resize();
  });
};

const updateTrendChart = () => {
  if (!trendChart || !stats.value) return;
  
  const isAll = timeRange.value === 'all';
  const dataMap = new Map<string, { categoryAmount: number, totalAmount: number }>();
  
  for (const tx of stats.value.transactions) {
    const date = new Date(tx.date);
    const key = isAll ? `${date.getFullYear()}年${date.getMonth() + 1}月` : `${date.getMonth() + 1}月${date.getDate()}日`;
    
    const existing = dataMap.get(key);
    if (existing) {
      existing.categoryAmount += tx.amount;
    } else {
      dataMap.set(key, { categoryAmount: tx.amount, totalAmount: 0 });
    }
  }
  
  for (const tx of stats.value.allTransactions) {
    const date = new Date(tx.date);
    const key = isAll ? `${date.getFullYear()}年${date.getMonth() + 1}月` : `${date.getMonth() + 1}月${date.getDate()}日`;
    
    const existing = dataMap.get(key);
    if (existing) {
      existing.totalAmount += tx.amount;
    } else {
      dataMap.set(key, { categoryAmount: 0, totalAmount: tx.amount });
    }
  }
  
  const sortedKeys = Array.from(dataMap.keys()).sort((a, b) => {
    const dateA = isAll ? parseMonthKey(a) : parseDayKey(a);
    const dateB = isAll ? parseMonthKey(b) : parseDayKey(b);
    return dateA - dateB;
  });
  
  const xAxisData = sortedKeys;
  const barData = sortedKeys.map(key => dataMap.get(key)!.categoryAmount);
  const lineData = sortedKeys.map(key => {
    const data = dataMap.get(key)!;
    return data.totalAmount > 0 ? (data.categoryAmount / data.totalAmount) * 100 : 0;
  });
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      },
      formatter: (params: any) => {
        let result = `${params[0].name}<br/>`;
        for (const param of params) {
          if (param.seriesType === 'bar') {
            result += `${param.seriesName}: ¥${param.value.toFixed(2)}<br/>`;
          } else {
            result += `${param.seriesName}: ${param.value.toFixed(2)}%<br/>`;
          }
        }
        return result;
      }
    },
    legend: {
      data: ['支出金额', '占比']
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
        interval: isAll ? 0 : 'auto',
        rotate: isAll ? 0 : 45
      }
    },
    yAxis: [
      {
        type: 'value',
        name: '金额',
        position: 'left',
        axisLabel: {
          formatter: (value: number) => `¥${value.toFixed(0)}`
        }
      },
      {
        type: 'value',
        name: '占比',
        position: 'right',
        axisLabel: {
          formatter: (value: number) => `${value.toFixed(0)}%`
        },
        max: 100
      }
    ],
    series: [
      {
        name: '支出金额',
        type: 'bar',
        data: barData,
        itemStyle: {
          color: '#ff4d4f'
        },
        barWidth: '60%'
      },
      {
        name: '占比',
        type: 'line',
        yAxisIndex: 1,
        data: lineData,
        itemStyle: {
          color: '#1890ff'
        },
        smooth: true
      }
    ]
  };
  
  trendChart.setOption(option);
};

const parseMonthKey = (key: string) => {
  const match = key.match(/(\d+)年(\d+)月/);
  if (match && match[1] && match[2]) {
    return parseInt(match[1]) * 100 + parseInt(match[2]);
  }
  return 0;
};

const parseDayKey = (key: string) => {
  const match = key.match(/(\d+)月(\d+)日/);
  if (match && match[1] && match[2]) {
    return parseInt(match[1]) * 100 + parseInt(match[2]);
  }
  return 0;
};

const initPatternChart = () => {
  if (!patternChartRef.value || !stats.value) return;
  
  if (patternChart) {
    patternChart.dispose();
  }
  
  patternChart = echarts.init(patternChartRef.value);
  updatePatternChart();
  
  window.addEventListener('resize', () => {
    patternChart?.resize();
  });
};

const updatePatternChart = () => {
  if (!patternChart || !stats.value) return;
  
  const hourData = new Map<number, { count: number, amount: number }>();
  
  for (let i = 0; i < 24; i++) {
    hourData.set(i, { count: 0, amount: 0 });
  }
  
  for (const tx of stats.value.transactions) {
    const date = new Date(tx.date);
    const hour = date.getHours();
    const existing = hourData.get(hour);
    if (existing) {
      existing.count++;
      existing.amount += tx.amount;
    }
  }
  
  const xAxisData = Array.from({ length: 24 }, (_, i) => `${i}:00`);
  const barData = Array.from({ length: 24 }, (_, i) => hourData.get(i)!.count);
  const lineData = Array.from({ length: 24 }, (_, i) => hourData.get(i)!.amount);
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      },
      formatter: (params: any) => {
        let result = `${params[0].name}<br/>`;
        for (const param of params) {
          if (param.seriesType === 'bar') {
            result += `${param.seriesName}: ${param.value} 次<br/>`;
          } else {
            result += `${param.seriesName}: ¥${param.value.toFixed(2)}<br/>`;
          }
        }
        return result;
      }
    },
    legend: {
      data: ['交易次数', '交易金额']
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
        interval: 2
      }
    },
    yAxis: [
      {
        type: 'value',
        name: '次数',
        position: 'left'
      },
      {
        type: 'value',
        name: '金额',
        position: 'right',
        axisLabel: {
          formatter: (value: number) => `¥${value.toFixed(0)}`
        }
      }
    ],
    series: [
      {
        name: '交易次数',
        type: 'bar',
        data: barData,
        itemStyle: {
          color: '#faad14'
        },
        barWidth: '60%'
      },
      {
        name: '交易金额',
        type: 'line',
        yAxisIndex: 1,
        data: lineData,
        itemStyle: {
          color: '#52c41a'
        },
        smooth: true
      }
    ]
  };
  
  patternChart.setOption(option);
};

const initDistributionChart = () => {
  if (!distributionChartRef.value || !stats.value) return;
  
  if (distributionChart) {
    distributionChart.dispose();
  }
  
  distributionChart = echarts.init(distributionChartRef.value);
  updateDistributionChart();
  
  window.addEventListener('resize', () => {
    distributionChart?.resize();
  });
};

const updateDistributionChart = () => {
  if (!distributionChart || !stats.value) return;
  
  const ranges = [
    { label: '0-50', min: 0, max: 50 },
    { label: '50-100', min: 50, max: 100 },
    { label: '100-200', min: 100, max: 200 },
    { label: '200-500', min: 200, max: 500 },
    { label: '500-1000', min: 500, max: 1000 },
    { label: '1000+', min: 1000, max: Infinity }
  ];
  
  const rangeCounts = new Map<string, number>();
  
  for (const range of ranges) {
    rangeCounts.set(range.label, 0);
  }
  
  for (const tx of stats.value.transactions) {
    for (const range of ranges) {
      if (tx.amount >= range.min && tx.amount < range.max) {
        const existing = rangeCounts.get(range.label);
        if (existing !== undefined) {
          rangeCounts.set(range.label, existing + 1);
        }
        break;
      }
    }
  }
  
  const xAxisData = ranges.map(r => r.label);
  const barData = ranges.map(r => rangeCounts.get(r.label) || 0);
  
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const param = params[0];
        return `${param.name}<br/>交易次数: ${param.value} 笔`;
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
        formatter: (value: string) => `¥${value}`
      }
    },
    yAxis: {
      type: 'value',
      name: '交易次数'
    },
    series: [
      {
        name: '交易次数',
        type: 'bar',
        data: barData,
        itemStyle: {
          color: '#722ed1'
        },
        barWidth: '60%'
      }
    ]
  };
  
  distributionChart.setOption(option);
};
</script>

<style scoped lang="less">
.category-tab {
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

.category-container {
  display: flex;
  flex-direction: column;
  gap: var(--td-comp-margin-m);
}

.filter-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--td-comp-paddingTB-s) var(--td-comp-paddingLR-m);
  background: var(--td-bg-color-container);
  border-radius: var(--td-radius-medium);
  border: 1px solid var(--td-component-border);
}

.filter-left {
  display: flex;
  align-items: center;
  gap: var(--td-comp-margin-s);
}

.filter-right {
  display: flex;
  align-items: center;
  gap: var(--td-comp-margin-s);
}

.time-label {
  font-size: var(--td-font-size-body-medium);
  color: var(--td-text-color-secondary);
  padding: 0 var(--td-comp-padding-s);
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

  .total & {
    background: linear-gradient(135deg, var(--td-brand-color) 0%, var(--td-brand-color-light) 100%);
    color: var(--td-text-color-white);
    box-shadow: 0 4px 12px rgba(var(--td-brand-color-rgb), 0.3);
  }

  .percentage & {
    background: linear-gradient(135deg, #1890ff 0%, #69c0ff 100%);
    color: var(--td-text-color-white);
    box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
  }

  .monthly & {
    background: linear-gradient(135deg, #52c41a 0%, #95de64 100%);
    color: var(--td-text-color-white);
    box-shadow: 0 4px 12px rgba(82, 196, 26, 0.3);
  }

  .frequency & {
    background: linear-gradient(135deg, #faad14 0%, #ffc53d 100%);
    color: var(--td-text-color-white);
    box-shadow: 0 4px 12px rgba(250, 173, 20, 0.3);
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
  background: linear-gradient(135deg, var(--td-brand-color) 0%, var(--td-brand-color-light) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-desc {
  font-size: var(--td-font-size-body-small);
  color: var(--td-text-color-placeholder);
  line-height: 1.4;
}

.trend-section,
.pattern-section,
.distribution-section {
  margin-top: var(--td-comp-margin-m);
}

.chart-container {
  width: 100%;
  height: 400px;
  min-height: 400px;
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

  .filter-section {
    flex-direction: column;
    gap: var(--td-comp-margin-s);
  }

  .filter-left,
  .filter-right {
    width: 100%;
    justify-content: center;
  }

  .chart-container {
    height: 300px;
  }
}
</style>
