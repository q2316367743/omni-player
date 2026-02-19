import {useMpSql} from "@/lib/sql.ts";
import type {AnalysisTransaction} from "@/entity/analysis/AnalysisTransaction.ts";

export interface InsightData {
  profile: ProfileInsight;
  merchants: MerchantInsight[];
  scenario: ScenarioInsight;
  habits: HabitInsight;
  latteFactor: LatteFactorInsight;
  subscriptions: SubscriptionInsight[];
  inflation: InflationInsight;
  brandLoyalty: BrandLoyaltyInsight;
  weekendEffect: WeekendEffectInsight;
  sankeyData: SankeyData;
  tags: string[];
  themeRiverData: ThemeRiverData;
  heatmapData: HeatmapData;
  radarData: RadarData;
  quadrantData: QuadrantData;
  chordData: ChordData;
  funnelData: FunnelData;
  paretoData: ParetoData;
  wordCloudData: WordCloudData[];
  boxPlotData: BoxPlotData;
}

export interface ProfileInsight {
  totalExpense: number;
  totalIncome: number;
  totalTransactions: number;
  avgTransactionAmount: number;
  topCategory: string;
  topCategoryAmount: number;
  topCategoryPercentage: number;
  mostFrequentMerchant: string;
  mostFrequentMerchantCount: number;
  spendingTime: string;
  spendingPreference: string;
  spendingPattern: string;
  spendingAbility: string;
}

export interface MerchantInsight {
  name: string;
  count: number;
  totalAmount: number;
  avgAmount: number;
}

export interface ScenarioInsight {
  channel: ChannelData[];
  timeDistribution: TimeDistributionData[];
  amountDistribution: AmountDistributionData[];
}

export interface ChannelData {
  name: string;
  value: number;
}

export interface TimeDistributionData {
  period: string;
  count: number;
  amount: number;
}

export interface AmountDistributionData {
  range: string;
  count: number;
  amount: number;
}

export interface HabitInsight {
  avgDailyExpense: number;
  avgMonthlyExpense: number;
  peakSpendingHour: number;
  peakSpendingDay: string;
  mostActiveMonth: string;
  weekendRatio: number;
  fixedExpenseRatio: number;
  earlyMonthRatio: number;
  lateNightSpending: number;
  engelCoefficient: number;
}

export interface LatteFactorInsight {
  totalAmount: number;
  topMerchant: string;
  transactionCount: number;
  avgAmount: number;
}

export interface SubscriptionInsight {
  name: string;
  monthlyAmount: number;
  annualAmount: number;
  frequency: number;
}

export interface InflationInsight {
  rate: number;
  trend: 'up' | 'down' | 'stable';
  firstAvg: number;
  lastAvg: number;
}

export interface BrandLoyaltyInsight {
  topAmount: { name: string; value: number };
  topCount: { name: string; value: number };
}

export interface WeekendEffectInsight {
  ratio: number;
  weekendAvg: number;
  weekdayAvg: number;
  type: string;
}

export interface SankeyNode {
  name: string;
  level: number;
}

export interface SankeyLink {
  source: string;
  target: string;
  value: number;
}

export interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

export interface ThemeRiverData {
  dates: string[];
  series: { name: string; data: number[] }[];
}

export interface HeatmapData {
  hours: number[];
  days: string[];
  data: number[][];
}

export interface RadarData {
  indicators: { name: string; max: number }[];
  series: { name: string; value: number[] }[];
}

export interface QuadrantData {
  items: { name: string; count: number; avgAmount: number; totalAmount: number }[];
}

export interface ChordData {
  nodes: string[];
  links: { source: number; target: number; value: number }[];
}

export interface FunnelData {
  data: { name: string; value: number }[];
}

export interface ParetoData {
  categories: string[];
  amounts: number[];
  cumulative: number[];
}

export interface WordCloudData {
  name: string;
  value: number;
}

export interface BoxPlotData {
  categories: string[];
  data: number[][];
}

export async function getInsights(sessionId: string): Promise<InsightData> {
  const sql = useMpSql();
  const query = sql.query<AnalysisTransaction>('analysis_transaction');
  const transactions = await query.eq('session_id', sessionId).list();

  if (transactions.length === 0) {
    return getEmptyInsights();
  }

  const expenseTransactions = transactions.filter(t => t.type === 'expense');
  const incomeTransactions = transactions.filter(t => t.type === 'income');

  return {
    profile: analyzeProfile(expenseTransactions, incomeTransactions),
    merchants: analyzeMerchants(expenseTransactions),
    scenario: analyzeScenario(expenseTransactions),
    habits: analyzeHabits(expenseTransactions),
    latteFactor: analyzeLatteFactor(expenseTransactions),
    subscriptions: analyzeSubscriptions(expenseTransactions),
    inflation: analyzeInflation(expenseTransactions),
    brandLoyalty: analyzeBrandLoyalty(expenseTransactions),
    weekendEffect: analyzeWeekendEffect(expenseTransactions),
    sankeyData: analyzeSankey(expenseTransactions),
    tags: generateSmartTags(expenseTransactions, incomeTransactions),
    themeRiverData: analyzeThemeRiver(expenseTransactions),
    heatmapData: analyzeHeatmap(expenseTransactions),
    radarData: analyzeRadar(expenseTransactions),
    quadrantData: analyzeQuadrant(expenseTransactions),
    chordData: analyzeChord(expenseTransactions),
    funnelData: analyzeFunnel(expenseTransactions),
    paretoData: analyzePareto(expenseTransactions),
    wordCloudData: analyzeWordCloud(expenseTransactions),
    boxPlotData: analyzeBoxPlot(expenseTransactions)
  };
}

function getEmptyInsights(): InsightData {
  return {
    profile: {
      totalExpense: 0,
      totalIncome: 0,
      totalTransactions: 0,
      avgTransactionAmount: 0,
      topCategory: '-',
      topCategoryAmount: 0,
      topCategoryPercentage: 0,
      mostFrequentMerchant: '-',
      mostFrequentMerchantCount: 0,
      spendingTime: '-',
      spendingPreference: '-',
      spendingPattern: '-',
      spendingAbility: '-'
    },
    merchants: [],
    scenario: {
      channel: [],
      timeDistribution: [],
      amountDistribution: []
    },
    habits: {
      avgDailyExpense: 0,
      avgMonthlyExpense: 0,
      peakSpendingHour: 0,
      peakSpendingDay: '-',
      mostActiveMonth: '-',
      weekendRatio: 0,
      fixedExpenseRatio: 0,
      earlyMonthRatio: 0,
      lateNightSpending: 0,
      engelCoefficient: 0
    },
    latteFactor: {
      totalAmount: 0,
      topMerchant: '-',
      transactionCount: 0,
      avgAmount: 0
    },
    subscriptions: [],
    inflation: {
      rate: 0,
      trend: 'stable',
      firstAvg: 0,
      lastAvg: 0
    },
    brandLoyalty: {
      topAmount: { name: '-', value: 0 },
      topCount: { name: '-', value: 0 }
    },
    weekendEffect: {
      ratio: 0,
      weekendAvg: 0,
      weekdayAvg: 0,
      type: '-'
    },
    sankeyData: {
      nodes: [],
      links: []
    },
    tags: [],
    themeRiverData: {
      dates: [],
      series: []
    },
    heatmapData: {
      hours: [],
      days: [],
      data: []
    },
    radarData: {
      indicators: [],
      series: []
    },
    quadrantData: {
      items: []
    },
    chordData: {
      nodes: [],
      links: []
    },
    funnelData: {
      data: []
    },
    paretoData: {
      categories: [],
      amounts: [],
      cumulative: []
    },
    wordCloudData: [],
    boxPlotData: {
      categories: [],
      data: []
    }
  };
}

function analyzeProfile(expenseTransactions: AnalysisTransaction[], incomeTransactions: AnalysisTransaction[]): ProfileInsight {
  const totalExpense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalTransactions = expenseTransactions.length;
  const avgTransactionAmount = totalTransactions > 0 ? totalExpense / totalTransactions : 0;

  const categoryMap = new Map<string, number>();
  for (const tx of expenseTransactions) {
    const cat = tx.category || '未分类';
    categoryMap.set(cat, (categoryMap.get(cat) || 0) + tx.amount);
  }

  let topCategory = '-';
  let topCategoryAmount = 0;
  for (const [cat, amount] of categoryMap) {
    if (amount > topCategoryAmount) {
      topCategory = cat;
      topCategoryAmount = amount;
    }
  }

  const merchantMap = new Map<string, number>();
  for (const tx of expenseTransactions) {
    const merchant = tx.counterparty || '未知商家';
    merchantMap.set(merchant, (merchantMap.get(merchant) || 0) + 1);
  }

  let mostFrequentMerchant = '-';
  let mostFrequentMerchantCount = 0;
  for (const [merchant, count] of merchantMap) {
    if (count > mostFrequentMerchantCount) {
      mostFrequentMerchant = merchant;
      mostFrequentMerchantCount = count;
    }
  }

  const spendingTime = analyzeSpendingTime(expenseTransactions);
  const spendingPreference = `${topCategory}(${topCategoryAmount > 0 && totalExpense > 0 ? (topCategoryAmount / totalExpense * 100).toFixed(1) : '0.0'}%)`;
  const spendingPattern = analyzeSpendingPattern(expenseTransactions);
  const spendingAbility = analyzeSpendingAbility(expenseTransactions);

  return {
    totalExpense,
    totalIncome,
    totalTransactions,
    avgTransactionAmount,
    topCategory,
    topCategoryAmount,
    topCategoryPercentage: totalExpense > 0 ? (topCategoryAmount / totalExpense) * 100 : 0,
    mostFrequentMerchant,
    mostFrequentMerchantCount,
    spendingTime,
    spendingPreference,
    spendingPattern,
    spendingAbility
  };
}

function analyzeSpendingTime(transactions: AnalysisTransaction[]): string {
  if (transactions.length === 0) return '-';

  const hourMap = new Map<number, number>();
  for (const tx of transactions) {
    const date = new Date(tx.date);
    const hour = date.getHours();
    hourMap.set(hour, (hourMap.get(hour) || 0) + 1);
  }

  let dayCount = 0;
  let nightCount = 0;
  for (const [hour, count] of hourMap) {
    if (hour >= 6 && hour < 18) {
      dayCount += count;
    } else {
      nightCount += count;
    }
  }

  const total = dayCount + nightCount;
  if (total === 0) return '-';

  const dayRatio = dayCount / total;
  if (dayRatio > 0.7) {
    return '您的消费时间比较规律，集中在日间';
  } else if (dayRatio < 0.3) {
    return '您的消费时间比较规律，集中在夜间';
  } else {
    return '您的消费时间比较分散';
  }
}

function analyzeSpendingPattern(transactions: AnalysisTransaction[]): string {
  if (transactions.length === 0) return '-';

  const dateMap = new Map<string, number>();
  for (const tx of transactions) {
    const date = new Date(tx.date);
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    dateMap.set(dateKey, (dateMap.get(dateKey) || 0) + 1);
  }

  const counts = Array.from(dateMap.values());
  if (counts.length === 0) return '-';

  const avgCount = counts.reduce((sum, c) => sum + c, 0) / counts.length;
  const variance = counts.reduce((sum, c) => sum + Math.pow(c - avgCount, 2), 0) / counts.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev < avgCount * 0.3) {
    return '您的消费比较规律，有良好的预算管理';
  } else if (stdDev > avgCount * 0.7) {
    return '您的消费比较随性，可能需要更多预算管理';
  } else {
    return '您的消费规律一般';
  }
}

function analyzeSpendingAbility(transactions: AnalysisTransaction[]): string {
  if (transactions.length === 0) return '-';

  const totalExpense = transactions.reduce((sum, t) => sum + t.amount, 0);
  const dateRange = getDateRange(transactions);
  const days = Math.max(1, (dateRange.end - dateRange.start) / (1000 * 60 * 60 * 24));
  const avgDailyExpense = totalExpense / days;

  if (avgDailyExpense > 500) {
    return `日均消费${Math.round(avgDailyExpense)}元，属于高消费人群`;
  } else if (avgDailyExpense > 200) {
    return `日均消费${Math.round(avgDailyExpense)}元，属于中等消费人群`;
  } else {
    return `日均消费${Math.round(avgDailyExpense)}元，属于节俭型消费人群`;
  }
}

function analyzeMerchants(transactions: AnalysisTransaction[]): MerchantInsight[] {
  const merchantMap = new Map<string, { count: number; total: number }>();

  for (const tx of transactions) {
    const merchant = tx.counterparty || '未知商家';
    const existing = merchantMap.get(merchant);
    if (existing) {
      existing.count++;
      existing.total += tx.amount;
    } else {
      merchantMap.set(merchant, { count: 1, total: tx.amount });
    }
  }

  return Array.from(merchantMap.entries())
    .map(([name, data]) => ({
      name,
      count: data.count,
      totalAmount: data.total,
      avgAmount: data.total / data.count
    }))
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, 10);
}

function analyzeScenario(transactions: AnalysisTransaction[]): ScenarioInsight {
  const channelData = analyzeChannel(transactions);
  const timeDistribution = analyzeTimeDistribution(transactions);
  const amountDistribution = analyzeAmountDistribution(transactions);

  return {
    channel: channelData,
    timeDistribution,
    amountDistribution
  };
}

function analyzeChannel(transactions: AnalysisTransaction[]): ChannelData[] {
  const categoryMap = new Map<string, number>();
  for (const tx of transactions) {
    const cat = tx.category || '未分类';
    categoryMap.set(cat, (categoryMap.get(cat) || 0) + tx.amount);
  }

  return Array.from(categoryMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
}

function analyzeTimeDistribution(transactions: AnalysisTransaction[]): TimeDistributionData[] {
  const periods = ['早晨(6-12)', '下午(12-18)', '晚上(18-24)', '深夜(0-6)'];
  const periodMap = new Map<string, { count: number; amount: number }>();

  for (const tx of transactions) {
    const date = new Date(tx.date);
    const hour = date.getHours();
    let period = '';

    if (hour >= 6 && hour < 12) period = '早晨(6-12)';
    else if (hour >= 12 && hour < 18) period = '下午(12-18)';
    else if (hour >= 18 && hour < 24) period = '晚上(18-24)';
    else period = '深夜(0-6)';

    const existing = periodMap.get(period);
    if (existing) {
      existing.count++;
      existing.amount += tx.amount;
    } else {
      periodMap.set(period, { count: 1, amount: tx.amount });
    }
  }

  return periods.map(period => {
    const data = periodMap.get(period) || { count: 0, amount: 0 };
    return { period, count: data.count, amount: data.amount };
  });
}

function analyzeAmountDistribution(transactions: AnalysisTransaction[]): AmountDistributionData[] {
  const ranges = [
    { range: '0-50', min: 0, max: 50 },
    { range: '50-100', min: 50, max: 100 },
    { range: '100-500', min: 100, max: 500 },
    { range: '500-1000', min: 500, max: 1000 },
    { range: '1000+', min: 1000, max: Infinity }
  ];

  return ranges.map(({ range, min, max }) => {
    const filtered = transactions.filter(t => t.amount >= min && t.amount < max);
    return {
      range,
      count: filtered.length,
      amount: filtered.reduce((sum, t) => sum + t.amount, 0)
    };
  });
}

function analyzeHabits(transactions: AnalysisTransaction[]): HabitInsight {
  if (transactions.length === 0) {
    return {
      avgDailyExpense: 0,
      avgMonthlyExpense: 0,
      peakSpendingHour: 0,
      peakSpendingDay: '-',
      mostActiveMonth: '-',
      weekendRatio: 0,
      fixedExpenseRatio: 0,
      earlyMonthRatio: 0,
      lateNightSpending: 0,
      engelCoefficient: 0
    };
  }

  const totalExpense = transactions.reduce((sum, t) => sum + t.amount, 0);
  const dateRange = getDateRange(transactions);
  const days = Math.max(1, (dateRange.end - dateRange.start) / (1000 * 60 * 60 * 24));

  const avgDailyExpense = totalExpense / days;
  const avgMonthlyExpense = avgDailyExpense * 30;

  const hourMap = new Map<number, number>();
  const dayMap = new Map<number, number>();
  const monthMap = new Map<string, number>();

  let weekendAmount = 0;
  let weekdayAmount = 0;
  let earlyMonthAmount = 0;
  let lateNightAmount = 0;
  let foodExpense = 0;

  for (const tx of transactions) {
    const date = new Date(tx.date);
    const hour = date.getHours();
    const day = date.getDay();
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const dayOfMonth = date.getDate();

    hourMap.set(hour, (hourMap.get(hour) || 0) + tx.amount);
    dayMap.set(day, (dayMap.get(day) || 0) + tx.amount);
    monthMap.set(month, (monthMap.get(month) || 0) + tx.amount);

    if (day === 0 || day === 6) {
      weekendAmount += tx.amount;
    } else {
      weekdayAmount += tx.amount;
    }

    if (dayOfMonth <= 10) {
      earlyMonthAmount += tx.amount;
    }

    if (hour >= 22 || hour < 6) {
      lateNightAmount += tx.amount;
    }

    if (tx.category && (tx.category.includes('餐饮') || tx.category.includes('食品') || tx.category.includes('饮食'))) {
      foodExpense += tx.amount;
    }
  }

  let peakSpendingHour = 0;
  let maxHourAmount = 0;
  for (const [hour, amount] of hourMap) {
    if (amount > maxHourAmount) {
      maxHourAmount = amount;
      peakSpendingHour = hour;
    }
  }

  const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  let peakSpendingDay = '-';
  let maxDayAmount = 0;
  for (const [day, amount] of dayMap) {
    if (amount > maxDayAmount) {
      maxDayAmount = amount;
      peakSpendingDay = dayNames[day] || '-';
    }
  }

  let mostActiveMonth = '-';
  let maxMonthAmount = 0;
  for (const [month, amount] of monthMap) {
    if (amount > maxMonthAmount) {
      maxMonthAmount = amount;
      mostActiveMonth = month;
    }
  }

  const weekendRatio = (weekendAmount + weekdayAmount) > 0 ? (weekendAmount / (weekendAmount + weekdayAmount)) * 100 : 0;

  const fixedExpenseRatio = totalExpense > 0 ? (earlyMonthAmount / totalExpense) * 100 : 0;

  const earlyMonthRatio = totalExpense > 0 ? (earlyMonthAmount / totalExpense) * 100 : 0;

  const lateNightSpending = totalExpense > 0 ? (lateNightAmount / totalExpense) * 100 : 0;

  const engelCoefficient = totalExpense > 0 ? (foodExpense / totalExpense) * 100 : 0;

  return {
    avgDailyExpense,
    avgMonthlyExpense,
    peakSpendingHour,
    peakSpendingDay,
    mostActiveMonth,
    weekendRatio,
    fixedExpenseRatio,
    earlyMonthRatio,
    lateNightSpending,
    engelCoefficient
  };
}

function analyzeLatteFactor(transactions: AnalysisTransaction[]): LatteFactorInsight {
  const smallTransactions = transactions.filter(t => t.amount < 50);

  if (smallTransactions.length === 0) {
    return {
      totalAmount: 0,
      topMerchant: '-',
      transactionCount: 0,
      avgAmount: 0
    };
  }

  const totalAmount = smallTransactions.reduce((sum, t) => sum + t.amount, 0);
  const merchantMap = new Map<string, { count: number; total: number }>();

  for (const tx of smallTransactions) {
    const merchant = tx.counterparty || '未知商家';
    const existing = merchantMap.get(merchant);
    if (existing) {
      existing.count++;
      existing.total += tx.amount;
    } else {
      merchantMap.set(merchant, { count: 1, total: tx.amount });
    }
  }

  let topMerchant = '-';
  let maxCount = 0;
  for (const [merchant, data] of merchantMap) {
    if (data.count > maxCount) {
      maxCount = data.count;
      topMerchant = merchant;
    }
  }

  return {
    totalAmount,
    topMerchant,
    transactionCount: smallTransactions.length,
    avgAmount: totalAmount / smallTransactions.length
  };
}

function analyzeSubscriptions(transactions: AnalysisTransaction[]): SubscriptionInsight[] {
  const merchantMap = new Map<string, { amounts: number[]; dates: number[] }>();

  for (const tx of transactions) {
    const merchant = tx.counterparty || '未知商家';
    const existing = merchantMap.get(merchant);
    if (existing) {
      existing.amounts.push(tx.amount);
      existing.dates.push(tx.date);
    } else {
      merchantMap.set(merchant, { amounts: [tx.amount], dates: [tx.date] });
    }
  }

  const subscriptions: SubscriptionInsight[] = [];

  for (const [name, data] of merchantMap) {
    if (data.amounts.length >= 3) {
      const avgAmount = data.amounts.reduce((sum, a) => sum + a, 0) / data.amounts.length;
      const amounts = [...data.amounts].sort((a, b) => a - b);
      const variance = amounts.reduce((sum, a) => sum + Math.pow(a - avgAmount, 2), 0) / amounts.length;

      if (variance < avgAmount * 0.2) {
        const dates = [...data.dates].sort((a, b) => a - b);
        let frequency = 0;
        let totalDays = 0;

        for (let i = 1; i < dates.length; i++) {
          totalDays += (dates[i]! - dates[i - 1]!) / (1000 * 60 * 60 * 24);
        }
        frequency = dates.length > 1 ? totalDays / (dates.length - 1) : 0;

        if (frequency > 20 && frequency < 40) {
          subscriptions.push({
            name,
            monthlyAmount: avgAmount,
            annualAmount: avgAmount * 12,
            frequency: Math.round(frequency)
          });
        }
      }
    }
  }

  return subscriptions.sort((a, b) => b.annualAmount - a.annualAmount).slice(0, 5);
}

function analyzeInflation(transactions: AnalysisTransaction[]): InflationInsight {
  if (transactions.length < 4) {
    return {
      rate: 0,
      trend: 'stable',
      firstAvg: 0,
      lastAvg: 0
    };
  }

  const quarters = new Map<string, number[]>();
  for (const tx of transactions) {
    const date = new Date(tx.date);
    const quarter = `${date.getFullYear()}-Q${Math.floor(date.getMonth() / 3) + 1}`;
    if (!quarters.has(quarter)) {
      quarters.set(quarter, []);
    }
    quarters.get(quarter)!.push(tx.amount);
  }

  const quarterAvgs = Array.from(quarters.entries())
    .map(([q, amounts]) => ({
      quarter: q,
      avg: amounts.reduce((sum, a) => sum + a, 0) / amounts.length
    }))
    .sort((a, b) => a.quarter.localeCompare(b.quarter));

  if (quarterAvgs.length < 2) {
    return {
      rate: 0,
      trend: 'stable',
      firstAvg: 0,
      lastAvg: 0
    };
  }

  const firstAvg = quarterAvgs[0]?.avg || 0;
  const lastAvg = quarterAvgs[quarterAvgs.length - 1]?.avg || 0;
  const rate = firstAvg > 0 ? ((lastAvg - firstAvg) / firstAvg) * 100 : 0;

  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (rate > 5) trend = 'up';
  else if (rate < -5) trend = 'down';

  return {
    rate,
    trend,
    firstAvg,
    lastAvg
  };
}

function analyzeBrandLoyalty(transactions: AnalysisTransaction[]): BrandLoyaltyInsight {
  const amountMap = new Map<string, number>();
  const countMap = new Map<string, number>();

  for (const tx of transactions) {
    const merchant = tx.counterparty || '未知商家';
    amountMap.set(merchant, (amountMap.get(merchant) || 0) + tx.amount);
    countMap.set(merchant, (countMap.get(merchant) || 0) + 1);
  }

  let topAmount = { name: '-', value: 0 };
  for (const [name, value] of amountMap) {
    if (value > topAmount.value) {
      topAmount = { name, value };
    }
  }

  let topCount = { name: '-', value: 0 };
  for (const [name, value] of countMap) {
    if (value > topCount.value) {
      topCount = { name, value };
    }
  }

  return {
    topAmount,
    topCount
  };
}

function analyzeWeekendEffect(transactions: AnalysisTransaction[]): WeekendEffectInsight {
  const weekendAmounts: number[] = [];
  const weekdayAmounts: number[] = [];

  for (const tx of transactions) {
    const date = new Date(tx.date);
    const day = date.getDay();
    if (day === 0 || day === 6) {
      weekendAmounts.push(tx.amount);
    } else {
      weekdayAmounts.push(tx.amount);
    }
  }

  const weekendAvg = weekendAmounts.length > 0
    ? weekendAmounts.reduce((sum, a) => sum + a, 0) / weekendAmounts.length
    : 0;
  const weekdayAvg = weekdayAmounts.length > 0
    ? weekdayAmounts.reduce((sum, a) => sum + a, 0) / weekdayAmounts.length
    : 0;

  const ratio = weekdayAvg > 0 ? weekendAvg / weekdayAvg : 0;

  let type = '平稳型';
  if (ratio > 1.5) type = '周末狂欢型';
  else if (ratio < 0.8) type = '周一补偿型';

  return {
    ratio,
    weekendAvg,
    weekdayAvg,
    type
  };
}

function analyzeSankey(transactions: AnalysisTransaction[]): SankeyData {
  const categoryMap = new Map<string, number>();
  for (const tx of transactions) {
    const cat = tx.category || '未分类';
    categoryMap.set(cat, (categoryMap.get(cat) || 0) + tx.amount);
  }

  const topCategories = Array.from(categoryMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const nodes: SankeyNode[] = [
    { name: '总支出', level: 0 },
    ...topCategories.map(([name]) => ({ name, level: 1 }))
  ];

  const links: SankeyLink[] = topCategories.map(([name, value]) => ({
    source: '总支出',
    target: name,
    value
  }));

  return { nodes, links };
}

function generateSmartTags(expenseTransactions: AnalysisTransaction[], incomeTransactions: AnalysisTransaction[]): string[] {
  const tags: string[] = [];

  const totalExpense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);

  if (totalIncome > 0 && totalExpense / totalIncome > 0.8) {
    tags.push('高消费型');
  } else if (totalIncome > 0 && totalExpense / totalIncome < 0.4) {
    tags.push('节俭型');
  }

  const avgAmount = expenseTransactions.length > 0 ? totalExpense / expenseTransactions.length : 0;
  if (avgAmount > 500) {
    tags.push('大额消费偏好');
  } else if (avgAmount < 50) {
    tags.push('小额高频消费');
  }

  const categoryMap = new Map<string, number>();
  for (const tx of expenseTransactions) {
    const cat = tx.category || '未分类';
    categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
  }

  const topCategory = Array.from(categoryMap.entries())
    .sort((a, b) => b[1] - a[1])[0];

  if (topCategory && topCategory[1] / expenseTransactions.length > 0.4) {
    tags.push(`${topCategory[0]}爱好者`);
  }

  const weekendRatio = analyzeWeekendEffect(expenseTransactions).ratio;
  if (weekendRatio > 1.5) {
    tags.push('周末消费达人');
  }

  const latteFactor = analyzeLatteFactor(expenseTransactions);
  if (latteFactor.totalAmount > totalExpense * 0.3) {
    tags.push('拿铁因子明显');
  }

  if (tags.length === 0) {
    tags.push('均衡消费型');
  }

  return tags;
}

function getDateRange(transactions: AnalysisTransaction[]): { start: number; end: number } {
  let start = Infinity;
  let end = 0;

  for (const tx of transactions) {
    if (tx.date < start) start = tx.date;
    if (tx.date > end) end = tx.date;
  }

  return { start, end };
}

function analyzeThemeRiver(transactions: AnalysisTransaction[]): ThemeRiverData {
  const monthMap = new Map<string, Map<string, number>>();

  for (const tx of transactions) {
    const date = new Date(tx.date);
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const category = tx.category || '未分类';

    if (!monthMap.has(month)) {
      monthMap.set(month, new Map());
    }
    const categoryMap = monthMap.get(month)!;
    categoryMap.set(category, (categoryMap.get(category) || 0) + tx.amount);
  }

  const sortedMonths = Array.from(monthMap.keys()).sort();
  const allCategories = new Set<string>();
  for (const categoryMap of monthMap.values()) {
    for (const category of categoryMap.keys()) {
      allCategories.add(category);
    }
  }

  const topCategories = Array.from(allCategories)
    .map(cat => ({
      name: cat,
      total: Array.from(monthMap.values())
        .reduce((sum, cm) => sum + (cm.get(cat) || 0), 0)
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)
    .map(c => c.name);

  const series = topCategories.map(category => ({
    name: category,
    data: sortedMonths.map(month => monthMap.get(month)?.get(category) || 0)
  }));

  return {
    dates: sortedMonths,
    series
  };
}

function analyzeHeatmap(transactions: AnalysisTransaction[]): HeatmapData {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const data: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));

  for (const tx of transactions) {
    const date = new Date(tx.date);
    const day = date.getDay();
    const hour = date.getHours();
    const dayData = data[day];
    if (dayData) {
      dayData[hour] = (dayData[hour] || 0) + tx.amount;
    }
  }

  return { hours, days, data };
}

function analyzeRadar(transactions: AnalysisTransaction[]): RadarData {
  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
  const quarterData = [0, 0, 0, 0];

  for (const tx of transactions) {
    const date = new Date(tx.date);
    const quarter = Math.floor(date.getMonth() / 3);
    if (quarter >= 0 && quarter < 4) {
      quarterData[quarter] = (quarterData[quarter] || 0) + tx.amount;
    }
  }

  const maxAmount = Math.max(...quarterData, 1);

  return {
    indicators: quarters.map(q => ({ name: q, max: maxAmount * 1.2 })),
    series: [{
      name: '季度消费',
      value: quarterData
    }]
  };
}

function analyzeQuadrant(transactions: AnalysisTransaction[]): QuadrantData {
  const categoryMap = new Map<string, { count: number; total: number }>();

  for (const tx of transactions) {
    const cat = tx.category || '未分类';
    const existing = categoryMap.get(cat);
    if (existing) {
      existing.count++;
      existing.total += tx.amount;
    } else {
      categoryMap.set(cat, { count: 1, total: tx.amount });
    }
  }

  const items = Array.from(categoryMap.entries())
    .map(([name, data]) => ({
      name,
      count: data.count,
      avgAmount: data.total / data.count,
      totalAmount: data.total
    }))
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, 20);

  return { items };
}

function analyzeChord(transactions: AnalysisTransaction[]): ChordData {
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const dayCategoryMap = new Map<number, Map<string, number>>();

  for (const tx of transactions) {
    const date = new Date(tx.date);
    const day = date.getDay();
    const category = tx.category || '未分类';

    if (!dayCategoryMap.has(day)) {
      dayCategoryMap.set(day, new Map());
    }
    const categoryMap = dayCategoryMap.get(day)!;
    categoryMap.set(category, (categoryMap.get(category) || 0) + tx.amount);
  }

  const topCategories = new Set<string>();
  for (const categoryMap of dayCategoryMap.values()) {
    const sorted = Array.from(categoryMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    for (const [cat] of sorted) {
      topCategories.add(cat);
    }
  }

  const categoryList = Array.from(topCategories).slice(0, 6);
  const links: { source: number; target: number; value: number }[] = [];

  for (let day = 0; day < 7; day++) {
    const categoryMap = dayCategoryMap.get(day);
    if (!categoryMap) continue;

    for (let i = 0; i < categoryList.length; i++) {
      const category = categoryList[i];
      if (!category) continue;
      const amount = categoryMap.get(category) || 0;
      if (amount > 0) {
        links.push({
          source: day,
          target: i + 7,
          value: amount
        });
      }
    }
  }

  return {
    nodes: [...days, ...categoryList],
    links
  };
}

function analyzeFunnel(transactions: AnalysisTransaction[]): FunnelData {
  const ranges = [
    { name: '0-100元', min: 0, max: 100 },
    { name: '100-500元', min: 100, max: 500 },
    { name: '500-1000元', min: 500, max: 1000 },
    { name: '1000-2000元', min: 1000, max: 2000 },
    { name: '2000元以上', min: 2000, max: Infinity }
  ];

  const data = ranges.map(range => {
    const count = transactions.filter(t => t.amount >= range.min && t.amount < range.max).length;
    return { name: range.name, value: count };
  });

  return { data };
}

function analyzePareto(transactions: AnalysisTransaction[]): ParetoData {
  const categoryMap = new Map<string, number>();

  for (const tx of transactions) {
    const cat = tx.category || '未分类';
    categoryMap.set(cat, (categoryMap.get(cat) || 0) + tx.amount);
  }

  const sorted = Array.from(categoryMap.entries())
    .sort((a, b) => b[1] - a[1]);

  const total = sorted.reduce((sum, [, amount]) => sum + amount, 0);
  let cumulative = 0;

  const categories = sorted.map(([cat]) => cat);
  const amounts = sorted.map(([, amount]) => amount);
  const cumulativeData = amounts.map(amount => {
    cumulative += amount;
    return (cumulative / total) * 100;
  });

  return {
    categories,
    amounts,
    cumulative: cumulativeData
  };
}

function analyzeWordCloud(transactions: AnalysisTransaction[]): WordCloudData[] {
  const wordMap = new Map<string, number>();

  for (const tx of transactions) {
    const words = [
      tx.category || '',
      tx.product || '',
      tx.counterparty || ''
    ].filter(w => w.trim());

    for (const word of words) {
      wordMap.set(word, (wordMap.get(word) || 0) + tx.amount);
    }
  }

  return Array.from(wordMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 50);
}

function analyzeBoxPlot(transactions: AnalysisTransaction[]): BoxPlotData {
  const categoryMap = new Map<string, number[]>();

  for (const tx of transactions) {
    const cat = tx.category || '未分类';
    if (!categoryMap.has(cat)) {
      categoryMap.set(cat, []);
    }
    categoryMap.get(cat)!.push(tx.amount);
  }

  const sortedCategories = Array.from(categoryMap.entries())
    .sort((a, b) => {
      const avgA = a[1].reduce((sum, v) => sum + v, 0) / a[1].length;
      const avgB = b[1].reduce((sum, v) => sum + v, 0) / b[1].length;
      return avgB - avgA;
    })
    .slice(0, 10);

  return {
    categories: sortedCategories.map(([cat]) => cat),
    data: sortedCategories.map(([, amounts]) => amounts)
  };
}
