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
          <div class="friend-status" :class="moodToStatus(friend.current_mood)"></div>
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
            <span class="message-time">{{ formatTime(msg.created_at) }}</span>
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
        @click="handleSend"
        :disabled="isLoading || !inputMessage.trim()"
        class="send-btn"
      >
        发送
      </t-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {completeMemoFriendSession, getMemoSession, listMemoMessage} from "@/services/memo";
import { completeMemoSession } from "@/services/memo/MemoSessionService.ts";
import MessageUtil from "@/util/model/MessageUtil.ts";
import { useMemoFriendStore } from "@/store";
import type { MemoFriendView, MemoMessage, MemoSession } from "@/entity/memo";
import { getArchetypeText, moodToStatus } from "@/entity/memo/MemoFriend";
import { aiMemoChat } from "@/modules/ai/memo/AiMemoChat.ts";
import { aiMemoChatSummary } from "@/modules/ai/memo/AiMemoChatSummary.ts";
import type { AskToOpenAiAbort } from "@/modules/ai";
import MarkdownPreview from "@/components/common/MarkdownPreview.vue";
import { ChevronLeftIcon } from "tdesign-icons-vue-next";
import {
  createDebouncedSaveMessage,
  formatTime,
  scrollToBottom,
  checkAndTriggerMidSummary,
  generateUserMessageTimestamp,
} from "./utils";
import { logDebug, logError } from "@/lib/log";

const route = useRoute();
const router = useRouter();

const session = shallowRef<MemoSession>();
const friend = shallowRef<MemoFriendView>();
const messages = ref<Array<MemoMessage>>([]);
const inputMessage = ref('');
const isLoading = ref(false);
const messagesContainer = ref<HTMLElement>();
const abortController = ref<AskToOpenAiAbort>();

const isEnding = ref(false);
const showSummary = ref(false);
const showAiJournal = ref(false);
const summaryData = ref<{ title: string; summary: string; key_insights: any; ai_journal: string } | null>(null);

// 中间总结相关
const isGeneratingMidSummary = ref(false);

// 防抖保存消息
const debouncedSaveMessage = createDebouncedSaveMessage();

// 处理发送消息
async function handleSend() {
  const content = inputMessage.value.trim();
  if (!content || isLoading.value || !friend.value || !session.value) return;

  logDebug('[MemoChat] 开始发送消息', { contentLength: content.length });

  // 检查是否需要中间总结（在发送用户消息之前）
  const midSummaryTriggered = await checkAndTriggerMidSummary({
    messages: messages.value,
    friend: friend.value,
    sessionId: session.value.id,
    isGenerating: isGeneratingMidSummary,
  });

  if (midSummaryTriggered) {
    logDebug('[MemoChat] 中间总结已触发并完成');
  }

  // 清空输入框
  inputMessage.value = '';

  // 生成用户消息的 created_at：确保在 summary 之后
  const userCreatedAt = generateUserMessageTimestamp(messages.value);

  // 添加用户消息
  const userMessage: MemoMessage = {
    id: Date.now().toString(),
    session_id: session.value.id,
    role: 'user',
    content,
    created_at: userCreatedAt,
    updated_at: userCreatedAt,
  };
  messages.value.push(userMessage);
  scrollToBottom(messagesContainer.value);

  logDebug('[MemoChat] 用户消息已添加到本地', { createdAt: userCreatedAt });

  // 保存用户消息
  debouncedSaveMessage(
    {
      session_id: session.value.id,
      role: 'user',
      content,
    },
    userCreatedAt
  );

  // 开始 AI 回复
  isLoading.value = true;
  logDebug('[MemoChat] 开始调用 AI 回复');

  try {
    let assistantMessageContent = '';
    await aiMemoChat({
      friend: friend.value,
      chat: content,
      messages: messages.value,
      onStart: async () => {
        logDebug('[MemoChat] AI 回复开始');
      },
      onAborted: (controller) => {
        abortController.value = controller;
      },
      onMessage: async (data) => {
        assistantMessageContent += data;
        // 实时更新消息内容
        const lastMessage = messages.value[messages.value.length - 1];
        if (lastMessage && lastMessage.role === 'assistant') {
          lastMessage.content = assistantMessageContent;
        } else {
          // 添加新的助手消息
          const assistantMessage: MemoMessage = {
            id: (Date.now() + 1).toString(),
            session_id: session.value!.id,
            role: 'assistant',
            content: assistantMessageContent,
            created_at: Date.now(),
            updated_at: Date.now(),
          };
          messages.value.push(assistantMessage);
        }
        scrollToBottom(messagesContainer.value);
      },
      onError: async (e) => {
        logError('[MemoChat] AI 回复错误', e);
        const errorMessage = e?.message || '聊天出错，请重试';
        MessageUtil.error(errorMessage);
        const errorCreatedAt = Date.now();
        const errorMessageObj: MemoMessage = {
          id: (Date.now() + 2).toString(),
          session_id: session.value!.id,
          role: 'error',
          content: errorMessage,
          created_at: errorCreatedAt,
          updated_at: errorCreatedAt,
        };
        messages.value.push(errorMessageObj);
        scrollToBottom(messagesContainer.value);
        debouncedSaveMessage({
          session_id: session.value!.id,
          role: 'error',
          content: errorMessage,
        }, errorCreatedAt);
      },
      onFinally: async () => {
        isLoading.value = false;
        logDebug('[MemoChat] AI 回复完成', { contentLength: assistantMessageContent.length });
        // 保存助手消息
        if (assistantMessageContent) {
          debouncedSaveMessage({
            session_id: session.value!.id,
            role: 'assistant',
            content: assistantMessageContent,
          });
        }
      },
    });
  } catch (error) {
    logError('[MemoChat] 发送消息失败', error);
    MessageUtil.error('发送失败，请重试', error);
    isLoading.value = false;
  }
}

// 处理返回
function handleBack() {
  router.back();
}

// 切换 AI 小记显示
function toggleAiJournal() {
  showAiJournal.value = !showAiJournal.value;
}

// 处理结束对话
async function handleEndChat() {
  if (!friend.value || messages.value.length === 0) {
    MessageUtil.warning('暂无聊天记录可总结');
    return;
  }

  isEnding.value = true;
  try {
    summaryData.value = await aiMemoChatSummary({
      friend: friend.value,
      sessionId: session.value!.id,
      messages: messages.value,
    });
    showSummary.value = true;

    if (session.value) {
      await completeMemoSession(session.value.id);
      await completeMemoFriendSession(friend.value.id);
      // 刷新 session 信息
      await useMemoFriendStore().loadChatSession();
      // 刷新朋友信息
      await useMemoFriendStore().loadFriends();
    }
  } catch (error) {
    console.error('总结失败:', error);
    MessageUtil.error('总结失败，请重试');
  } finally {
    isEnding.value = false;
  }
}

onMounted(async () => {
  logDebug('[MemoChat] 组件挂载，开始初始化', { sessionId: route.params.id });

  try {
    // 获取 session
    session.value = await getMemoSession(route.params.id as string);
    if (!session.value) {
      logError('[MemoChat] 会话不存在', { sessionId: route.params.id });
      router.back();
      MessageUtil.error('会话不存在');
      return;
    }
    logDebug('[MemoChat] 会话已获取', { sessionId: session.value.id });

    // 获取朋友
    friend.value = useMemoFriendStore().friends.find((e) => e.id === session.value?.friend_id);
    if (!friend.value) {
      logError('[MemoChat] 朋友不存在', { friendId: session.value?.friend_id });
      router.back();
      MessageUtil.error('朋友不存在');
      return;
    }
    logDebug('[MemoChat] 朋友信息已获取', { friendId: friend.value.id, friendName: friend.value.name });

    // 获取聊天记录
    messages.value = await listMemoMessage(session.value.id);
    logDebug('[MemoChat] 聊天记录已加载', { messageCount: messages.value.length });

    scrollToBottom(messagesContainer.value);

    if (messages.value.length === 0) {
      logDebug('[MemoChat] 首次对话，开始初始化 AI 问候');
      // 第一次，需要直接获取
      isLoading.value = true;
      try {
        let assistantMessageContent = '';
        await aiMemoChat({
          friend: friend.value,
          chat: '',
          messages: messages.value,
          onStart: async () => {
            logDebug('[MemoChat] AI 问候开始');
          },
          onAborted: (controller) => {
            abortController.value = controller;
          },
          onMessage: async (data) => {
            assistantMessageContent += data;
            // 实时更新消息内容
            const lastMessage = messages.value[messages.value.length - 1];
            if (lastMessage && lastMessage.role === 'assistant') {
              lastMessage.content = assistantMessageContent;
            } else {
              // 添加新的助手消息
              const assistantMessage: MemoMessage = {
                id: Date.now().toString(),
                session_id: session.value!.id,
                role: 'assistant',
                content: assistantMessageContent,
                created_at: Date.now(),
                updated_at: Date.now(),
              };
              messages.value.push(assistantMessage);
            }
            scrollToBottom(messagesContainer.value);
          },
          onError: async (e) => {
            logError('[MemoChat] AI 问候错误', e);
            const errorMessage = e?.message || '聊天出错，请重试';
            MessageUtil.error(errorMessage);
            const errorCreatedAt = Date.now();
            const errorMessageObj: MemoMessage = {
              id: (Date.now() + 2).toString(),
              session_id: session.value!.id,
              role: 'error',
              content: errorMessage,
              created_at: errorCreatedAt,
              updated_at: errorCreatedAt,
            };
            messages.value.push(errorMessageObj);
            scrollToBottom(messagesContainer.value);
            debouncedSaveMessage({
              session_id: session.value!.id,
              role: 'error',
              content: errorMessage,
            }, errorCreatedAt);
          },
          onFinally: async () => {
            isLoading.value = false;
            logDebug('[MemoChat] AI 问候完成', { contentLength: assistantMessageContent.length });
            // 保存助手消息
            if (assistantMessageContent) {
              debouncedSaveMessage({
                session_id: session.value!.id,
                role: 'assistant',
                content: assistantMessageContent,
              });
            }
          },
        });
      } catch (error) {
        logError('[MemoChat] 初始化聊天失败', error);
        MessageUtil.error('初始化聊天失败，请重试');
        isLoading.value = false;
      }
    }

    logDebug('[MemoChat] 组件初始化完成');
  } catch (e) {
    logError('[MemoChat] 初始化失败', e);
    MessageUtil.error('初始化失败', e);
    router.back();
  }
});
</script>

<style scoped lang="less">
@import "MemoChat.less";
</style>
