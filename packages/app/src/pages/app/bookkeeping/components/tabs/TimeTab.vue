<template>
  <div class="time-tab">
    <div v-if="loading" class="loading">
      <t-loading size="large"/>
    </div>
    <div v-else-if="stats" class="time-container">
      <div class="heatmap-section">
        <t-card title="每日消费热力图">
          <template #actions>
            <t-radio-group v-model="heatmapType" variant="default-filled" size="small">
              <t-radio-button value="expense">支出金额</t-radio-button>
              <t-radio-button value="income">收入金额</t-radio-button>
              <t-radio-button value="count">交易笔数</t-radio-button>
            </t-radio-group>
          </template>
          <div ref="heatmapChartRef" class="chart-container"></div>
        </t-card>
      </div>

      <div class="hourly-section">
        <t-card title="日内时段分布">
          <div ref="hourlyChartRef" class="chart-container"></div>
        </t-card>
      </div>

      <div class="weekday-section">
        <t-card title="工作日/周末分布">
          <div ref="weekdayChartRef" class="chart-container"></div>
        </t-card>
      </div>
    </div>
    <div v-else class="empty-state">
      <div class="empty-icon">
        <chart-icon/>
      </div>
      <div class="empty-text">暂无时间分析数据</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ChartIcon} from "tdesign-icons-vue-next";
import {useSql} from "@/lib/sql.ts";
import type {AnalysisTransaction} from "@/entity/analysis/AnalysisTransaction.ts";
import * as echarts from 'echarts';
import dayjs from 'dayjs';
import {isDark} from "@/global/Constants.ts";

const props = defineProps<{
  sessionId: string
}>();

const loading = ref(true);
const stats = ref<any>(null);
const heatmapType = ref<'expense' | 'income' | 'count'>('expense');
const heatmapChartRef = ref<HTMLElement | null>(null);
const hourlyChartRef = ref<HTMLElement | null>(null);
const weekdayChartRef = ref<HTMLElement | null>(null);

let heatmapChart: echarts.ECharts | null = null;
let hourlyChart: echarts.ECharts | null = null;
let weekdayChart: echarts.ECharts | null = null;

onMounted(async () => {
  await loadData();
  await nextTick();
  setTimeout(() => {
    initCharts();
  }, 100);
});

onUnmounted(() => {
  if (heatmapChart) {
    heatmapChart.dispose();
    heatmapChart = null;
  }
  if (hourlyChart) {
    hourlyChart.dispose();
    hourlyChart = null;
  }
  if (weekdayChart) {
    weekdayChart.dispose();
    weekdayChart = null;
  }
});

watch(heatmapType, () => {
  updateHeatmapChart();
});

watch(isDark, () => {
  if (heatmapChart) updateHeatmapChart();
  if (hourlyChart) updateHourlyChart();
  if (weekdayChart) updateWeekdayChart();
});

const loadData = async () => {
  loading.value = true;
  try {
    const sql = useSql();
    const query = await sql.query<AnalysisTransaction>('analysis_transaction');
    const transactions = await query.eq('session_id', props.sessionId).list();
    
    if (transactions.length === 0) {
      stats.value = null;
      return;
    }

    stats.value = {
      transactions
    };
  } catch (error) {
    console.error('加载时间分析数据失败:', error);
    stats.value = null;
  } finally {
    loading.value = false;
  }
};

const initCharts = () => {
  if (!stats.value) return;
  
  initHeatmapChart();
  initHourlyChart();
  initWeekdayChart();
};

const initHeatmapChart = () => {
  if (!heatmapChartRef.value || !stats.value) return;
  
  if (heatmapChart) {
    heatmapChart.dispose();
  }
  
  heatmapChart = echarts.init(heatmapChartRef.value);
  updateHeatmapChart();
  
  window.addEventListener('resize', () => {
    heatmapChart?.resize();
  });
};

const updateHeatmapChart = () => {
  if (!heatmapChart || !stats.value) return;
  
  const transactions = stats.value.transactions;
  const dateMap = new Map<number, { expense: number, income: number, count: number }>();
  
  for (const tx of transactions) {
    const dateKey = Math.floor(tx.date / 86400000) * 86400000;
    const existing = dateMap.get(dateKey);
    if (existing) {
      if (tx.type === 'expense') {
        existing.expense += tx.amount;
      } else if (tx.type === 'income') {
        existing.income += tx.amount;
      }
      existing.count += 1;
    } else {
      dateMap.set(dateKey, {
        expense: tx.type === 'expense' ? tx.amount : 0,
        income: tx.type === 'income' ? tx.amount : 0,
        count: 1
      });
    }
  }
  
  const sortedDates = Array.from(dateMap.keys()).sort((a, b) => a - b);
  
  if (sortedDates.length === 0) {
    heatmapChart.clear();
    return;
  }
  
  const startDate = dayjs(sortedDates[0]);
  const endDate = dayjs(sortedDates[sortedDates.length - 1]);
  
  const data: [string, number][] = [];
  
  for (const dateKey of sortedDates) {
    const value = dateMap.get(dateKey)!;
    let val = 0;
    
    if (heatmapType.value === 'expense') {
      val = value.expense;
    } else if (heatmapType.value === 'income') {
      val = value.income;
    } else {
      val = value.count;
    }
    
    data.push([dayjs(dateKey).format('YYYY-MM-DD'), val]);
  }
  
  const maxValue = Math.max(...data.map(d => d[1]));
  
  const option = {
    tooltip: {
      position: 'top',
      formatter: (params: any) => {
        const date = params.data[0];
        return `${date}<br/>${getHeatmapTooltip(params.data[1])}`;
      }
    },
    visualMap: {
      min: 0,
      max: maxValue,
      type: 'piecewise',
      orient: 'horizontal',
      left: 'center',
      top: 65,
      inRange: {
        color: isDark.value 
          ? ['#1a3a4a', '#2d5a6b', '#407a8c', '#539aad', '#66bace']
          : ['#e0f3f8', '#abd9e9', '#74add1', '#4575b4', '#313695']
      }
    },
    calendar: {
      top: 120,
      left: 30,
      right: 30,
      cellSize: ['auto', 13],
      range: [startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD')],
      itemStyle: {
        borderWidth: 0.5,
        borderColor: isDark.value ? '#333' : '#fff'
      },
      yearLabel: { show: false },
      monthLabel: {
        nameMap: 'cn',
        fontSize: 12,
        color: isDark.value ? '#ccc' : '#333'
      },
      dayLabel: {
        nameMap: 'cn',
        fontSize: 12,
        color: isDark.value ? '#ccc' : '#333'
      }
    },
    series: [{
      type: 'heatmap',
      coordinateSystem: 'calendar',
      data: data
    }]
  };
  
  heatmapChart.setOption(option);
};

const getHeatmapTooltip = (value: number) => {
  if (heatmapType.value === 'expense') {
    return `支出金额: ¥${value.toFixed(2)}`;
  } else if (heatmapType.value === 'income') {
    return `收入金额: ¥${value.toFixed(2)}`;
  } else {
    return `交易笔数: ${value} 笔`;
  }
};

const initHourlyChart = () => {
  if (!hourlyChartRef.value || !stats.value) return;
  
  if (hourlyChart) {
    hourlyChart.dispose();
  }
  
  hourlyChart = echarts.init(hourlyChartRef.value);
  updateHourlyChart();
  
  window.addEventListener('resize', () => {
    hourlyChart?.resize();
  });
};

const updateHourlyChart = () => {
  if (!hourlyChart || !stats.value) return;
  
  const transactions = stats.value.transactions;
  const hourlyData = new Map<number, { amount: number, count: number }>();
  
  for (let i = 0; i < 24; i++) {
    hourlyData.set(i, { amount: 0, count: 0 });
  }
  
  for (const tx of transactions) {
    if (tx.type === 'expense') {
      const date = dayjs(tx.date);
      const hour = date.hour();
      const existing = hourlyData.get(hour);
      if (existing) {
        existing.amount += tx.amount;
        existing.count += 1;
      }
    }
  }
  
  const xAxisData = Array.from({ length: 24 }, (_, i) => `${i}:00`);
  const barData = Array.from({ length: 24 }, (_, i) => hourlyData.get(i)!.amount);
  const lineData = Array.from({ length: 24 }, (_, i) => hourlyData.get(i)!.count);
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      },
      formatter: (params: any) => {
        let result = `${params[0].name}<br/>`;
        for (const param of params) {
          if (param.seriesName === '消费金额') {
            result += `${param.marker}${param.seriesName}: ¥${param.value.toFixed(2)}<br/>`;
          } else {
            result += `${param.marker}${param.seriesName}: ${param.value} 笔<br/>`;
          }
        }
        return result;
      }
    },
    legend: {
      data: ['消费金额', '消费笔数'],
      textStyle: {
        color: isDark.value ? '#ccc' : '#333'
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
        interval: 2,
        color: isDark.value ? '#ccc' : '#333'
      },
      axisLine: {
        lineStyle: {
          color: isDark.value ? '#555' : '#ccc'
        }
      },
      splitLine: {
        lineStyle: {
          color: isDark.value ? '#333' : '#eee'
        }
      }
    },
    yAxis: [
      {
        type: 'value',
        name: '金额(元)',
        position: 'left',
        axisLabel: {
          formatter: '¥{value}',
          color: isDark.value ? '#ccc' : '#333'
        },
        axisLine: {
          lineStyle: {
            color: isDark.value ? '#555' : '#ccc'
          }
        },
        splitLine: {
          lineStyle: {
            color: isDark.value ? '#333' : '#eee'
          }
        }
      },
      {
        type: 'value',
        name: '笔数',
        position: 'right',
        axisLabel: {
          formatter: '{value}笔',
          color: isDark.value ? '#ccc' : '#333'
        },
        axisLine: {
          lineStyle: {
            color: isDark.value ? '#555' : '#ccc'
          }
        },
        splitLine: {
          lineStyle: {
            color: isDark.value ? '#333' : '#eee'
          }
        }
      }
    ],
    series: [
      {
        name: '消费金额',
        type: 'bar',
        data: barData,
        itemStyle: {
          color: isDark.value ? '#4a7ab8' : '#5470c6'
        }
      },
      {
        name: '消费笔数',
        type: 'line',
        yAxisIndex: 1,
        data: lineData,
        itemStyle: {
          color: isDark.value ? '#c45c5c' : '#ee6666'
        },
        smooth: true
      }
    ]
  };
  
  hourlyChart.setOption(option);
};

const initWeekdayChart = () => {
  if (!weekdayChartRef.value || !stats.value) return;
  
  if (weekdayChart) {
    weekdayChart.dispose();
  }
  
  weekdayChart = echarts.init(weekdayChartRef.value);
  updateWeekdayChart();
  
  window.addEventListener('resize', () => {
    weekdayChart?.resize();
  });
};

const updateWeekdayChart = () => {
  if (!weekdayChart || !stats.value) return;
  
  const transactions = stats.value.transactions;
  const categoryData = new Map<string, { weekday: number, weekend: number, total: number }>();
  
  for (const tx of transactions) {
    if (tx.type === 'expense') {
      const date = dayjs(tx.date);
      const dayOfWeek = date.day();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      const existing = categoryData.get(tx.category);
      if (existing) {
        if (isWeekend) {
          existing.weekend += tx.amount;
        } else {
          existing.weekday += tx.amount;
        }
        existing.total += tx.amount;
      } else {
        categoryData.set(tx.category, {
          weekday: isWeekend ? 0 : tx.amount,
          weekend: isWeekend ? tx.amount : 0,
          total: tx.amount
        });
      }
    }
  }
  
  const sortedCategories = Array.from(categoryData.entries())
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 10);
  
  const yAxisData = sortedCategories.map(([cat]) => cat);
  const weekdayData = sortedCategories.map(([, data]) => {
    return data.total > 0 ? (data.weekday / data.total * 100).toFixed(2) : 0;
  });
  const weekendData = sortedCategories.map(([, data]) => {
    return data.total > 0 ? (data.weekend / data.total * 100).toFixed(2) : 0;
  });
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params: any) => {
        let result = `${params[0].name}<br/>`;
        for (const param of params) {
          result += `${param.marker}${param.seriesName}: ${param.value}%<br/>`;
        }
        return result;
      }
    },
    legend: {
      data: ['工作日', '周末'],
      textStyle: {
        color: isDark.value ? '#ccc' : '#333'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      max: 100,
      axisLabel: {
        formatter: '{value}%',
        color: isDark.value ? '#ccc' : '#333'
      },
      axisLine: {
        lineStyle: {
          color: isDark.value ? '#555' : '#ccc'
        }
      },
      splitLine: {
        lineStyle: {
          color: isDark.value ? '#333' : '#eee'
        }
      }
    },
    yAxis: {
      type: 'category',
      data: yAxisData,
      axisLabel: {
        color: isDark.value ? '#ccc' : '#333'
      },
      axisLine: {
        lineStyle: {
          color: isDark.value ? '#555' : '#ccc'
        }
      },
      splitLine: {
        lineStyle: {
          color: isDark.value ? '#333' : '#eee'
        }
      }
    },
    series: [
      {
        name: '工作日',
        type: 'bar',
        stack: 'total',
        data: weekdayData,
        itemStyle: {
          color: isDark.value ? '#4a7ab8' : '#5470c6'
        },
        label: {
          show: true,
          position: 'inside',
          formatter: '{c}%',
          color: '#fff'
        }
      },
      {
        name: '周末',
        type: 'bar',
        stack: 'total',
        data: weekendData,
        itemStyle: {
          color: isDark.value ? '#7ab87a' : '#91cc75'
        },
        label: {
          show: true,
          position: 'inside',
          formatter: '{c}%',
          color: '#fff'
        }
      }
    ]
  };
  
  weekdayChart.setOption(option);
};
</script>

<style scoped lang="less">
.time-tab {
  height: 100%;
  overflow-y: auto;
  padding: var(--td-comp-padding-m);
}

.loading {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.time-container {
  display: flex;
  flex-direction: column;
  gap: var(--td-comp-margin-m);
}

.heatmap-section,
.hourly-section,
.weekday-section {
  .chart-container {
    height: 300px;
    width: 100%;
  }
}

.empty-state {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--td-comp-margin-m);
  color: var(--td-text-color-placeholder);

  .empty-icon {
    font-size: 64px;
    opacity: 0.3;
  }

  .empty-text {
    font-size: var(--td-font-size-body-medium);
  }
}
</style>
