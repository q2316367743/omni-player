<template>
  <div class="diary-page">
    <div class="page-header">
      <h1 class="page-title">日记</h1>
      <p class="page-subtitle">记录你的每一天</p>
    </div>

    <div class="diary-content">
      <div class="calendar-section">
        <div class="calendar-header">
          <button class="cal-nav-btn" @click="prevMonth">‹</button>
          <span class="cal-title">{{ currentMonthYear }}</span>
          <button class="cal-nav-btn" @click="nextMonth">›</button>
        </div>
        <div class="calendar-grid">
          <div class="cal-weekday" v-for="day in weekdays" :key="day">{{ day }}</div>
          <div
            v-for="(day, idx) in calendarDays"
            :key="idx"
            class="cal-day"
            :class="{
              'other-month': !day.isCurrentMonth,
              'today': day.isToday,
              'has-memo': day.memoCount > 0
            }"
            @click="selectDate(day)"
          >
            <span class="day-number">{{ day.date }}</span>
            <div v-if="day.memoCount > 0" class="day-memos">
              <span class="memo-dot" v-for="n in Math.min(day.memoCount, 3)" :key="n"></span>
            </div>
          </div>
        </div>
      </div>

      <div class="timeline-section">
        <div class="timeline-header">
          <h2 class="timeline-title">{{ selectedDateFormatted }}</h2>
          <span class="memo-count">{{ selectedDateMemos.length }}篇memo</span>
        </div>
        <div class="timeline-content local-scroll">
          <TransitionGroup name="timeline-item" tag="div" class="timeline">
            <div
              v-for="memo in selectedDateMemos"
              :key="memo.id"
              class="timeline-item"
            >
              <div class="timeline-time">{{ memo.time }}</div>
              <div class="timeline-marker">
                <div class="marker-dot"></div>
                <div class="marker-line"></div>
              </div>
              <div class="timeline-card monica-card">
                <div class="memo-header">
                  <span v-if="memo.atPartner" class="memo-at">
                    @{{ memo.atPartner.name }}
                  </span>
                </div>
                <p class="memo-text">{{ memo.content }}</p>
                <div v-if="memo.aiComment" class="ai-comment">
                  <div class="ai-header">
                    <img :src="memo.aiComment.avatar" class="ai-avatar" />
                    <span class="ai-name">{{ memo.aiComment.name }}</span>
                    <span class="ai-badge">AI回复</span>
                  </div>
                  <p class="ai-text">{{ memo.aiComment.content }}</p>
                </div>
                <div class="memo-footer">
                  <span class="memo-stats">
                    ❤️ {{ memo.likes }} · 💬 {{ memo.comments }}
                  </span>
                </div>
              </div>
            </div>
          </TransitionGroup>

          <div v-if="selectedDateMemos.length === 0" class="empty-timeline">
            <span class="empty-emoji">📝</span>
            <p class="empty-text">这一天还没有memo记录</p>
            <p class="empty-hint">点击右上角的Memo页面，开始记录吧！</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

interface Partner {
  id: string
  name: string
  avatar: string
}

interface Memo {
  id: string
  date: string
  time: string
  content: string
  atPartner: Partner | null
  aiComment: {
    name: string
    avatar: string
    content: string
  } | null
  likes: number
  comments: number
}

const weekdays = ['日', '一', '二', '三', '四', '五', '六']
const currentDate = new Date()
const currentYear = ref(currentDate.getFullYear())
const currentMonth = ref(currentDate.getMonth())
const selectedDate = ref<Date>(currentDate)

const currentMonthYear = computed(() => {
  const months = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
  return `${months[currentMonth.value]} ${currentYear.value}`
})

const selectedDateFormatted = computed(() => {
  return selectedDate.value.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

const calendarDays = computed(() => {
  const days = []
  const firstDay = new Date(currentYear.value, currentMonth.value, 1)
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0)
  const startDay = firstDay.getDay()
  const totalDays = lastDay.getDate()

  for (let i = startDay - 1; i >= 0; i--) {
    const date = new Date(currentYear.value, currentMonth.value, -i)
    days.push({
      date: date.getDate(),
      fullDate: date,
      isCurrentMonth: false,
      isToday: false,
      memoCount: Math.floor(Math.random() * 5)
    })
  }

  for (let i = 1; i <= totalDays; i++) {
    const date = new Date(currentYear.value, currentMonth.value, i)
    const isToday = date.toDateString() === currentDate.toDateString()
    days.push({
      date: i,
      fullDate: date,
      isCurrentMonth: true,
      isToday,
      memoCount: Math.random() > 0.6 ? Math.floor(Math.random() * 4) + 1 : 0
    })
  }

  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    const date = new Date(currentYear.value, currentMonth.value + 1, i)
    days.push({
      date: i,
      fullDate: date,
      isCurrentMonth: false,
      isToday: false,
      memoCount: Math.floor(Math.random() * 3)
    })
  }

  return days
})

const selectedDateMemos = computed(() => {
  return memos.filter(m => {
    const memoDate = new Date(m.date)
    return memoDate.toDateString() === selectedDate.value.toDateString()
  })
})

const getTodayDate = () => new Date().toISOString().split('T')[0] || ''
const getDateBefore = (days: number) => {
  const date = new Date(Date.now() - days * 86400000)
  return date.toISOString().split('T')[0] || ''
}

const memos: Memo[] = [
  {
    id: '1',
    date: getTodayDate(),
    time: '14:30',
    content: '今天天气真好，心情也跟着变好了！工作效率特别高，完成了很多任务。',
    atPartner: null,
    aiComment: {
      name: '小莫',
      avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=monica',
      content: '听起来是很棒的一天呢！继续保持这份好心情吧~'
    },
    likes: 5,
    comments: 2
  },
  {
    id: '2',
    date: getTodayDate(),
    time: '10:15',
    content: '今天遇到了一个小挫折，但没关系，总结经验下次会更好。',
    atPartner: {
      id: '1',
      name: '小莫',
      avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=monica'
    },
    aiComment: {
      name: '小莫',
      avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=monica',
      content: '遇到挫折很正常呀，重要的是你愿意反思和成长。'
    },
    likes: 3,
    comments: 1
  },
  {
    id: '3',
    date: getDateBefore(1),
    time: '20:00',
    content: '晚上好，今天读了一本很有收获的书，学到了很多新知识。',
    atPartner: null,
    aiComment: null,
    likes: 2,
    comments: 0
  },
  {
    id: '4',
    date: getDateBefore(2),
    time: '09:00',
    content: '新的一周开始了！给自己定个小目标，这一周要读完这本书。',
    atPartner: {
      id: '4',
      name: '乐多',
      avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=ledo'
    },
    aiComment: {
      name: '乐多',
      avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=ledo',
      content: '加油！我相信你一定可以做到的！💪'
    },
    likes: 7,
    comments: 3
  },
  {
    id: '5',
    date: getDateBefore(3),
    time: '22:00',
    content: '忙碌的一天结束了，虽然有点累，但是很充实。晚安~',
    atPartner: null,
    aiComment: {
      name: '小暖',
      avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=xiaonuan',
      content: '辛苦啦！好好休息，明天又是新的一天呢~ 🌙'
    },
    likes: 4,
    comments: 1
  }
]

const prevMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

const selectDate = (day: { fullDate: Date; isCurrentMonth: boolean; memoCount: number }) => {
  selectedDate.value = day.fullDate
}
</script>

<style scoped lang="less">
.diary-page {
  height: 100%;
  padding: var(--monica-spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--monica-spacing-lg);
  overflow: hidden;
}

.page-header {
  text-align: center;
}

.page-title {
  font-size: var(--monica-font-xxl);
  font-weight: 600;
  color: var(--monica-text-primary);
  margin-bottom: var(--monica-spacing-xs);
}

.page-subtitle {
  font-size: var(--monica-font-md);
  color: var(--monica-text-tertiary);
}

.diary-content {
  flex: 1;
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: var(--monica-spacing-lg);
  overflow: hidden;
  min-height: 0;
}

.calendar-section {
  background: var(--td-bg-color-container);
  border-radius: var(--monica-radius-lg);
  padding: var(--monica-spacing-lg);
  box-shadow: 0 2px 12px var(--monica-shadow);
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--monica-spacing-lg);
}

.cal-nav-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: var(--monica-warm-bg-secondary);
  border-radius: 50%;
  font-size: 18px;
  color: var(--monica-text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.cal-nav-btn:hover {
  background: var(--monica-coral-light);
  color: white;
}

.cal-title {
  font-size: var(--monica-font-lg);
  font-weight: 600;
  color: var(--monica-text-primary);
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.cal-weekday {
  text-align: center;
  font-size: var(--monica-font-sm);
  color: var(--monica-text-tertiary);
  padding: var(--monica-spacing-sm);
}

.cal-day {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: var(--monica-radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.cal-day:hover {
  background: var(--monica-warm-bg-secondary);
}

.cal-day.other-month {
  opacity: 0.4;
}

.cal-day.today {
  background: var(--monica-coral-light);
  font-weight: 600;
}

.cal-day.has-memo {
  color: var(--monica-coral-dark);
}

.day-number {
  font-size: var(--monica-font-sm);
}

.day-memos {
  display: flex;
  gap: 2px;
  margin-top: 2px;
}

.memo-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--monica-coral);
}

.timeline-section {
  background: var(--td-bg-color-container);
  border-radius: var(--monica-radius-lg);
  box-shadow: 0 2px 12px var(--monica-shadow);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--monica-spacing-lg);
  border-bottom: 1px solid var(--monica-border);
}

.timeline-title {
  font-size: var(--monica-font-lg);
  font-weight: 600;
  color: var(--monica-text-primary);
  margin: 0;
}

.memo-count {
  font-size: var(--monica-font-sm);
  color: var(--monica-text-tertiary);
}

.timeline-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--monica-spacing-lg);
}

.timeline {
  position: relative;
}

.timeline-item {
  display: flex;
  gap: var(--monica-spacing-md);
  margin-bottom: var(--monica-spacing-lg);
}

.timeline-time {
  width: 60px;
  font-size: var(--monica-font-sm);
  color: var(--monica-text-tertiary);
  text-align: right;
  padding-top: 4px;
}

.timeline-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.marker-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--monica-coral);
  border: 2px solid var(--td-bg-color-container);
  box-shadow: 0 0 0 2px var(--monica-coral-light);
  z-index: 1;
}

.marker-line {
  width: 2px;
  flex: 1;
  background: var(--monica-border);
  margin-top: 4px;
}

.timeline-item:last-child .marker-line {
  display: none;
}

.timeline-card {
  flex: 1;
  padding: var(--monica-spacing-md);
}

.memo-header {
  display: flex;
  align-items: center;
  gap: var(--monica-spacing-md);
  margin-bottom: var(--monica-spacing-sm);
}

.memo-mood {
  font-size: 24px;
}

.memo-at {
  font-size: var(--monica-font-sm);
  color: var(--monica-coral);
  background: var(--monica-coral-light);
  padding: 2px 8px;
  border-radius: var(--monica-radius-sm);
}

.memo-text {
  font-size: var(--monica-font-md);
  color: var(--monica-text-primary);
  line-height: 1.6;
  margin-bottom: var(--monica-spacing-md);
}

.ai-comment {
  background: var(--monica-warm-bg-secondary);
  border-radius: var(--monica-radius-md);
  padding: var(--monica-spacing-md);
  margin-bottom: var(--monica-spacing-md);
}

.ai-header {
  display: flex;
  align-items: center;
  gap: var(--monica-spacing-sm);
  margin-bottom: var(--monica-spacing-sm);
}

.ai-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
}

.ai-name {
  font-size: var(--monica-font-sm);
  font-weight: 600;
  color: var(--monica-text-primary);
}

.ai-badge {
  background: var(--monica-coral);
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: var(--monica-radius-sm);
}

.ai-text {
  font-size: var(--monica-font-sm);
  color: var(--monica-text-secondary);
  line-height: 1.6;
  margin: 0;
}

.memo-footer {
  padding-top: var(--monica-spacing-sm);
  border-top: 1px solid var(--monica-border);
}

.memo-stats {
  font-size: var(--monica-font-sm);
  color: var(--monica-text-tertiary);
}

.empty-timeline {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--monica-spacing-xl);
  text-align: center;
}

.empty-emoji {
  font-size: 48px;
  margin-bottom: var(--monica-spacing-md);
}

.empty-text {
  font-size: var(--monica-font-md);
  color: var(--monica-text-secondary);
  margin-bottom: var(--monica-spacing-xs);
}

.empty-hint {
  font-size: var(--monica-font-sm);
  color: var(--monica-text-tertiary);
}

.timeline-item-enter-active,
.timeline-item-leave-active {
  transition: all 0.3s ease;
}

.timeline-item-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.timeline-item-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
