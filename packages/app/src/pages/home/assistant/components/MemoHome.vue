<template>
  <div class="memo-home">
    <div class="sticky-header">
      <div class="memo-header">
        <div class="greeting">
          <span class="greeting-emoji">👋</span>
          <span class="greeting-text">{{ greeting }},主人~</span>
        </div>
        <div class="date-info">
          <span class="date-emoji">📅</span>
          <span class="date-text">{{ currentDate }}</span>
        </div>
      </div>

      <div class="memo-editor-section">
        <div class="editor-card monica-card">
          <div
            class="editor-wrapper"
            ref="editorWrapperRef"
            :class="{ focused: isFocused }"
            @mousedown="handleEditorMouseDown"
          >
            <Transition name="editor-collapse" mode="out-in">
              <div v-if="!isFocused" key="collapsed" class="editor-collapsed">
                <div class="collapsed-placeholder">
                  <span class="placeholder-icon">📝</span>
                  <span v-if="!memoContent" class="placeholder-text">今天想记录什么呢？</span>
                  <span v-else class="placeholder-content">{{ memoContent }}</span>
                </div>
                <div class="collapsed-actions">
                  <span v-if="selectedMood" class="collapsed-mood">{{ selectedMood }}</span>
                  <span v-if="atPartner" class="collapsed-at">@{{ atPartner.name }}</span>
                </div>
              </div>

              <div v-else key="expanded" class="editor-expanded">
                <textarea
                  ref="textareaRef"
                  v-model="memoContent"
                  class="memo-textarea monica-input"
                  placeholder="今天想记录什么呢？可以是心情、想法、或者任何想说的话..."
                  :rows="isFocused ? 5 : 1"
                  @focus="isFocused = true"
                ></textarea>

                <div class="editor-toolbar">
                  <div class="at-section">
                    <span v-if="atPartner" class="at-tag monica-tag">
                      @{{ atPartner.name }}
                      <span class="at-remove" @click="atPartner = null">×</span>
                    </span>
                    <button class="at-btn" @click="openPartnerSelector">
                      <span class="at-icon">@</span>
                      <span>呼唤伙伴</span>
                    </button>
                  </div>
                  <div class="mood-selector">
                    <span
                      v-for="mood in moods"
                      :key="mood.emoji"
                      class="mood-item"
                      :class="{ active: selectedMood === mood.emoji }"
                      @click="selectedMood = mood.emoji"
                      :title="mood.name"
                    >
                      {{ mood.emoji }}
                    </span>
                  </div>
                </div>

                <div class="editor-footer">
                  <div class="char-count">{{ memoContent.length }}/500</div>
                  <button class="publish-btn monica-btn" @click="publishMemo" :disabled="!memoContent.trim()">
                    <span class="publish-icon">✨</span>
                    <span>发布Memo</span>
                  </button>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </div>

    <div class="today-memos">
      <div class="section-header">
        <span class="section-icon">📋</span>
        <span class="section-title">今日Memo</span>
        <span class="section-count">({{ todayMemos.length }})</span>
      </div>
      <div class="memos-list local-scroll">
        <TransitionGroup name="memo-list">
          <div
            v-for="memo in todayMemos"
            :key="memo.id"
            class="memo-item monica-card"
          >
            <div class="memo-meta">
              <div class="memo-author">
                <img :src="memo.authorAvatar" class="memo-avatar monica-avatar" />
                <span class="memo-name">{{ memo.authorName }}</span>
              </div>
              <div class="memo-info">
                <span class="memo-mood">{{ memo.mood }}</span>
                <span class="memo-time">{{ memo.time }}</span>
              </div>
            </div>
            <div class="memo-content">
              <p>{{ memo.content }}</p>
              <div v-if="memo.atPartner" class="memo-at">
                <span class="at-prefix">@</span>
                <img :src="memo.atPartner.avatar" class="at-avatar" />
                <span class="at-name">{{ memo.atPartner.name }}</span>
              </div>
            </div>
            <div v-if="memo.aiComment" class="memo-ai-comment">
              <div class="ai-comment-header">
                <img :src="memo.aiComment.avatar" class="ai-avatar" />
                <span class="ai-name">{{ memo.aiComment.name }}</span>
                <span class="ai-badge">AI伙伴</span>
              </div>
              <p class="ai-comment-content">{{ memo.aiComment.content }}</p>
            </div>
            <div class="memo-actions">
              <button class="action-btn" @click="likeMemo(memo)">
                <span>{{ memo.liked ? '❤️' : '🤍' }}</span>
                <span>{{ memo.likes }}</span>
              </button>
              <button class="action-btn" @click="commentOnMemo(memo)">
                <span>💬</span>
                <span>{{ memo.comments }}</span>
              </button>
            </div>
          </div>
        </TransitionGroup>
        <div v-if="todayMemos.length === 0" class="empty-state">
          <span class="empty-emoji">📝</span>
          <p class="empty-text">今天还没有memo记录哦</p>
          <p class="empty-hint">写下你的第一篇memo吧！</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

interface Partner {
  id: string
  name: string
  avatar: string
  description: string
  personality: string
}

interface Memo {
  id: string
  authorName: string
  authorAvatar: string
  content: string
  mood: string
  time: string
  atPartner: Partner | null
  aiComment: {
    name: string
    avatar: string
    content: string
  } | null
  likes: number
  liked: boolean
  comments: number
}

const emit = defineEmits<{
  (e: 'at-partner', callback: (partner: Partner) => void): void
}>()

const greetings = ['早上好', '下午好', '晚上好', '夜深了']
const mood = new Date().getHours()
let greetingIndex = 0
if (mood < 12) greetingIndex = 0
else if (mood < 18) greetingIndex = 1
else greetingIndex = 2

const greeting = ref(greetings[greetingIndex])
const currentDate = new Date().toLocaleDateString('zh-CN', {
  month: 'long',
  day: 'numeric',
  weekday: 'short'
})

const memoContent = ref('')
const atPartner = ref<Partner | null>(null)
const selectedMood = ref('')
const isFocused = ref(false)
const textareaRef = ref<HTMLTextAreaElement | null>(null)

const moods = [
  { emoji: '😊', name: '开心' },
  { emoji: '😢', name: '难过' },
  { emoji: '😴', name: '疲惫' },
  { emoji: '😡', name: '生气' },
  { emoji: '🤔', name: '思考' },
  { emoji: '😍', name: '幸福' },
  { emoji: '😰', name: '焦虑' },
  { emoji: '🥳', name: '兴奋' }
]

const todayMemos = ref<Memo[]>([
  {
    id: '1',
    authorName: '我',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me',
    content: '今天天气真好，心情也跟着变好了！工作效率特别高，完成了很多任务。',
    mood: '😊',
    time: '14:30',
    atPartner: null,
    aiComment: {
      name: '小莫',
      avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=monica',
      content: '听起来是很棒的一天呢！继续保持这份好心情吧~ 有需要随时找我聊天哦 😊'
    },
    likes: 5,
    liked: true,
    comments: 2
  },
  {
    id: '2',
    authorName: '我',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me',
    content: '今天遇到了一个小挫折，但没关系，总结经验下次会更好。@小莫 希望你能给我一些建议',
    mood: '🤔',
    time: '10:15',
    atPartner: {
      id: '1',
      name: '小莫',
      avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=monica',
      description: '温暖贴心的生活助手',
      personality: '温柔'
    },
    aiComment: {
      name: '小莫',
      avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=monica',
      content: '遇到挫折很正常呀，重要的是你愿意反思和成长。我看到你已经在思考如何改进了，这本身就是很大的进步呢 💪'
    },
    likes: 3,
    liked: false,
    comments: 1
  }
])

const editorWrapperRef = ref<HTMLElement | null>(null)

const handleEditorMouseDown = (e: MouseEvent) => {
  if (!isFocused.value) {
    e.preventDefault()
    isFocused.value = true
    nextTick(() => {
      textareaRef.value?.focus()
    })
  }
}

const handleClickOutside = (e: MouseEvent) => {
  if (editorWrapperRef.value && !editorWrapperRef.value.contains(e.target as Node)) {
    isFocused.value = false
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})

const openPartnerSelector = () => {
  emit('at-partner', (partner: Partner) => {
    atPartner.value = partner
    nextTick(() => {
      textareaRef.value?.focus()
    })
  })
}

const publishMemo = () => {
  if (!memoContent.value.trim()) return

  const newMemo: Memo = {
    id: Date.now().toString(),
    authorName: '我',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me',
    content: memoContent.value,
    mood: selectedMood.value || '😊',
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    atPartner: atPartner.value,
    aiComment: null,
    likes: 0,
    liked: false,
    comments: 0
  }

  todayMemos.value.unshift(newMemo)

  setTimeout(() => {
    newMemo.aiComment = {
      name: atPartner.value?.name || '小莫',
      avatar: atPartner.value?.avatar || 'https://api.dicebear.com/7.x/personas/svg?seed=monica',
      content: atPartner.value?.personality === '温柔'
        ? '收到你的memo啦~ 有什么想聊的随时告诉我哦 😊'
        : '哈喽！看到你的memo啦，有趣！'
    }
    newMemo.comments = 1
  }, 1500)

  memoContent.value = ''
  atPartner.value = null
  selectedMood.value = ''
  isFocused.value = false
}

const likeMemo = (memo: Memo) => {
  memo.liked = !memo.liked
  memo.likes += memo.liked ? 1 : -1
}

const commentOnMemo = (memo: Memo) => {
  console.log('Comment on memo:', memo.id)
}
</script>

<style scoped lang="less">
@import '@/assets/style/monica.less';

.memo-home {
  padding: var(--monica-spacing-lg);
  overflow-y: auto;
}

.sticky-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--monica-warm-bg);
  padding-bottom: var(--monica-spacing-lg);
}

.memo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--monica-spacing-lg);
}

.greeting, .date-info {
  display: flex;
  align-items: center;
  gap: var(--monica-spacing-sm);
}

.greeting-emoji, .date-emoji {
  font-size: 24px;
}

.greeting-text {
  font-size: var(--monica-font-xl);
  font-weight: 600;
  color: var(--monica-text-primary);
}

.date-text {
  font-size: var(--monica-font-md);
  color: var(--monica-text-secondary);
}

.memo-editor-section {
  .editor-card {
    padding: var(--monica-spacing-md);
  }
}

.editor-wrapper {
  position: relative;
}

.editor-wrapper.focused .editor-collapsed {
  background: var(--monica-warm-bg-secondary);
  border-radius: var(--monica-radius-md);
}

.editor-collapsed {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--monica-spacing-md);
  cursor: text;
  transition: all 0.3s ease;
  min-height: 48px;
}

.editor-collapsed:hover {
  background: var(--monica-warm-bg-secondary);
  border-radius: var(--monica-radius-md);
}

.placeholder-content {
  flex: 1;
  color: var(--monica-text-primary);
  font-size: var(--monica-font-md);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: var(--monica-spacing-md);
}

.collapsed-placeholder {
  display: flex;
  align-items: center;
  gap: var(--monica-spacing-sm);
}

.placeholder-icon {
  font-size: 20px;
}

.placeholder-text {
  color: var(--monica-text-tertiary);
  font-size: var(--monica-font-md);
}

.collapsed-actions {
  display: flex;
  align-items: center;
  gap: var(--monica-spacing-sm);
}

.collapsed-mood {
  font-size: 18px;
}

.collapsed-at {
  font-size: var(--monica-font-sm);
  color: var(--monica-coral);
  background: var(--monica-coral-light);
  padding: 2px 8px;
  border-radius: var(--monica-radius-sm);
}

.editor-expanded {
  padding: var(--monica-spacing-md);
}

.memo-textarea {
  width: 100%;
  resize: none;
  border: none;
  background: transparent;
  font-family: inherit;
  line-height: 1.6;
  padding: 0;
  min-height: 24px;
  font-size: var(--monica-font-md);
}

.memo-textarea:focus {
  outline: none;
  box-shadow: none;
}

.editor-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--monica-spacing-md);
  padding-top: var(--monica-spacing-md);
  border-top: 1px solid var(--monica-border);
}

.at-section {
  display: flex;
  align-items: center;
  gap: var(--monica-spacing-sm);
}

.at-btn {
  display: flex;
  align-items: center;
  gap: var(--monica-spacing-xs);
  background: var(--monica-warm-bg-secondary);
  border: 1px solid var(--monica-border);
  border-radius: var(--monica-radius-md);
  padding: var(--monica-spacing-xs) var(--monica-spacing-md);
  color: var(--monica-text-secondary);
  font-size: var(--monica-font-sm);
  cursor: pointer;
  transition: all 0.2s ease;
}

.at-btn:hover {
  background: var(--monica-peach-light);
  border-color: var(--monica-coral);
  color: var(--monica-coral-dark);
}

.at-icon {
  font-weight: bold;
  color: var(--monica-coral);
}

.mood-selector {
  display: flex;
  gap: var(--monica-spacing-xs);
}

.mood-item {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--monica-radius-sm);
  cursor: pointer;
  font-size: 18px;
  transition: all 0.2s ease;
}

.mood-item:hover {
  background: var(--monica-warm-bg-secondary);
  transform: scale(1.1);
}

.mood-item.active {
  background: var(--monica-coral-light);
  transform: scale(1.15);
}

.editor-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--monica-spacing-md);
  padding-top: var(--monica-spacing-md);
  border-top: 1px solid var(--monica-border);
}

.char-count {
  font-size: var(--monica-font-sm);
  color: var(--monica-text-tertiary);
}

.publish-btn {
  display: flex;
  align-items: center;
  gap: var(--monica-spacing-sm);
}

.publish-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.editor-expand-enter-active,
.editor-expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.editor-expand-enter-from,
.editor-expand-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.editor-expand-enter-to,
.editor-expand-leave-from {
  max-height: 300px;
}

.today-memos {
  margin-top: var(--monica-spacing-lg);
}

.section-header {
  display: flex;
  align-items: center;
  gap: var(--monica-spacing-sm);
  margin-bottom: var(--monica-spacing-md);
}

.section-icon {
  font-size: 18px;
}

.section-title {
  font-size: var(--monica-font-lg);
  font-weight: 600;
  color: var(--monica-text-primary);
}

.section-count {
  font-size: var(--monica-font-sm);
  color: var(--monica-text-tertiary);
}

.memos-list {
  display: flex;
  flex-direction: column;
  gap: var(--monica-spacing-md);
  padding-top: 8px;
}

.memo-item {
  padding: var(--monica-spacing-md);
}

.memo-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--monica-spacing-sm);
}

.memo-author {
  display: flex;
  align-items: center;
  gap: var(--monica-spacing-sm);
}

.memo-avatar {
  width: 32px;
  height: 32px;
}

.memo-name {
  font-size: var(--monica-font-sm);
  font-weight: 600;
  color: var(--monica-text-primary);
}

.memo-info {
  display: flex;
  align-items: center;
  gap: var(--monica-spacing-md);
}

.memo-mood {
  font-size: 18px;
}

.memo-time {
  font-size: var(--monica-font-sm);
  color: var(--monica-text-tertiary);
}

.memo-content {
  font-size: var(--monica-font-md);
  color: var(--monica-text-primary);
  line-height: 1.6;
  margin-bottom: var(--monica-spacing-md);
}

.memo-at {
  display: inline-flex;
  align-items: center;
  gap: var(--monica-spacing-xs);
  margin-top: var(--monica-spacing-sm);
  padding: var(--monica-spacing-xs) var(--monica-spacing-sm);
  background: var(--monica-coral-light);
  border-radius: var(--monica-radius-sm);
  color: var(--monica-coral-dark);
  font-size: var(--monica-font-sm);
}

.at-avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
}

.memo-ai-comment {
  background: var(--monica-warm-bg-secondary);
  border-radius: var(--monica-radius-md);
  padding: var(--monica-spacing-md);
  margin-bottom: var(--monica-spacing-md);
}

.ai-comment-header {
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

.ai-comment-content {
  font-size: var(--monica-font-sm);
  color: var(--monica-text-secondary);
  line-height: 1.6;
}

.memo-actions {
  display: flex;
  gap: var(--monica-spacing-lg);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: var(--monica-spacing-xs);
  background: none;
  border: none;
  color: var(--monica-text-tertiary);
  font-size: var(--monica-font-sm);
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  color: var(--monica-coral);
}

.empty-state {
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

.memo-list-enter-active,
.memo-list-leave-active {
  transition: all 0.3s ease;
}

.memo-list-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.memo-list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.editor-collapse-enter-active,
.editor-collapse-leave-active {
  transition: all 0.25s ease;
}

.editor-collapse-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.editor-collapse-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.toolbar-fade-enter-active,
.toolbar-fade-leave-active {
  transition: all 0.2s ease;
}

.toolbar-fade-enter-from,
.toolbar-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.footer-fade-enter-active,
.footer-fade-leave-active {
  transition: all 0.2s ease 0.1s;
}

.footer-fade-enter-from,
.footer-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
