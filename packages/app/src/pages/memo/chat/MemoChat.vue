<template>
  <div class="memo-chat-container monica-container">
    <!-- 顶部导航栏 -->
    <div class="chat-header" v-if="!showSummary">
      <t-button theme="default" variant="text" @click="handleBack" shape="round" class="back-btn">
        <template #icon>
          <chevron-left-icon />
        </template>
        返回
      </t-button>
      <div class="friend-info" v-if="friend">
        <div class="friend-avatar-wrap">
          <XhAvatar :value="friend.avatar" alt="avatar" class="friend-avatar" />
        </div>
        <div class="friend-details">
          <h3 class="friend-name">{{ friend.name }}</h3>
          <p class="friend-personality">{{ getArchetypeText(friend.archetype) }}</p>
        </div>
      </div>
      <t-popconfirm content="是否结束对话？结束后只能开启新的对话" placement="bottom-right" @confirm="handleEndChat">
        <t-button theme="danger" variant="outline" shape="round" :disabled="isEnding">
          {{ isEnding ? '总结中...' : '结束对话' }}
        </t-button>
      </t-popconfirm>
    </div>

    <!-- 总结页面 -->
    <div class="summary-container" v-if="showSummary && summaryData">
      <div class="summary-header">
        <t-button theme="default" variant="text" @click="handleBack" shape="round" class="back-btn">
          返回
        </t-button>
        <h2 class="summary-title">{{ summaryData.title }}</h2>
      </div>
      <div class="summary-content local-scroll">
        <div class="summary-card monica-card">
          <div class="summary-section">
            <h3 class="section-title">对话总结</h3>
            <p class="summary-text">{{ summaryData.summary }}</p>
          </div>
          <div class="summary-section" v-if="summaryData.key_insights && Object.keys(summaryData.key_insights).length > 0">
            <h3 class="section-title">关键洞察</h3>
            <div class="insights-list">
              <div class="insight-item" v-for="(value, key) in summaryData.key_insights" :key="key">
                <span class="insight-key">{{ key }}</span>
                <span class="insight-value">{{ value }}</span>
              </div>
            </div>
          </div>
          <div class="summary-section ai-journal-section">
            <div class="ai-journal-header" @click="toggleAiJournal">
              <h3 class="section-title">AI 小记</h3>
              <t-icon :name="showAiJournal ? 'chevron-up' : 'chevron-down'" class="toggle-icon" />
            </div>
            <div class="ai-journal-content" v-if="showAiJournal">
              <p class="ai-journal-text">{{ summaryData.ai_journal }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载动画 -->
    <div class="loading-overlay" v-if="isEnding">
      <div class="loading-spinner"></div>
      <p class="loading-text">AI 正在总结对话...</p>
    </div>

    <!-- 聊天消息区域 -->
    <div class="chat-messages local-scroll" ref="messagesContainer" v-if="!showSummary">
      <div v-if="messages.length === 0" class="empty-state">
        <p class="empty-text">开始与 {{ friend?.name }} 聊天吧！</p>
      </div>
      <div v-else>
        <div 
          v-for="(msg, index) in messages" 
          :key="index" 
          class="message-wrapper" 
          :class="msg.role"
        >
          <div v-if="msg.role === 'assistant'" class="message-avatar">
            <XhAvatar :value="friend?.avatar" alt="avatar" class="avatar" />
          </div>
          <div v-if="msg.role === 'user'" class="message-avatar">
            <XhAvatar value="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=user%20avatar%20profile%20picture&image_size=square" alt="avatar" class="avatar" />
          </div>
          <div v-if="msg.role === 'error'" class="message-avatar">
            <XhAvatar value="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=error%20icon%20red%20warning&image_size=square" alt="avatar" class="avatar" />
          </div>
          <div class="message-content-wrapper">
            <div class="message" :class="msg.role">
              <div class="message-bubble monica-card">
                <MarkdownPreview :content="msg.content" />
              </div>
            </div>
            <span class="message-time">{{ formatDate(msg.created_at) }}</span>
          </div>
        </div>
        <div v-if="isLoading" class="typing-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="chat-input-area" v-if="!showSummary">
      <t-textarea
        :autosize="{minRows: 1, maxRows: 5}"
        v-model="inputMessage"
        placeholder="输入消息..."
        :disabled="isLoading"
      />
      <t-button 
        theme="primary" 
        shape="round" 
        @click="sendMessage"
        :disabled="isLoading || !inputMessage.trim()"
        class="send-btn"
      >
        发送
      </t-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import MarkdownPreview from "@/components/common/MarkdownPreview.vue";
import { getArchetypeText } from "@/entity/memo/MemoFriend";
import { ChevronLeftIcon } from "tdesign-icons-vue-next";
import type {MemoChatFuncResult} from "@/pages/memo/chat/MemoChatFunc.ts";
import {formatDate} from "@/util/lang/DateUtil.ts";

const router = useRouter();

const prop = defineProps({
  context: {
    type: Object as PropType<MemoChatFuncResult>,
    required: true
  }
});

const inputMessage = ref('');
const messagesContainer = ref<HTMLElement>();

const {friend,messages,isLoading,isEnding,showSummary, summaryData, init,handleEndChat, handleSend} = prop.context;

const showAiJournal = ref(false);

// 处理发送消息
async function sendMessage() {
  handleSend(inputMessage.value);
  inputMessage.value = '';
}

// 处理返回
function handleBack() {
  router.back();
}

// 切换 AI 小记显示
function toggleAiJournal() {
  showAiJournal.value = !showAiJournal.value;
}

onMounted(() => {
  init(messagesContainer.value);
})

</script>

<style scoped lang="less">
@import "MemoChat.less";
</style>
