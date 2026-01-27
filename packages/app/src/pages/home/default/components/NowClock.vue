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
import 'dayjs/locale/zh-cn';
import lunisolar from 'lunisolar'
import festivals from 'lunisolar/markers/festivals.zh-cn'

dayjs.locale('zh-cn')

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
  const jieQi = [...new Set(lunar.markers.list.map(e => e.name))].join(",");
  
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
  background: linear-gradient(135deg, var(--td-brand-color-6) 0%, var(--td-brand-color-8) 100%);
  backdrop-filter: var(--fluent-acrylic-blur);
  border-radius: var(--td-radius-large);
  padding: var(--td-size-8) var(--td-size-7);
  box-shadow: var(--fluent-elevation-3);
  min-width: 220px;
  width: 220px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255, 255, 255, 0.2);

  &::before {
    content: '';
    position: absolute;
    top: -30%;
    right: -20%;
    width: 200px;
    height: 200px;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%);
    border-radius: 50%;
    animation: float 6s ease-in-out infinite;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -20%;
    left: -10%;
    width: 150px;
    height: 150px;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
    border-radius: 50%;
    animation: float 8s ease-in-out infinite reverse;
  }

  &:hover {
    box-shadow: var(--fluent-elevation-4);
    transform: translateY(-2px);
  }

  &:focus-visible {
    outline: none;
    box-shadow: var(--fluent-focus-ring), var(--fluent-elevation-3);
  }

  .time-display {
    font-size: 36px;
    font-weight: 600;
    color: white;
    line-height: 1;
    margin-bottom: var(--td-size-3);
    font-family: 'Segoe UI', 'Segoe UI Web (West European)', -apple-system, BlinkMacSystemFont, Roboto, 'Helvetica Neue', monospace;
    letter-spacing: -1px;
    position: relative;
    z-index: 1;
  }

  .date-display {
    position: relative;
    z-index: 1;

    .date-main {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.95);
      margin-bottom: var(--td-size-1);
      font-weight: 500;
      letter-spacing: -0.2px;
    }

    .date-lunar {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.8);
      font-weight: 400;
    }
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-15px) scale(1.05);
  }
}

@media (max-width: 768px) {
  .datetime-widget {
    min-width: 180px;
    width: 180px;
    padding: var(--td-size-6) var(--td-size-5);

    .time-display {
      font-size: 32px;
    }

    .date-display {
      .date-main {
        font-size: 13px;
      }

      .date-lunar {
        font-size: 11px;
      }
    }
  }
}
</style>
