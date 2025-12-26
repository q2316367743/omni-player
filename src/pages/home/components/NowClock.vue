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
import {onMounted, onUnmounted, ref} from 'vue';
import dayjs from 'dayjs';
import {Lunar} from 'lunar-javascript';

const currentTime = ref('');
const currentDate = ref('');
const lunarDate = ref('');

let timeTimer: number | null = null;

const getLunarDate = (date: Date): string => {
  const lunar = Lunar.fromDate(date);
  const lunarMonth = lunar.getMonthInChinese();
  const lunarDay = lunar.getDayInChinese();
  const jieQi = lunar.getJieQi();
  
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
  background: var(--td-bg-color-container);
  backdrop-filter: blur(10px);
  border-radius: var(--td-radius-medium);
  padding: 16px 20px;
  box-shadow: var(--td-shadow-1);
  min-width: 200px;
  width: 200px;

  .time-display {
    font-size: 36px;
    font-weight: 700;
    color: var(--td-text-color-primary);
    line-height: 1;
    margin-bottom: 8px;
    font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
  }

  .date-display {
    .date-main {
      font-size: 14px;
      color: var(--td-text-color-secondary);
      margin-bottom: 4px;
      font-weight: 500;
    }

    .date-lunar {
      font-size: 12px;
      color: var(--td-text-color-placeholder);
    }
  }
}
</style>
