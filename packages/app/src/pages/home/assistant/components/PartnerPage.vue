<template>
  <div class="partner-page">
    <div class="page-header">
      <h1 class="page-title">我的AI伙伴</h1>
      <p class="page-subtitle">选择一位伙伴，开始有趣的对话吧</p>
    </div>

    <div class="partners-grid">
      <div
        v-for="partner in partners"
        :key="partner.id"
        class="partner-card monica-card"
        :class="{ active: selectedPartner?.id === partner.id }"
        @click="selectPartner(partner)"
      >
        <div class="partner-avatar-wrap">
          <img :src="partner.avatar" class="partner-avatar" />
          <div class="partner-status" :class="partner.status"></div>
        </div>
        <h3 class="partner-name">{{ partner.name }}</h3>
        <p class="partner-personality">{{ partner.personality }}</p>
        <p class="partner-desc">{{ partner.description }}</p>
        <div class="partner-tags">
          <span v-for="tag in partner.tags" :key="tag" class="partner-tag">{{ tag }}</span>
        </div>
        <div class="partner-stats">
          <div class="stat">
            <span class="stat-value">{{ partner.chatCount }}</span>
            <span class="stat-label">对话</span>
          </div>
          <div class="stat">
            <span class="stat-value">{{ partner.memoCount }}</span>
            <span class="stat-label">评论</span>
          </div>
        </div>
      </div>
    </div>

    <Transition name="monica-page">
      <div v-if="selectedPartner" class="chat-panel">
        <div class="chat-header">
          <div class="chat-partner-info">
            <img :src="selectedPartner.avatar" class="chat-avatar" />
            <div class="chat-partner-meta">
              <span class="chat-partner-name">{{ selectedPartner.name }}</span>
              <span class="chat-partner-status">{{ selectedPartner.status === 'online' ? '在线' : '忙碌中' }}</span>
            </div>
          </div>
          <div class="chat-actions">
            <button class="chat-action-btn" @click="closeChat">×</button>
          </div>
        </div>

        <div class="chat-messages local-scroll" ref="chatContainer">
          <TransitionGroup name="chat-message">
            <div
              v-for="(msg, index) in chatMessages"
              :key="index"
              class="message"
              :class="{ user: msg.isUser, ai: !msg.isUser }"
            >
              <img v-if="!msg.isUser" :src="selectedPartner.avatar" class="message-avatar" />
              <div class="message-bubble">
                <p>{{ msg.content }}</p>
                <span class="message-time">{{ msg.time }}</span>
              </div>
            </div>
          </TransitionGroup>
          <div v-if="isTyping" class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        <div class="chat-input-area">
          <input
            v-model="newMessage"
            type="text"
            class="chat-input monica-input"
            placeholder="输入消息..."
            @keyup.enter="sendMessage"
          />
          <button class="send-btn monica-btn" @click="sendMessage" :disabled="!newMessage.trim()">
            <span>发送</span>
            <span class="send-icon">➤</span>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script lang="ts" setup>
import { ref, nextTick } from 'vue'

interface Partner {
  id: string
  name: string
  avatar: string
  description: string
  personality: string
  tags: string[]
  status: 'online' | 'busy'
  chatCount: number
  memoCount: number
}

interface ChatMessage {
  content: string
  isUser: boolean
  time: string
}

const emit = defineEmits<{
  (e: 'chat', partner: Partner): void
}>()

const partners = ref<Partner[]>([
  {
    id: '1',
    name: '小莫',
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=monica',
    description: '温暖贴心的生活助手',
    personality: '温柔治愈系',
    tags: ['生活', '情感', '鼓励'],
    status: 'online',
    chatCount: 128,
    memoCount: 56
  },
  {
    id: '2',
    name: '阿卡',
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=arka',
    description: '幽默风趣的聊天伙伴',
    personality: '活泼开朗系',
    tags: ['搞笑', '闲聊', '段子'],
    status: 'online',
    chatCount: 89,
    memoCount: 34
  },
  {
    id: '3',
    name: '小暖',
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=xiaonuan',
    description: '知心姐姐般的倾听者',
    personality: '细腻敏感系',
    tags: ['倾听', '理解', '支持'],
    status: 'busy',
    chatCount: 234,
    memoCount: 89
  },
  {
    id: '4',
    name: '乐多',
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=ledo',
    description: '充满能量的鼓励者',
    personality: '乐观积极系',
    tags: ['激励', '正能量', '目标'],
    status: 'online',
    chatCount: 67,
    memoCount: 23
  },
  {
    id: '5',
    name: '思思',
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=sisi',
    description: '理性分析的思考伙伴',
    personality: '逻辑思维系',
    tags: ['分析', '建议', '规划'],
    status: 'busy',
    chatCount: 156,
    memoCount: 45
  },
  {
    id: '6',
    name: '泡泡',
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=paopao',
    description: '可爱萌系的小甜心',
    personality: '可爱软萌系',
    tags: ['萌', '可爱', '治愈'],
    status: 'online',
    chatCount: 201,
    memoCount: 78
  }
])

const selectedPartner = ref<Partner | null>(null)
const newMessage = ref('')
const chatMessages = ref<ChatMessage[]>([])
const isTyping = ref(false)
const chatContainer = ref<HTMLElement | null>(null)

const selectPartner = (partner: Partner) => {
  selectedPartner.value = partner
  emit('chat', partner)
  initChat(partner)
}

const initChat = (partner: Partner) => {
  chatMessages.value = [
    {
      content: `嗨~我是${partner.name}！${partner.description}。有什么想聊的吗？我在这里陪你呀 😊`,
      isUser: false,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    }
  ]
}

const sendMessage = async () => {
  if (!newMessage.value.trim() || !selectedPartner.value) return

  const userMsg: ChatMessage = {
    content: newMessage.value,
    isUser: true,
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }
  chatMessages.value.push(userMsg)
  newMessage.value = ''
  scrollToBottom()

  isTyping.value = true
  await nextTick()
  scrollToBottom()

  setTimeout(() => {
    isTyping.value = false
    const responses = [
      '嗯嗯，我听到了~',
      '听起来很有意思呢！',
      '真的吗？好棒呀！',
      '我能理解你的感受 💕',
      '你太厉害了吧！',
      '有什么我可以帮到你的吗？',
      '我在这里陪你呀~',
      '加油！我相信你可以的！✨'
    ]
    const aiMsg: ChatMessage = {
      content: responses[Math.floor(Math.random() * responses.length)] || '嗯嗯~',
      isUser: false,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) || ''
    }
    chatMessages.value.push(aiMsg)
    scrollToBottom()
  }, 1000 + Math.random() * 1000)
}

const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}

const closeChat = () => {
  selectedPartner.value = null
}
</script>

<style scoped lang="less">
@import '@/assets/style/monica.less';

.partner-page {
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

.partners-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: var(--monica-spacing-md);
  overflow-y: auto;
  padding-right: var(--monica-spacing-sm);
  flex: 1;
  padding-top: 8px;
}

.partner-card {
  padding: var(--monica-spacing-lg);
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.partner-card:hover {
  transform: translateY(-4px);
}

.partner-card.active {
  border-color: var(--monica-coral);
  background: linear-gradient(135deg, var(--monica-warm-bg-secondary) 0%, var(--td-bg-color-container) 100%);
}

.partner-avatar-wrap {
  position: relative;
  display: inline-block;
  margin-bottom: var(--monica-spacing-md);
}

.partner-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid var(--monica-coral-light);
}

.partner-status {
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid var(--monica-warm-bg);
}

.partner-status.online {
  background: #4CAF50;
}

.partner-status.busy {
  background: #FF9800;
}

.partner-name {
  font-size: var(--monica-font-lg);
  font-weight: 600;
  color: var(--monica-text-primary);
  margin-bottom: var(--monica-spacing-xs);
}

.partner-personality {
  font-size: var(--monica-font-sm);
  color: var(--monica-coral);
  margin-bottom: var(--monica-spacing-sm);
}

.partner-desc {
  font-size: var(--monica-font-sm);
  color: var(--monica-text-tertiary);
  margin-bottom: var(--monica-spacing-md);
  line-height: 1.5;
}

.partner-tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--monica-spacing-xs);
  margin-bottom: var(--monica-spacing-md);
}

.partner-tag {
  background: var(--monica-warm-bg-secondary);
  color: var(--monica-text-secondary);
  font-size: var(--monica-font-xs);
  padding: 2px 8px;
  border-radius: var(--monica-radius-sm);
}

.partner-stats {
  display: flex;
  justify-content: center;
  gap: var(--monica-spacing-xl);
  padding-top: var(--monica-spacing-md);
  border-top: 1px solid var(--monica-border);
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: var(--monica-font-lg);
  font-weight: 600;
  color: var(--monica-coral);
}

.stat-label {
  font-size: var(--monica-font-xs);
  color: var(--monica-text-tertiary);
}

.chat-panel {
  position: fixed;
  right: 0;
  top: 0;
  bottom: 0;
  width: 400px;
  background: var(--td-bg-color-container);
  box-shadow: -4px 0 24px var(--monica-shadow-strong);
  display: flex;
  flex-direction: column;
  z-index: 100;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--monica-spacing-md) var(--monica-spacing-lg);
  background: linear-gradient(135deg, var(--monica-coral) 0%, var(--monica-coral-light) 100%);
}

.chat-partner-info {
  display: flex;
  align-items: center;
  gap: var(--monica-spacing-md);
}

.chat-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid var(--monica-warm-bg);
}

.chat-partner-meta {
  display: flex;
  flex-direction: column;
}

.chat-partner-name {
  color: white;
  font-weight: 600;
  font-size: var(--monica-font-md);
}

.chat-partner-status {
  color: rgba(255, 255, 255, 0.8);
  font-size: var(--monica-font-xs);
}

.chat-action-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.chat-action-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: var(--monica-spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--monica-spacing-md);
  background: var(--monica-warm-bg);
}

.message {
  display: flex;
  align-items: flex-end;
  gap: var(--monica-spacing-sm);
}

.message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.message-bubble {
  max-width: 70%;
  padding: var(--monica-spacing-md);
  border-radius: var(--monica-radius-md);
  background: var(--td-bg-color-container);
  box-shadow: 0 2px 8px var(--monica-shadow);
}

.message.user .message-bubble {
  background: var(--monica-coral);
  color: white;
}

.message-bubble p {
  margin: 0;
  line-height: 1.5;
  font-size: var(--monica-font-md);
}

.message-time {
  display: block;
  font-size: var(--monica-font-xs);
  opacity: 0.6;
  margin-top: var(--monica-spacing-xs);
}

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: var(--monica-spacing-md);
  background: var(--td-bg-color-container);
  border-radius: var(--monica-radius-md);
  box-shadow: 0 2px 8px var(--monica-shadow);
  width: fit-content;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--monica-coral-light);
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 80%, 100% {
    transform: scale(1);
    opacity: 0.5;
  }
  40% {
    transform: scale(1.3);
    opacity: 1;
  }
}

.chat-input-area {
  display: flex;
  gap: var(--monica-spacing-sm);
  padding: var(--monica-spacing-md);
  background: var(--td-bg-color-container);
  border-top: 1px solid var(--monica-border);
}

.chat-input {
  flex: 1;
}

.send-btn {
  display: flex;
  align-items: center;
  gap: var(--monica-spacing-xs);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.chat-message-enter-active,
.chat-message-leave-active {
  transition: all 0.3s ease;
}

.chat-message-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.chat-message-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
