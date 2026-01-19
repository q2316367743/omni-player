<template>
  <div class="chat-container">
    <div class="chat-list" ref="chatContentRef">
      <div :class="['chat-list-wrapper', layout]">
      <div v-for="(item, index) in messages" :key="item.id" class="chat-item" :class="[item.role]" :id="`message-${item.id}`">
        <div v-if="item.role === 'system'" class="system-message">
          <div class="system-content">{{ item.content }}</div>
        </div>
        <div v-else-if="item.role === 'summary'" class="summary-message">
          <div class="summary-header">
            <file-icon class="summary-icon"/>
            <span class="summary-title">会议总结</span>
          </div>
          <div class="summary-content">
            <markdown-preview :content="item.content"/>
          </div>
        </div>
        <div v-else-if="item.role === 'assistant'" class="assistant-message">
          <div class="message-avatar assistant-avatar">
            <internet-icon/>
          </div>
          <div class="message-body">
            <div class="participant-name">{{ getParticipantName(item.participant_id) }}</div>
            <div v-if="item.thinking && item.thinking.length > 0" class="thinking-section">
              <div class="thinking-header">
                <check-circle-icon v-if="!isStreamLoad || index !== messages.length - 1" class="thinking-icon"/>
                <div v-else class="thinking-loading">
                  <span class="dot"></span>
                  <span class="dot"></span>
                  <span class="dot"></span>
                </div>
                <span class="thinking-text">{{
                    isStreamLoad && index === messages.length - 1 ? '思考中...' : '已深度思考'
                  }}</span>
              </div>
              <div class="thinking-content">{{ item.thinking }}</div>
            </div>
            <div v-if="item.content" class="message-content">
              <markdown-preview :content="item.content"/>
            </div>
          </div>
        </div>
        <div v-else-if="item.role === 'user'" class="user-message">
          <div class="message-body">
            <div class="message-content">
              <markdown-preview :content="item.content"/>
            </div>
          </div>
          <div class="message-avatar user-avatar">
            <user-icon/>
          </div>
        </div>
      </div>
      </div>
    </div>
    <div class="chat-toc">
      <div v-for="item in messages" :key="item.id" class="toc-item" :class="[item.role]" @click="scrollToMessage(item.id)">
        <div class="toc-bar"></div>
        <div class="toc-name">{{ getTocName(item) }}</div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import type {AiRtMessage, AiRtParticipant} from "@/entity/app/ai/roundtable";
import {CheckCircleIcon, FileIcon, InternetIcon, UserIcon} from "tdesign-icons-vue-next";

const props = defineProps({
  messages: {
    type: Array as PropType<Array<AiRtMessage>>,
    default: () => ([])
  },
  isStreamLoad: {
    type: Boolean,
    default: false
  },
  participantMap: {
    type: Map as PropType<Map<string, AiRtParticipant>>,
    default: () => new Map()
  },
  layout: {
    type: String,
  }
});

const chatContentRef = ref();

const getParticipantName = (participantId: string) => {
  const participant = props.participantMap.get(participantId);
  return participant ? participant.name : '未知';
};

const getTocName = (item: AiRtMessage) => {
  if (item.role === 'summary') {
    return '会议总结';
  } else if (item.role === 'assistant') {
    return getParticipantName(item.participant_id);
  } else if (item.role === 'user') {
    return '用户';
  }
  return '';
};

const scrollToMessage = (messageId: string) => {
  const element = document.getElementById(`message-${messageId}`);
  if (element && chatContentRef.value) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
};

defineExpose({
  scrollTo: (obj: any) => {
    chatContentRef.value.scrollTo(obj);
  },
  scrollHeight: () => chatContentRef.value?.scrollHeight,
  chatContentRef
})
</script>
<style scoped lang="less">
@import "./MeetingMessage.less";
</style>
