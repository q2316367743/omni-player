<template>
  <div class="friend-list">
    <div class="friend-list-header">
      <h2 class="friend-list-title">消息</h2>
      <div class="friend-list-search">
        <t-input placeholder="搜索朋友" size="small" clearable>
          <template #prefix-icon>
            <t-icon name="search" />
          </template>
        </t-input>
      </div>
    </div>
    <div class="friend-list-content local-scroll">
      <div
        v-for="friend in friends"
        :key="friend.id"
        class="friend-item"
        :class="{ active: friend.id === selectedFriendId }"
        @click="handleClick(friend)"
      >
        <div class="friend-avatar">
          <XhAvatar :value="friend.avatar" :size="48" shape="circle" />
          <div class="friend-status online"></div>
        </div>
        <div class="friend-info">
          <div class="friend-name-row">
            <span class="friend-name">{{ friend.name }}</span>
            <span class="friend-time">刚刚</span>
          </div>
          <div class="friend-preview">
            <span class="friend-archetype">{{ getArchetypeText(friend.archetype) }}</span>
            <span class="friend-desc">{{ friend.personality_prompt }}</span>
          </div>
        </div>
      </div>
      <div v-if="friends.length === 0" class="empty-friends">
        <p>暂无朋友</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type {MemoFriendStaticView} from '@/entity/memo'
import {getArchetypeText} from '@/entity/memo'
import XhAvatar from '@/components/avatar/XhAvatar.vue'

defineProps<{
  friends: MemoFriendStaticView[]
  selectedFriendId?: string
}>()

const emit = defineEmits<{
  (e: 'select', friend: MemoFriendStaticView): void
}>()

const handleClick = (friend: MemoFriendStaticView) => {
  emit('select', friend)
}
</script>

<style scoped lang="less">
@import 'less/FriendList.less';
</style>
