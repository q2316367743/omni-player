<template>
  <div class="monica-container">
    <div class="monica-nav">
      <div class="nav-menu">
        <div
          v-for="item in navItems"
          :key="item.id"
          class="nav-item"
          :class="{ active: currentPage === item.id }"
          @click="currentPage = item.id"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <span class="nav-label">{{ item.label }}</span>
        </div>
      </div>
      <div class="nav-time">
        <span class="time-text">{{ currentTime }}</span>
      </div>
    </div>

    <div class="monica-content">
      <Transition name="monica-page" mode="out-in">
        <MemoHome
          v-if="currentPage === 'home'"
          @at-partner="openPartnerSelector"
        />
        <PartnerPage
          v-else-if="currentPage === 'partner'"
          @chat="startChat"
        />
        <MomentsPage
          v-else-if="currentPage === 'moments'"
        />
        <DiaryPage
          v-else-if="currentPage === 'diary'"
        />
        <ToolsPage
          v-else-if="currentPage === 'tools'"
        />
      </Transition>
    </div>

    <Transition name="monica-page">
      <div v-if="showPartnerSelector" class="partner-selector-overlay" @click.self="showPartnerSelector = false">
        <div class="partner-selector-popup">
          <div class="selector-header">
            <span class="selector-title">选择要 @ 的伙伴</span>
            <span class="selector-close" @click="showPartnerSelector = false">×</span>
          </div>
          <div class="selector-content">
            <div
              v-for="partner in partners"
              :key="partner.id"
              class="selector-item"
              @click="selectPartner(partner)"
            >
              <img :src="partner.avatar" class="selector-avatar" />
              <div class="selector-info">
                <span class="selector-name">{{ partner.name }}</span>
                <span class="selector-desc">{{ partner.description }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'
import MemoHome from './components/MemoHome.vue'
import PartnerPage from './components/PartnerPage.vue'
import MomentsPage from './components/MomentsPage.vue'
import DiaryPage from './components/DiaryPage.vue'
import ToolsPage from './components/ToolsPage.vue'

interface Partner {
  id: string
  name: string
  avatar: string
  description: string
  personality: string
}

const navItems = [
  { id: 'home', label: 'Memo', icon: '📝' },
  { id: 'partner', label: '伙伴', icon: '👥' },
  { id: 'moments', label: '朋友圈', icon: '🌸' },
  { id: 'diary', label: '日记', icon: '📅' },
  { id: 'tools', label: '工具', icon: '🧰' }
]

const currentPage = ref('home')
const currentTime = ref('')
const showPartnerSelector = ref(false)
const selectedMemoPartner = ref<((partner: Partner) => void) | null>(null)

const partners = ref<Partner[]>([
  {
    id: '1',
    name: '小莫',
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=monica',
    description: '温暖贴心的生活助手',
    personality: '温柔'
  },
  {
    id: '2',
    name: '阿卡',
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=arka',
    description: '幽默风趣的聊天伙伴',
    personality: '活泼'
  },
  {
    id: '3',
    name: '小暖',
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=xiaonuan',
    description: '知心姐姐般的倾听者',
    personality: '细腻'
  },
  {
    id: '4',
    name: '乐多',
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=ledo',
    description: '充满能量的鼓励者',
    personality: '乐观'
  }
])

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

let timeTimer: number

const openPartnerSelector = (callback: (partner: Partner) => void) => {
  selectedMemoPartner.value = callback
  showPartnerSelector.value = true
}

const selectPartner = (partner: Partner) => {
  if (selectedMemoPartner.value) {
    selectedMemoPartner.value(partner)
  }
  showPartnerSelector.value = false
  selectedMemoPartner.value = null
}

const startChat = (partner: Partner) => {
  console.log('Starting chat with:', partner.name)
}

onMounted(() => {
  updateTime()
  timeTimer = window.setInterval(updateTime, 1000)
})

onUnmounted(() => {
  clearInterval(timeTimer)
})
</script>

<style scoped lang="less">
@import '@/assets/style/monica.less';

.monica-container {
  display: flex;
  height: 100vh;
  width: 100vw;
  background: var(--monica-warm-bg);
}

.monica-nav {
  width: 80px;
  background: linear-gradient(180deg, var(--monica-coral) 0%, var(--monica-coral-dark) 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--monica-spacing-lg) 0;
  box-shadow: 2px 0 12px var(--monica-shadow);
}

.nav-menu {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--monica-spacing-xs);
}

.nav-item {
  width: 64px;
  height: 64px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: var(--monica-radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  color: rgba(255, 255, 255, 0.7);
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.15);
  color: white;
}

.nav-item.active {
  background: var(--monica-warm-bg);
  color: var(--monica-coral-dark);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.nav-icon {
  font-size: 24px;
  margin-bottom: 2px;
}

.nav-label {
  font-size: var(--monica-font-xs);
  font-weight: 500;
}

.nav-time {
  padding: var(--monica-spacing-md);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  margin-top: var(--monica-spacing-md);
}

.time-text {
  color: white;
  font-size: var(--monica-font-sm);
  font-weight: 500;
}

.monica-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.partner-selector-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--td-mask-active);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.partner-selector-popup {
  background: var(--td-bg-color-container);
  border-radius: var(--monica-radius-lg);
  width: 400px;
  max-height: 500px;
  overflow: hidden;
  box-shadow: 0 8px 32px var(--monica-shadow-strong);
}

.selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--monica-spacing-lg);
  background: linear-gradient(135deg, var(--monica-coral) 0%, var(--monica-coral-light) 100%);
}

.selector-title {
  color: white;
  font-size: var(--monica-font-lg);
  font-weight: 600;
}

.selector-close {
  color: white;
  font-size: 24px;
  cursor: pointer;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.selector-close:hover {
  opacity: 1;
}

.selector-content {
  padding: var(--monica-spacing-md);
  max-height: 400px;
  overflow-y: auto;
}

.selector-item {
  display: flex;
  align-items: center;
  gap: var(--monica-spacing-md);
  padding: var(--monica-spacing-md);
  border-radius: var(--monica-radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: var(--monica-spacing-sm);
}

.selector-item:hover {
  background: var(--monica-warm-bg-secondary);
}

.selector-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid var(--monica-coral-light);
}

.selector-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.selector-name {
  font-size: var(--monica-font-md);
  font-weight: 600;
  color: var(--monica-text-primary);
}

.selector-desc {
  font-size: var(--monica-font-sm);
  color: var(--monica-text-tertiary);
}
</style>
