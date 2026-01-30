<template>
  <div class="memo-item monica-card">
    <div class="memo-meta">
      <div class="memo-author">
        <img :src="memo.authorAvatar" class="memo-avatar monica-avatar" :alt="memo.authorName"/>
        <span class="memo-name">{{ memo.authorName }}</span>
      </div>
      <div class="memo-info">
        <span class="memo-time">{{ memo.time }}</span>
      </div>
    </div>
    <div class="memo-content">
      <p>{{ memo.content }}</p>
      <div v-if="memo.atPartner" class="memo-at">
        <span class="at-prefix">@</span>
        <img :src="memo.atPartner.avatar" class="at-avatar" :alt="memo.atPartner?.name"/>
        <span class="at-name">{{ memo.atPartner?.name }}</span>
      </div>
    </div>
    <div v-if="memo.aiComment" class="memo-ai-comment">
      <div class="ai-comment-header">
        <img :src="memo.aiComment.avatar" class="ai-avatar" :alt="memo.aiComment?.name "/>
        <span class="ai-name">{{ memo.aiComment?.name }}</span>
        <span class="ai-badge">AI伙伴</span>
      </div>
      <p class="ai-comment-content">{{ memo.aiComment?.content }}</p>
    </div>
    <div class="memo-actions">
      <t-button theme="primary" variant="text" @click="handleComment">
        <template #icon>
          <chat-message-icon />
        </template>
        {{ memo.comments }}
      </t-button>
      <t-dropdown trigger="click">
        <t-button theme="primary" variant="text" shape="square">
          <template #icon>
            <more-icon/>
          </template>
        </t-button>
        <t-dropdown-menu>
          <t-dropdown-item theme="error" @click="handleDropdownClick()">
            <template #prefix-icon>
              <delete-icon/>
            </template>
            删除
          </t-dropdown-item>
        </t-dropdown-menu>
      </t-dropdown>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type {Memo} from '../../types.ts'
import MessageBoxUtil from '@/util/model/MessageBoxUtil.tsx'
import {ChatMessageIcon, DeleteIcon, MoreIcon} from "tdesign-icons-vue-next";

interface Props {
  memo: Memo
}

const props = defineProps<Props>()

const emit = defineEmits<{
  comment: [memo: Memo]
  confirmDelete: [memo: Memo]
}>()



const handleDropdownClick = () => {
  MessageBoxUtil.confirm('确定要删除这条 memo 吗？', '确认删除').then(() => {
    emit('confirmDelete', props.memo)
  }).catch(() => {
    console.log('取消删除')
  })
}

const handleComment = () => {
  emit('comment', props.memo)
}
</script>

<style scoped lang="less">
@import "less/MemoItem.less";
</style>
