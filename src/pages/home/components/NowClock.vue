<template>
  <div class="datetime-widget">
    <div class="time-display">{{ currentTime }}</div>
    <div class="date-display">
      <div class="date-main">{{ currentDate }}</div>
      <div class="date-lunar">{{ lunarDate }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import dayjs from 'dayjs';
import lunisolar from 'lunisolar'
import festivals from 'lunisolar/markers/festivals.zh-cn' // 简体版

// 全局加载节日列表
lunisolar.Markers.add(festivals)

const currentTime = ref('');
const currentDate = ref('');
const lunarDate = ref('');

let timeTimer: number | null = null;

const getLunarDate = (date: Date): string => {
  const lunar = lunisolar(date);
  const lunarMonth = lunar.lunar.getMonthName();
  const lunarDay = lunar.lunar.getDayName();
  const jieQi = lunar.markers.list.map(e => e.name).join(",");
  
  return `农历${lunarMonth}${lunarDay}${jieQi ? ' · ' + jieQi : ''}`;
};

const updateDateTime = () => {
  const now = new Date();
  currentTime.value = dayjs(now).format('HH:mm:ss');
  currentDate.value = dayjs(now).format('YYYY年MM月DD日 dddd');
  lunarDate.value = getLunarDate(now);
};

onMounted(() => {
  updateDateTime();
  timeTimer = window.setInterval(updateDateTime, 1000);
});

onUnmounted(() => {
  if (timeTimer !== null) {
    clearInterval(timeTimer);
  }
});
</script>

<style scoped lang="less">
.datetime-widget {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 24px 32px;
  box-shadow: 0 12px 40px rgba(102, 126, 234, 0.25);
  min-width: 200px;
  width: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;

  .time-display {
    font-size: 32px;
    font-weight: 700;
    color: white;
    line-height: 1;
    margin-bottom: 8px;
    font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
  }

  .date-display {
    .date-main {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.9);
      margin-bottom: 4px;
      font-weight: 500;
    }

    .date-lunar {
      font-size: 11px;
      color: rgba(255, 255, 255, 0.7);
    }
  }
}
</style>
