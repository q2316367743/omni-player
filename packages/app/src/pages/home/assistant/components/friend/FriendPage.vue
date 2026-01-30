<template>
  <div class="partner-page">
    <div class="page-header">
      <h1 class="page-title">我的AI伙伴</h1>
      <p class="page-subtitle">选择一位伙伴，开始有趣的对话吧</p>
    </div>

    <div v-if="activeFriends.length === 0" class="empty-state">
      <p>还没有AI伙伴，快去创建吧~</p>
    </div>

    <div v-else class="partners-grid">
      <FriendCard
        v-for="friend in activeFriends"
        :key="friend.id"
        :friend="friend"
        :active="selectedPartner?.id === friend.id"
        @click="selectPartner"
      />
    </div>

    <Transition name="monica-page">
      <FriendDetail v-if="selectedPartner" :friend="selectedPartner" @close="closeDetail" />
    </Transition>
  </div>
</template>

<script lang="ts" setup>
import {useMemoFriendStore} from '@/store/MemoFriendStore'
import type {MemoFriend} from '@/entity/memo'
import FriendDetail from './FriendDetail.vue'
import FriendCard from './FriendCard.vue'

const emit = defineEmits<{
  (e: 'chat', partner: MemoFriend): void
}>()


const selectedPartner = ref<MemoFriend | null>(null)

const activeFriends = computed(() => {
  return useMemoFriendStore().friends.filter(f => f.is_active === 1)
})

const selectPartner = (partner: MemoFriend) => {
  selectedPartner.value = partner
  emit('chat', partner)
}

const closeDetail = () => {
  selectedPartner.value = null
}
</script>

<style scoped lang="less">
@import 'less/FriendPage.less';
</style>
