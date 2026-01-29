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
          <t-button theme="primary" variant="text" shape="square" @click="toSetting()">
            <template #icon>
              <setting-icon />
            </template>
          </t-button>
        </div>
      </div>

      <MemoEditor @publish="handlePublishMemo" />
    </div>

    <div class="today-memos">
      <div class="section-header">
        <span class="section-icon">📋</span>
        <span class="section-title">今日Memo</span>
        <span class="section-count">({{ todayMemos.length }})</span>
      </div>
      <div class="memos-list local-scroll">
        <TransitionGroup name="memo-list">
          <MemoItem
            v-for="memo in todayMemos"
            :key="memo.id"
            :memo="memo"
            @comment="commentOnMemo"
            @confirm-delete="deleteMemo"
          />
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
import { ref, onMounted } from 'vue'
import MemoEditor from './MemoEditor.vue'
import MemoItem from './MemoItem.vue'
import { useMemoFriendStore } from '@/store/MemoFriendStore.ts'
import { pageMemoItem, addMemoService, removeMemoService } from '@/services/memo/MemoItemService.ts'
import type { MemoItemView } from '@/services/memo/MemoItemService.ts'
import type { MemoFriend } from '@/entity/memo'
import type { Memo } from '../../types.ts'
import {SettingIcon} from "tdesign-icons-vue-next";

const router = useRouter();

const greetings = ['早上好', '下午好', '晚上好', '夜深了']
const mood = new Date().getHours()
let greetingIndex: number
if (mood < 12) greetingIndex = 0
else if (mood < 18) greetingIndex = 1
else greetingIndex = 2

const greeting = ref(greetings[greetingIndex])
const currentDate = new Date().toLocaleDateString('zh-CN', {
  month: 'long',
  day: 'numeric',
  weekday: 'short'
})

const friendStore = useMemoFriendStore()
const todayMemos = ref<Memo[]>([])
const loading = ref(false)
const pageNum = ref(1)
const pageSize = ref(20)
const total = ref(0)

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

const convertMemoItemViewToMemo = (item: MemoItemView, friendMap: Map<string, MemoFriend>): Memo => {
  const friendIds = item.friend_ids ? item.friend_ids.split(',').filter(Boolean) : []
  const atPartner = friendIds.length > 0 ? friendMap.get(friendIds[0]!) : null
  
  const aiComment = item.comments.length > 0 ? {
    name: atPartner?.name ?? 'AI伙伴',
    avatar: atPartner?.avatar ?? 'https://api.dicebear.com/7.x/personas/svg?seed=monica',
    content: item.comments[0]!.content
  } : null

  return {
    id: item.id,
    authorName: '我',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me',
    content: item.content,
    mood: '😊',
    time: formatTime(item.created_at),
    atPartner: atPartner ? {
      id: atPartner.id,
      name: atPartner.name,
      avatar: atPartner.avatar,
      description: atPartner.occupation,
      personality: atPartner.personality_tags
    } : null,
    aiComment: aiComment,
    comments: item.comments.length
  }
}

const loadMemos = async () => {
  loading.value = true
  try {
    const result = await pageMemoItem(pageNum.value, pageSize.value)
    total.value = result.total
    
    const friendMap = new Map(friendStore.friends.map(f => [f.id, f]))
    
    todayMemos.value = result.records.map(item => convertMemoItemViewToMemo(item, friendMap))
  } catch (error) {
    console.error('Failed to load memos:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadMemos()
})

const handlePublishMemo = async (data: { content: string; type: string; atFriends: string[] }) => {
  try {
    await addMemoService({
      content: data.content,
      type: data.type as any,
      friend_ids: data.atFriends.join(','),
      consumed: 0
    })
    
    await loadMemos()
  } catch (error) {
    console.error('Failed to publish memo:', error)
  }
}

const commentOnMemo = (memo: Memo) => {
  console.log('Comment on memo:', memo.id)
}

const deleteMemo = async (memo: Memo) => {
  try {
    await removeMemoService(memo.id)
    await loadMemos()
  } catch (error) {
    console.error('Failed to delete memo:', error)
  }
}

const toSetting = () => {
  router.push('/admin/global-setting')
}
</script>

<style scoped lang="less">
@import "less/MemoHome.less";
</style>
