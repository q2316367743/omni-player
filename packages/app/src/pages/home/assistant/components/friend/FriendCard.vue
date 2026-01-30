<template>
  <div
    class="partner-card monica-card"
    :class="{ active: active, locked: friend.is_locked === 1 }"
    @click="handleClick"
  >
    <div class="partner-avatar-wrap">
      <XhAvatar :value="friend.avatar" :size="80" shape="circle"/>
      <div class="partner-status" :class="moodToStatus(friend.current_mood)"></div>
      <div v-if="friend.is_locked === 1" class="locked-badge">🔒</div>
    </div>
    <h3 class="partner-name">{{ friend.name }}</h3>
    <p class="partner-personality">{{ getArchetypeText(friend.archetype) }}</p>
    <p class="partner-desc">{{ friend.personality_prompt }}</p>
    <div class="partner-tags">
      <span v-for="tag in visibleTags" :key="tag" class="partner-tag">{{ tag }}</span>
      <t-tooltip v-if="hiddenTagsCount > 0" :content="allTags.join('、')">
        <span class="partner-tag more-tag">+{{ hiddenTagsCount }}</span>
      </t-tooltip>
    </div>
    <div class="partner-stats">
      <div class="stat">
        <span class="stat-value">{{ friend.trust_level }}</span>
        <span class="stat-label">信任度</span>
      </div>
      <div class="stat">
        <span class="stat-value">{{ friend.intimacy_score }}</span>
        <span class="stat-label">亲密度</span>
      </div>
    </div>
    <div class="partner-action">
      <t-button theme="primary" shape="round" @click.stop="handleChat">
        {{ hasSession ? '继续聊天' : '开始聊天' }}
      </t-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type {MemoFriendView} from '@/entity/memo'
import {
  getArchetypeText,
  moodToStatus
} from '@/entity/memo/MemoFriend'
import XhAvatar from '@/components/avatar/XhAvatar.vue'
import {useMemoFriendStore} from "@/store";
import {createMemoSession} from "@/services/memo";
import MessageUtil from "@/util/model/MessageUtil.ts";

const props = defineProps<{
  friend: MemoFriendView
  active?: boolean
}>()

const emit = defineEmits<{
  (e: 'click', friend: MemoFriendView): void
}>()

const router = useRouter();

const allTags = computed(() => props.friend.personality_tags);
const hasSession = computed(() => useMemoFriendStore().chatFriendMap.has(props.friend.id));
const maxVisible = 6

const visibleTags = computed(() => {
  return allTags.value.slice(0, maxVisible)
})

const hiddenTagsCount = computed(() => {
  return Math.max(0, allTags.value.length - maxVisible)
})

const handleClick = () => {
  if (props.friend.is_locked === 1) return
  emit('click', props.friend)
}

const handleChat = () => {
  const sessionId = useMemoFriendStore().chatFriendMap.get(props.friend.id);
  if (sessionId) {
    router.push(`/memo/chat/${sessionId}`);
    return;
  }
  createMemoSession(props.friend.id)
    .then((session) => {
      router.push(`/memo/chat/${session.id}`);
      useMemoFriendStore().loadChatSession();
    })
    .catch(e => {
      MessageUtil.error("创建聊天失败", e);
    })
}
</script>

<style scoped lang="less">
@import 'less/FriendCard.less';
</style>
