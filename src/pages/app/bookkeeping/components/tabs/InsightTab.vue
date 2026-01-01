<template>
  <div class="insight-tab">
    <div v-if="loading" class="loading">
      <t-loading size="large"/>
    </div>
    <div v-else-if="insightData" class="insight-container">
      <div class="tags-section">
        <div class="tags-title">智能标签</div>
        <div class="tags-list">
          <t-tag v-for="tag in insightData.tags" :key="tag" theme="primary" variant="outline">
            {{ tag }}
          </t-tag>
        </div>
      </div>

      <div class="profile-section">
        <t-card title="消费画像">
          <t-row :gutter="16">
            <t-col :span="3">
              <div class="profile-stat">
                <div class="stat-label">总支出</div>
                <div class="stat-value expense">{{ formatAmount(insightData.profile.totalExpense) }}</div>
              </div>
            </t-col>
            <t-col :span="3">
              <div class="profile-stat">
                <div class="stat-label">总交易</div>
                <div class="stat-value">{{ insightData.profile.totalTransactions }} 笔</div>
              </div>
            </t-col>
            <t-col :span="3">
              <div class="profile-stat">
                <div class="stat-label">平均单笔</div>
                <div class="stat-value">{{ formatAmount(insightData.profile.avgTransactionAmount) }}</div>
              </div>
            </t-col>
            <t-col :span="3">
              <div class="profile-stat highlight">
                <div class="stat-label">主要消费</div>
                <div class="stat-value">{{ insightData.profile.topCategory }}</div>
                <div class="stat-desc">{{ insightData.profile.topCategoryPercentage.toFixed(1) }}%</div>
              </div>
            </t-col>
          </t-row>
        </t-card>
      </div>

      <div class="merchants-section">
        <t-card title="最常光顾">
          <div class="merchants-list">
            <div v-for="(merchant, index) in insightData.merchants.slice(0, 5)" :key="merchant.name" class="merchant-item">
              <div class="merchant-rank">{{ index + 1 }}</div>
              <div class="merchant-info">
                <div class="merchant-name">{{ merchant.name }}</div>
                <div class="merchant-meta">{{ merchant.count }} 笔 · 平均 {{ formatAmount(merchant.avgAmount) }}</div>
              </div>
              <div class="merchant-amount">{{ formatAmount(merchant.totalAmount) }}</div>
            </div>
          </div>
        </t-card>
      </div>

      <div class="scenario-section">
        <t-card title="消费场景">
          <div class="scenario-tabs">
            <t-radio-group v-model="scenarioType" variant="default-filled" size="small">
              <t-radio-button value="channel">消费渠道</t-radio-button>
              <t-radio-button value="time">时段分布</t-radio-button>
              <t-radio-button value="amount">金额层级</t-radio-button>
            </t-radio-group>
          </div>
          <div ref="scenarioChartRef" class="chart-container"></div>
        </t-card>
      </div>

      <div class="habits-section">
        <t-card title="消费习惯">
          <t-row :gutter="16">
            <t-col :span="3">
              <div class="habit-item">
                <div class="habit-icon">
                  <calendar-icon/>
                </div>
                <div class="habit-content">
                  <div class="habit-label">日均支出</div>
                  <div class="habit-value">{{ formatAmount(insightData.habits.avgDailyExpense) }}</div>
                </div>
              </div>
            </t-col>
            <t-col :span="3">
              <div class="habit-item">
                <div class="habit-icon">
                  <time-icon/>
                </div>
                <div class="habit-content">
                  <div class="habit-label">月均支出</div>
                  <div class="habit-value">{{ formatAmount(insightData.habits.avgMonthlyExpense) }}</div>
                </div>
              </div>
            </t-col>
            <t-col :span="3">
              <div class="habit-item">
                <div class="habit-icon">
                  <time-icon/>
                </div>
                <div class="habit-content">
                  <div class="habit-label">高峰时段</div>
                  <div class="habit-value">{{ insightData.habits.peakSpendingHour }}:00</div>
                </div>
              </div>
            </t-col>
            <t-col :span="3">
              <div class="habit-item">
                <div class="habit-icon">
                  <chart-icon/>
                </div>
                <div class="habit-content">
                  <div class="habit-label">活跃日</div>
                  <div class="habit-value">{{ insightData.habits.peakSpendingDay }}</div>
                </div>
              </div>
            </t-col>
          </t-row>
        </t-card>
      </div>

      <div class="advanced-insights">
        <t-row :gutter="[16, 16]">
          <t-col :span="4">
            <t-card title="拿铁因子">
              <div class="insight-content">
                <div class="insight-big">{{ formatAmount(insightData.latteFactor.totalAmount) }}</div>
                <div class="insight-desc">小额消费总额</div>
                <div class="insight-meta">
                  {{ insightData.latteFactor.topMerchant }} · {{ insightData.latteFactor.transactionCount }} 笔
                </div>
              </div>
            </t-card>
          </t-col>
          <t-col :span="4">
            <t-card title="隐形订阅">
              <div class="insight-content">
                <div v-if="insightData.subscriptions.length > 0" class="subscriptions-list">
                  <div v-for="sub in insightData.subscriptions.slice(0, 3)" :key="sub.name" class="sub-item">
                    <div class="sub-name">{{ sub.name }}</div>
                    <div class="sub-amount">{{ formatAmount(sub.monthlyAmount) }}/月</div>
                  </div>
                </div>
                <div v-else class="empty-sub">
                  未发现明显订阅
                </div>
              </div>
            </t-card>
          </t-col>
          <t-col :span="4">
            <t-card title="消费通胀">
              <div class="insight-content">
                <div class="insight-big" :class="insightData.inflation.trend">
                  {{ insightData.inflation.trend === 'up' ? '↑' : insightData.inflation.trend === 'down' ? '↓' : '-' }}
                  {{ Math.abs(insightData.inflation.rate).toFixed(2) }}%
                </div>
                <div class="insight-desc">季度客单价变化</div>
                <div class="insight-meta">
                  {{ formatAmount(insightData.inflation.firstAvg) }} → {{ formatAmount(insightData.inflation.lastAvg) }}
                </div>
              </div>
            </t-card>
          </t-col>
          <t-col :span="6">
            <t-card title="品牌忠诚">
              <div class="insight-content">
                <div class="loyalty-row">
                  <div class="loyalty-item">
                    <div class="loyalty-label">真金白银</div>
                    <div class="loyalty-value">{{ insightData.brandLoyalty.topAmount.name }}</div>
                    <div class="loyalty-amount">{{ formatAmount(insightData.brandLoyalty.topAmount.value) }}</div>
                  </div>
                  <div class="loyalty-item">
                    <div class="loyalty-label">最为长情</div>
                    <div class="loyalty-value">{{ insightData.brandLoyalty.topCount.name }}</div>
                    <div class="loyalty-count">{{ insightData.brandLoyalty.topCount.value }} 次</div>
                  </div>
                </div>
              </div>
            </t-card>
          </t-col>
          <t-col :span="6">
            <t-card title="周末效应">
              <div class="insight-content">
                <div class="insight-big">{{ insightData.weekendEffect.ratio.toFixed(2) }}x</div>
                <div class="insight-desc">周末/周一消费比</div>
                <div class="insight-meta">{{ insightData.weekendEffect.type }}</div>
              </div>
            </t-card>
          </t-col>
        </t-row>
      </div>

      <div class="sankey-section">
        <t-card title="资金流向">
          <div ref="sankeyChartRef" class="chart-container sankey-chart"></div>
        </t-card>
      </div>

      <div class="advanced-viz-section">
        <h2 class="section-title">时间密码</h2>

        <t-row :gutter="[16,16]">
          <t-col :span="12">
            <t-card title="消费趋势河流">
              <div ref="themeRiverChartRef" class="chart-container"></div>
            </t-card>
          </t-col>
          <t-col :span="6">
            <t-card title="消费生物钟 (热力图)">
              <div ref="heatmapChartRef" class="chart-container"></div>
            </t-card>
          </t-col>
          <t-col :span="6">
            <t-card title="季度消费结构">
              <div ref="radarChartRef" class="chart-container"></div>
            </t-card>
          </t-col>
        </t-row>
      </div>

      <div class="advanced-viz-section">
        <h2 class="section-title">决策心理</h2>

        <t-row :gutter="[16, 16]">
          <t-col :span="12">
            <t-card title="消费象限 (频次 vs 均价)">
              <div ref="quadrantChartRef" class="chart-container quadrant-chart"></div>
            </t-card>
          </t-col>
          <t-col :span="6">
            <t-card title="消费关联和弦">
              <div ref="chordChartRef" class="chart-container"></div>
            </t-card>
          </t-col>
          <t-col :span="6">
            <t-card title="消费金额漏斗">
              <div ref="funnelChartRef" class="chart-container"></div>
            </t-card>
          </t-col>
        </t-row>
      </div>

      <div class="advanced-viz-section">
        <h2 class="section-title">结构解析</h2>

        <t-row :gutter="[16, 16]">
          <t-col :span="12">
            <t-card title="核心支出来源 (帕累托图)">
              <div ref="paretoChartRef" class="chart-container"></div>
            </t-card>
          </t-col>
          <t-col :span="6">
            <t-card title="消费热词云">
              <div ref="wordCloudChartRef" class="chart-container"></div>
            </t-card>
          </t-col>
          <t-col :span="6">
            <t-card title="消费分布云图">
              <div ref="boxPlotChartRef" class="chart-container"></div>
            </t-card>
          </t-col>
        </t-row>
      </div>
    </div>
    <div v-else class="empty-state">
      <div class="empty-icon">
        <lightbulb-icon/>
      </div>
      <div class="empty-text">暂无洞察数据</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {LightbulbIcon, CalendarIcon, TimeIcon, ChartIcon} from "tdesign-icons-vue-next";
import {getInsights} from "@/pages/app/bookkeeping/func/InsightService.ts";
import type {InsightData} from "@/pages/app/bookkeeping/func/InsightService.ts";
import * as echarts from 'echarts';
import 'echarts-wordcloud';

const props = defineProps<{
  sessionId: string
}>();

const loading = ref(true);
const insightData = ref<InsightData | null>(null);
const scenarioType = ref<'channel' | 'time' | 'amount'>('channel');

const scenarioChartRef = ref<HTMLElement | null>(null);
const sankeyChartRef = ref<HTMLElement | null>(null);
const themeRiverChartRef = ref<HTMLElement | null>(null);
const heatmapChartRef = ref<HTMLElement | null>(null);
const radarChartRef = ref<HTMLElement | null>(null);
const quadrantChartRef = ref<HTMLElement | null>(null);
const chordChartRef = ref<HTMLElement | null>(null);
const funnelChartRef = ref<HTMLElement | null>(null);
const paretoChartRef = ref<HTMLElement | null>(null);
const wordCloudChartRef = ref<HTMLElement | null>(null);
const boxPlotChartRef = ref<HTMLElement | null>(null);

let scenarioChart: echarts.ECharts | null = null;
let sankeyChart: echarts.ECharts | null = null;
let themeRiverChart: echarts.ECharts | null = null;
let heatmapChart: echarts.ECharts | null = null;
let radarChart: echarts.ECharts | null = null;
let quadrantChart: echarts.ECharts | null = null;
let chordChart: echarts.ECharts | null = null;
let funnelChart: echarts.ECharts | null = null;
let paretoChart: echarts.ECharts | null = null;
let wordCloudChart: echarts.ECharts | null = null;
let boxPlotChart: echarts.ECharts | null = null;

watch(scenarioType, () => {
  nextTick(() => {
    updateScenarioChart();
  });
});

onMounted(async () => {
  await loadInsights();
  await nextTick();
  setTimeout(() => {
    initCharts();
  }, 100);
});

onUnmounted(() => {
  if (scenarioChart) {
    scenarioChart.dispose();
    scenarioChart = null;
  }
  if (sankeyChart) {
    sankeyChart.dispose();
    sankeyChart = null;
  }
  if (themeRiverChart) {
    themeRiverChart.dispose();
    themeRiverChart = null;
  }
  if (heatmapChart) {
    heatmapChart.dispose();
    heatmapChart = null;
  }
  if (radarChart) {
    radarChart.dispose();
    radarChart = null;
  }
  if (quadrantChart) {
    quadrantChart.dispose();
    quadrantChart = null;
  }
  if (chordChart) {
    chordChart.dispose();
    chordChart = null;
  }
  if (funnelChart) {
    funnelChart.dispose();
    funnelChart = null;
  }
  if (paretoChart) {
    paretoChart.dispose();
    paretoChart = null;
  }
  if (wordCloudChart) {
    wordCloudChart.dispose();
    wordCloudChart = null;
  }
  if (boxPlotChart) {
    boxPlotChart.dispose();
    boxPlotChart = null;
  }
});

const loadInsights = async () => {
  loading.value = true;
  try {
    insightData.value = await getInsights(props.sessionId);
  } finally {
    loading.value = false;
  }
};

const formatAmount = (amount: number) => {
  return `¥${amount.toFixed(2)}`;
};

const initCharts = () => {
  if (!insightData.value) return;

  initScenarioChart();
  initSankeyChart();
  initThemeRiverChart();
  initHeatmapChart();
  initRadarChart();
  initQuadrantChart();
  initChordChart();
  initFunnelChart();
  initParetoChart();
  initWordCloudChart();
  initBoxPlotChart();
};

const initScenarioChart = () => {
  if (!scenarioChartRef.value || !insightData.value) return;

  if (scenarioChart) {
    scenarioChart.dispose();
  }

  scenarioChart = echarts.init(scenarioChartRef.value);
  updateScenarioChart();

  window.addEventListener('resize', () => {
    scenarioChart?.resize();
  });
};

const updateScenarioChart = () => {
  if (!scenarioChart || !insightData.value) return;

  let data: any[] = [];
  let yAxisName = '';

  if (scenarioType.value === 'channel') {
    data = insightData.value.scenario.channel.map(item => ({
      name: item.name,
      value: item.value
    }));
    yAxisName = '金额';
  } else if (scenarioType.value === 'time') {
    data = insightData.value.scenario.timeDistribution.map(item => ({
      name: item.period,
      value: item.amount
    }));
    yAxisName = '金额';
  } else if (scenarioType.value === 'amount') {
    data = insightData.value.scenario.amountDistribution.map(item => ({
      name: item.range,
      value: item.amount
    }));
    yAxisName = '金额';
  }

  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const param = params[0];
        return `${param.name}<br/>${yAxisName}: ¥${param.value.toFixed(2)}`;
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
      data: data.map(d => d.name),
      axisLabel: {
        interval: 0,
        rotate: scenarioType.value === 'channel' ? 45 : 0
      }
    },
    yAxis: {
      type: 'value',
      name: yAxisName,
      axisLabel: {
        formatter: (value: number) => `¥${value.toFixed(0)}`
      }
    },
    series: [
      {
        name: yAxisName,
        type: 'bar',
        data: data.map(d => d.value),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#83bff6' },
            { offset: 0.5, color: '#188df0' },
            { offset: 1, color: '#188df0' }
          ])
        },
        barWidth: '60%'
      }
    ]
  };

  scenarioChart.setOption(option);
};

const initSankeyChart = () => {
  if (!sankeyChartRef.value || !insightData.value) return;

  if (sankeyChart) {
    sankeyChart.dispose();
  }

  sankeyChart = echarts.init(sankeyChartRef.value);
  updateSankeyChart();

  window.addEventListener('resize', () => {
    sankeyChart?.resize();
  });
};

const updateSankeyChart = () => {
  if (!sankeyChart || !insightData.value) return;

  const { nodes, links } = insightData.value.sankeyData;

  if (nodes.length === 0 || links.length === 0) {
    return;
  }

  const option = {
    tooltip: {
      trigger: 'item',
      triggerOn: 'mousemove',
      formatter: (params: any) => {
        if (params.dataType === 'edge') {
          return `${params.data.source} → ${params.data.target}<br/>¥${params.data.value.toFixed(2)}`;
        } else {
          return `${params.name}<br/>¥${params.value.toFixed(2)}`;
        }
      }
    },
    series: [
      {
        type: 'sankey',
        layout: 'none',
        emphasis: {
          focus: 'adjacency'
        },
        data: nodes.map(node => ({ name: node.name })),
        links: links.map(link => ({
          source: link.source,
          target: link.target,
          value: link.value
        })),
        top: '10%',
        bottom: '10%',
        left: '10%',
        right: '20%',
        nodeWidth: 20,
        nodeGap: 8,
        label: {
          color: '#333'
        },
        lineStyle: {
          color: 'source',
          curveness: 0.5
        },
        itemStyle: {
          color: '#1f77b4',
          borderColor: '#1f77b4'
        }
      }
    ]
  };

  sankeyChart.setOption(option);
};

const initThemeRiverChart = () => {
  if (!themeRiverChartRef.value || !insightData.value) return;

  if (themeRiverChart) {
    themeRiverChart.dispose();
  }

  themeRiverChart = echarts.init(themeRiverChartRef.value);
  updateThemeRiverChart();

  window.addEventListener('resize', () => {
    themeRiverChart?.resize();
  });
};

const updateThemeRiverChart = () => {
  if (!themeRiverChart || !insightData.value) return;

  const { dates, series } = insightData.value.themeRiverData;

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      }
    },
    legend: {
      data: series.map(s => s.name),
      top: 10
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: {
        interval: 0,
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (value: number) => `¥${value.toFixed(0)}`
      }
    },
    series: series.map(s => ({
      name: s.name,
      type: 'line',
      stack: 'total',
      areaStyle: {
        opacity: 0.8
      },
      emphasis: {
        focus: 'series'
      },
      data: s.data,
      smooth: true
    }))
  };

  themeRiverChart.setOption(option);
};

const initHeatmapChart = () => {
  if (!heatmapChartRef.value || !insightData.value) return;

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
  if (!heatmapChart || !insightData.value) return;

  const { hours, days, data } = insightData.value.heatmapData;

  const option = {
    tooltip: {
      position: 'top',
      formatter: (params: any) => {
        const day = params.data[0];
        const hour = params.data[1];
        const amount = params.data[2];
        return `${days[day]} ${hour}:00<br/>¥${amount.toFixed(2)}`;
      }
    },
    grid: {
      height: '70%',
      top: '10%'
    },
    xAxis: {
      type: 'category',
      data: hours,
      splitArea: {
        show: true
      },
      axisLabel: {
        formatter: (value: number) => `${value}:00`
      }
    },
    yAxis: {
      type: 'category',
      data: days,
      splitArea: {
        show: true
      }
    },
    visualMap: {
      min: 0,
      max: Math.max(...data.flat()),
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '0%',
      inRange: {
        color: ['#50a3ba', '#eac736', '#d94e5d']
      }
    },
    series: [{
      name: '消费金额',
      type: 'heatmap',
      data: data.flatMap((row, day) =>
        row.map((amount, hour) => [day, hour, amount])
      ),
      label: {
        show: false
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  };

  heatmapChart.setOption(option);
};

const initRadarChart = () => {
  if (!radarChartRef.value || !insightData.value) return;

  if (radarChart) {
    radarChart.dispose();
  }

  radarChart = echarts.init(radarChartRef.value);
  updateRadarChart();

  window.addEventListener('resize', () => {
    radarChart?.resize();
  });
};

const updateRadarChart = () => {
  if (!radarChart || !insightData.value) return;

  const { indicators, series } = insightData.value.radarData;

  const option = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      data: series.map(s => s.name)
    },
    radar: {
      indicator: indicators
    },
    series: series.map(s => ({
      name: s.name,
      type: 'radar',
      data: [{
        value: s.value,
        name: s.name
      }],
      areaStyle: {
        color: 'rgba(24, 144, 255, 0.3)'
      },
      lineStyle: {
        color: '#1890ff'
      }
    }))
  };

  radarChart.setOption(option);
};

const initQuadrantChart = () => {
  if (!quadrantChartRef.value || !insightData.value) return;

  if (quadrantChart) {
    quadrantChart.dispose();
  }

  quadrantChart = echarts.init(quadrantChartRef.value);
  updateQuadrantChart();

  window.addEventListener('resize', () => {
    quadrantChart?.resize();
  });
};

const updateQuadrantChart = () => {
  if (!quadrantChart || !insightData.value) return;

  const { items } = insightData.value.quadrantData;

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        return `${params.data.name}<br/>频次: ${params.data.count}<br/>均价: ¥${params.data.avgAmount.toFixed(2)}<br/>总额: ¥${params.data.totalAmount.toFixed(2)}`;
      }
    },
    grid: {
      left: '10%',
      right: '10%',
      top: '10%',
      bottom: '15%'
    },
    xAxis: {
      type: 'value',
      name: '频次',
      nameLocation: 'middle',
      nameGap: 30,
      splitLine: {
        lineStyle: {
          type: 'dashed'
        }
      }
    },
    yAxis: {
      type: 'value',
      name: '均价',
      nameLocation: 'middle',
      nameGap: 50,
      splitLine: {
        lineStyle: {
          type: 'dashed'
        }
      }
    },
    series: [{
      type: 'scatter',
      data: items.map(item => ({
        name: item.name,
        value: [item.count, item.avgAmount],
        totalAmount: item.totalAmount
      })),
      symbolSize: (data: any) => Math.sqrt(data[2]) * 2,
      itemStyle: {
        color: '#1890ff',
        opacity: 0.7
      },
      label: {
        show: true,
        position: 'top',
        formatter: (params: any) => params.data.name,
        fontSize: 10
      }
    }]
  };

  quadrantChart.setOption(option);
};

const initChordChart = () => {
  if (!chordChartRef.value || !insightData.value) return;

  if (chordChart) {
    chordChart.dispose();
  }

  chordChart = echarts.init(chordChartRef.value);
  updateChordChart();

  window.addEventListener('resize', () => {
    chordChart?.resize();
  });
};

const updateChordChart = () => {
  if (!chordChart || !insightData.value) return;

  const { nodes, links } = insightData.value.chordData;

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        if (params.dataType === 'edge') {
          const source = nodes[params.data.source];
          const target = nodes[params.data.target];
          return `${source} → ${target}<br/>¥${params.data.value.toFixed(2)}`;
        } else {
          return params.name;
        }
      }
    },
    series: [{
      type: 'chord',
      data: nodes.map((name, i) => ({ name, id: i })),
      links: links.map(link => ({
        source: link.source,
        target: link.target,
        value: link.value
      })),
      radius: '65%',
      center: ['50%', '50%'],
      itemStyle: {
        color: '#1890ff',
        borderColor: '#1890ff',
        borderWidth: 1
      },
      lineStyle: {
        color: 'source',
        curveness: 0.3
      }
    }]
  };

  chordChart.setOption(option);
};

const initFunnelChart = () => {
  if (!funnelChartRef.value || !insightData.value) return;

  if (funnelChart) {
    funnelChart.dispose();
  }

  funnelChart = echarts.init(funnelChartRef.value);
  updateFunnelChart();

  window.addEventListener('resize', () => {
    funnelChart?.resize();
  });
};

const updateFunnelChart = () => {
  if (!funnelChart || !insightData.value) return;

  const { data } = insightData.value.funnelData;

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        return `${params.data.name}<br/>${params.data.value} 笔`;
      }
    },
    series: [{
      name: '交易数量',
      type: 'funnel',
      left: '10%',
      top: 60,
      bottom: 60,
      width: '80%',
      min: 0,
      max: Math.max(...data.map(d => d.value)),
      minSize: '0%',
      maxSize: '100%',
      sort: 'descending',
      gap: 2,
      label: {
        show: true,
        position: 'inside'
      },
      labelLine: {
        length: 10,
        lineStyle: {
          width: 1,
          type: 'solid'
        }
      },
      itemStyle: {
        borderColor: '#fff',
        borderWidth: 1
      },
      emphasis: {
        label: {
          fontSize: 20
        }
      },
      data
    }]
  };

  funnelChart.setOption(option);
};

const initParetoChart = () => {
  if (!paretoChartRef.value || !insightData.value) return;

  if (paretoChart) {
    paretoChart.dispose();
  }

  paretoChart = echarts.init(paretoChartRef.value);
  updateParetoChart();

  window.addEventListener('resize', () => {
    paretoChart?.resize();
  });
};

const updateParetoChart = () => {
  if (!paretoChart || !insightData.value) return;

  const { categories, amounts, cumulative } = insightData.value.paretoData;

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    legend: {
      data: ['支出金额', '累计占比']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: categories,
      axisLabel: {
        interval: 0,
        rotate: 45
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
        max: 100,
        axisLabel: {
          formatter: (value: number) => `${value.toFixed(0)}%`
        }
      }
    ],
    series: [
      {
        name: '支出金额',
        type: 'bar',
        data: amounts,
        itemStyle: {
          color: '#1890ff'
        }
      },
      {
        name: '累计占比',
        type: 'line',
        yAxisIndex: 1,
        data: cumulative,
        itemStyle: {
          color: '#ff4d4f'
        },
        markLine: {
          data: [
            {
              yAxis: 80,
              label: {
                formatter: '80% 线'
              },
              lineStyle: {
                color: '#ff4d4f',
                type: 'dashed'
              }
            }
          ]
        }
      }
    ]
  };

  paretoChart.setOption(option);
};

const initWordCloudChart = () => {
  if (!wordCloudChartRef.value || !insightData.value) return;

  if (wordCloudChart) {
    wordCloudChart.dispose();
  }

  wordCloudChart = echarts.init(wordCloudChartRef.value);
  updateWordCloudChart();

  window.addEventListener('resize', () => {
    wordCloudChart?.resize();
  });
};

const updateWordCloudChart = () => {
  if (!wordCloudChart || !insightData.value) return;

  const data = insightData.value.wordCloudData;

  const option = {
    tooltip: {
      show: true
    },
    series: [{
      type: 'wordCloud',
      shape: 'circle',
      left: 'center',
      top: 'center',
      width: '90%',
      height: '80%',
      right: null,
      bottom: null,
      sizeRange: [12, 60],
      rotationRange: [-90, 90],
      rotationStep: 45,
      gridSize: 8,
      drawOutOfBound: false,
      textStyle: {
        fontFamily: 'sans-serif',
        fontWeight: 'bold',
        color: () => {
          const colors = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4'];
          return colors[Math.floor(Math.random() * colors.length)];
        }
      },
      emphasis: {
        focus: 'self',
        textStyle: {
          shadowBlur: 10,
          shadowColor: '#333'
        }
      },
      data
    }]
  };

  wordCloudChart.setOption(option);
};

const initBoxPlotChart = () => {
  if (!boxPlotChartRef.value || !insightData.value) return;

  if (boxPlotChart) {
    boxPlotChart.dispose();
  }

  boxPlotChart = echarts.init(boxPlotChartRef.value);
  updateBoxPlotChart();

  window.addEventListener('resize', () => {
    boxPlotChart?.resize();
  });
};

const updateBoxPlotChart = () => {
  if (!boxPlotChart || !insightData.value) return;

  const { categories, data } = insightData.value.boxPlotData;

  const option = {
    tooltip: {
      trigger: 'item',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '10%',
      right: '10%',
      bottom: '15%'
    },
    xAxis: {
      type: 'category',
      data: categories,
      boundaryGap: true,
      nameGap: 30,
      splitArea: {
        show: true
      },
      axisLabel: {
        interval: 0,
        rotate: 30
      },
      splitLine: {
        show: false
      }
    },
    yAxis: {
      type: 'value',
      name: '金额',
      splitArea: {
        show: true
      },
      axisLabel: {
        formatter: (value: number) => `¥${value.toFixed(0)}`
      }
    },
    series: [{
      name: '消费金额',
      type: 'boxplot',
      data: data,
      tooltip: {
        formatter: (params: any) => {
          const values = params.data;
          return [
            `最大值: ¥${values[5].toFixed(2)}`,
            `上四分位: ¥${values[4].toFixed(2)}`,
            `中位数: ¥${values[3].toFixed(2)}`,
            `下四分位: ¥${values[2].toFixed(2)}`,
            `最小值: ¥${values[1].toFixed(2)}`
          ].join('<br/>');
        }
      },
      itemStyle: {
        borderColor: '#1890ff',
        borderWidth: 1
      }
    }]
  };

  boxPlotChart.setOption(option);
};
</script>

<style scoped lang="less">
.insight-tab {
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

.insight-container {
  display: flex;
  flex-direction: column;
  gap: var(--td-comp-margin-m);
}

.tags-section {
  padding: var(--td-comp-paddingTB-s) var(--td-comp-paddingLR-m);
  background: linear-gradient(135deg, var(--td-brand-color-1) 0%, var(--td-brand-color-2) 100%);
  border-radius: var(--td-radius-medium);
  border: 1px solid var(--td-brand-color-3);
}

.tags-title {
  font-size: var(--td-font-size-body-medium);
  font-weight: 600;
  color: var(--td-text-color-primary);
  margin-bottom: var(--td-comp-margin-s);
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--td-comp-margin-s);
}

.profile-section {
  .profile-stat {
    text-align: center;
    padding: var(--td-comp-paddingTB-m) var(--td-comp-paddingLR-s);
    background: var(--td-bg-color-container-hover);
    border-radius: var(--td-radius-medium);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    &.highlight {
      background: linear-gradient(135deg, var(--td-brand-color-1) 0%, var(--td-brand-color-2) 100%);
      color: var(--td-text-color-white);

      .stat-label {
        color: var(--td-text-color-white);
      }

      .stat-value {
        color: var(--td-text-color-white);
      }
    }
  }

  .stat-label {
    font-size: var(--td-font-size-body-small);
    color: var(--td-text-color-secondary);
    margin-bottom: var(--td-comp-margin-xs);
  }

  .stat-value {
    font-size: 20px;
    font-weight: 700;
    color: var(--td-text-color-primary);
    margin-bottom: var(--td-comp-margin-xs);

    &.expense {
      color: var(--td-error-color);
    }
  }

  .stat-desc {
    font-size: var(--td-font-size-body-small);
    color: var(--td-text-color-placeholder);
  }
}

.merchants-section {
  .merchants-list {
    display: flex;
    flex-direction: column;
    gap: var(--td-comp-margin-s);
  }

  .merchant-item {
    display: flex;
    align-items: center;
    gap: var(--td-comp-margin-m);
    padding: var(--td-comp-paddingTB-s) var(--td-comp-paddingLR-m);
    background: var(--td-bg-color-container-hover);
    border-radius: var(--td-radius-small);
    transition: all 0.3s ease;

    &:hover {
      background: var(--td-bg-color-container);
      transform: translateX(4px);
    }
  }

  .merchant-rank {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: linear-gradient(135deg, var(--td-brand-color) 0%, var(--td-brand-color-light) 100%);
    color: var(--td-text-color-white);
    border-radius: 50%;
    font-weight: 700;
    font-size: var(--td-font-size-body-medium);
  }

  .merchant-info {
    flex: 1;
    min-width: 0;
  }

  .merchant-name {
    font-size: var(--td-font-size-body-medium);
    font-weight: 600;
    color: var(--td-text-color-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .merchant-meta {
    font-size: var(--td-font-size-body-small);
    color: var(--td-text-color-placeholder);
    margin-top: 2px;
  }

  .merchant-amount {
    font-size: var(--td-font-size-body-large);
    font-weight: 700;
    color: var(--td-error-color);
  }
}

.scenario-section {
  .scenario-tabs {
    margin-bottom: var(--td-comp-margin-m);
  }

  .chart-container {
    height: 300px;
  }
}

.habits-section {
  .habit-item {
    display: flex;
    align-items: center;
    gap: var(--td-comp-margin-m);
    padding: var(--td-comp-paddingTB-m) var(--td-comp-paddingLR-m);
    background: linear-gradient(135deg, var(--td-bg-color-container-hover) 0%, var(--td-bg-color-container) 100%);
    border-radius: var(--td-radius-medium);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  }

  .habit-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, var(--td-success-color) 0%, var(--td-success-color-light) 100%);
    color: var(--td-text-color-white);
    border-radius: var(--td-radius-medium);
    font-size: 24px;
  }

  .habit-content {
    flex: 1;
  }

  .habit-label {
    font-size: var(--td-font-size-body-small);
    color: var(--td-text-color-secondary);
    margin-bottom: var(--td-comp-margin-xs);
  }

  .habit-value {
    font-size: 18px;
    font-weight: 700;
    color: var(--td-text-color-primary);
  }
}

.advanced-insights {
  .insight-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--td-comp-margin-s);
  }

  .insight-big {
    font-size: 28px;
    font-weight: 700;
    color: var(--td-text-color-primary);

    &.up {
      color: var(--td-error-color);
    }

    &.down {
      color: var(--td-success-color);
    }
  }

  .insight-desc {
    font-size: var(--td-font-size-body-small);
    color: var(--td-text-color-secondary);
  }

  .insight-meta {
    font-size: var(--td-font-size-body-small);
    color: var(--td-text-color-placeholder);
  }

  .subscriptions-list {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: var(--td-comp-margin-s);
  }

  .sub-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--td-comp-paddingTB-s) var(--td-comp-paddingLR-m);
    background: var(--td-bg-color-container-hover);
    border-radius: var(--td-radius-small);
  }

  .sub-name {
    font-size: var(--td-font-size-body-medium);
    font-weight: 600;
    color: var(--td-text-color-primary);
  }

  .sub-amount {
    font-size: var(--td-font-size-body-medium);
    color: var(--td-error-color);
  }

  .empty-sub {
    font-size: var(--td-font-size-body-medium);
    color: var(--td-text-color-placeholder);
  }

  .loyalty-row {
    display: flex;
    flex-direction: column;
    gap: var(--td-comp-margin-m);
    width: 100%;
  }

  .loyalty-item {
    padding: var(--td-comp-paddingTB-s) var(--td-comp-paddingLR-m);
    background: var(--td-bg-color-container-hover);
    border-radius: var(--td-radius-small);
  }

  .loyalty-label {
    font-size: var(--td-font-size-body-small);
    color: var(--td-text-color-secondary);
    margin-bottom: var(--td-comp-margin-xs);
  }

  .loyalty-value {
    font-size: var(--td-font-size-body-medium);
    font-weight: 600;
    color: var(--td-text-color-primary);
    margin-bottom: var(--td-comp-margin-xs);
  }

  .loyalty-amount,
  .loyalty-count {
    font-size: var(--td-font-size-body-small);
    color: var(--td-error-color);
  }
}

.sankey-section {
  .sankey-chart {
    height: 400px;
  }
}

.advanced-viz-section {
  margin-top: var(--td-comp-margin-l);

  .section-title {
    font-size: 20px;
    font-weight: 600;
    color: var(--td-text-color-primary);
    margin-bottom: var(--td-comp-margin-m);
    padding-bottom: var(--td-comp-margin-s);
    border-bottom: 2px solid var(--td-component-border);
  }

  .chart-container {
    height: 350px;
  }

  .quadrant-chart {
    height: 500px;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: var(--td-comp-margin-m);
  color: var(--td-text-color-placeholder);
}

.empty-icon {
  font-size: 64px;
  opacity: 0.3;
}

.empty-text {
  font-size: var(--td-font-size-body-medium);
}

@media (max-width: 768px) {
}
</style>
