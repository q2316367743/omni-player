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

      <MemoEditor @at-partner="handleAtPartner" @publish="handlePublishMemo" />
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
import { ref } from 'vue'
import MemoEditor from './MemoEditor.vue'

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

const handleAtPartner = (callback: (partner: Partner) => void) => {
  emit('at-partner', callback)
}

const handlePublishMemo = (data: { content: string; mood: string; atPartner: Partner | null }) => {
  const newMemo: Memo = {
    id: Date.now().toString(),
    authorName: '我',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me',
    content: data.content,
    mood: data.mood,
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    atPartner: data.atPartner,
    aiComment: null,
    likes: 0,
    liked: false,
    comments: 0
  }

  todayMemos.value.unshift(newMemo)

  setTimeout(() => {
    newMemo.aiComment = {
      name: data.atPartner?.name || '小莫',
      avatar: data.atPartner?.avatar || 'https://api.dicebear.com/7.x/personas/svg?seed=monica',
      content: data.atPartner?.personality === '温柔'
        ? '收到你的memo啦~ 有什么想聊的随时告诉我哦 😊'
        : '哈喽！看到你的memo啦，有趣！'
    }
    newMemo.comments = 1
  }, 1500)
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
@import "less/MemoHome.less";
</style>
