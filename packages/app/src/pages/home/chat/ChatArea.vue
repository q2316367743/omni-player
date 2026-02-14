<template>
  <div class="chat-area">
    <div class="chat-header">
      <t-popup trigger="click" placement="bottom-left" :showArrow="true">
        <div class="chat-header-left">
          <XhAvatar :value="friend.avatar" :size="40" shape="circle"/>
          <div class="chat-header-info">
            <h3 class="chat-header-name">{{ friend.name }}</h3>
            <p class="chat-header-status">在线</p>
          </div>
        </div>
        <template #content>
          <ChatFriendStaticDetail :friend="friend"/>
        </template>
      </t-popup>
      <div class="chat-header-actions">
        <t-button variant="text" shape="circle">
          <t-icon name="phone"/>
        </t-button>
        <t-button variant="text" shape="circle">
          <t-icon name="ellipsis"/>
        </t-button>
      </div>
    </div>

    <div class="chat-messages local-scroll" ref="messagesContainer">
      <div class="message-date-divider">
        <span class="date-divider-text">今天</span>
      </div>
      <MessageBubble
        v-for="message in messages"
        :key="message.id"
        :message="message"
        :friend="friend"
      />
    </div>

    <ChatInput
      @send="handleSend"
      :support-think="supportThink"
      :think-enabled="thinkEnabled"
      :is-loading="isLoading"
      :summary-loading="summaryLoading"
      @toggle-think="handleToggleThink"
      @toggle-summary="handleToggleSummary"
    />
  </div>
</template>

<script lang="ts" setup>
import {useSettingStore} from '@/store'
import type {MemoChatContent, MemoFriendStaticView} from '@/entity/memo'
import {listMemoChatTimestamp, saveMemoChat} from '@/services/memo/chat'
import {aiMemoChat, setupChatL2Summary, triggerChatL1SummaryActive} from '@/modules/ai/memo'
import {debounce} from '@/pages/memo/chat/utils.ts'
import XhAvatar from '@/components/avatar/XhAvatar.vue'
import MessageBubble from './MessageBubble.vue'
import ChatInput from './ChatInput.vue'
import ChatFriendStaticDetail from "@/pages/home/chat/ChatFriendStaticDetail.vue";
import {updateMemoFriendDynamic} from "@/services/memo";
import {triggerChatL1Summary} from "@/modules/ai/memo/summary/TriggerChatL1Summary.ts";
import {logDebug, logError} from "@/lib/log.ts";
import MessageUtil from "@/util/model/MessageUtil.ts";
import type {AiChatRole} from "@/global/CommonType.ts";

const props = defineProps<{
  friend: MemoFriendStaticView
}>()

const settingStore = useSettingStore()
const messagesContainer = ref<HTMLElement>()
const isLoading = ref(false)
const thinkEnabled = ref(false)
const summaryLoading = ref(false)

const supportThink = computed(() => {
  return settingStore.supportThink(props.friend.model)
})

const messages = ref<Array<{
  id: string
  sender: AiChatRole | 'summary'
  content: Array<MemoChatContent>
  timestamp: number
}>>([])

const createDebouncedSave = debounce(async (chatData: any) => {
  try {
    await saveMemoChat(chatData)
  } catch (error) {
    console.error('保存消息失败:', error)
  }
}, 1000)

const loadHistoryMessages = async () => {
  try {
    const historyChats = await listMemoChatTimestamp(props.friend.id, Date.now(), 50)
    messages.value = historyChats.map(chat => ({
      id: chat.id,
      sender: chat.role,
      content: chat.content,
      timestamp: chat.created_at
    }))
  } catch (error) {
    console.error('加载历史消息失败:', error)
    messages.value = []
  }
}

const handleSend = async (content: string) => {
  const userMessage = {
    id: Date.now().toString(),
    sender: 'user' as const,
    content: [{type: 'text' as const, content}],
    timestamp: Date.now()
  }

  messages.value.push(userMessage)

  // 保存用户消息不需要防抖
  await saveMemoChat({
    friend_id: props.friend.id,
    role: 'user',
    content: userMessage.content,
    compression_level: 0,
    archived_to_summary_id: ''
  });
  // 更新最近聊天时间
  await updateMemoFriendDynamic(props.friend.id, {
    last_interaction: Date.now()
  });


  const assistantMessage = reactive({
    id: (Date.now() + 1).toString(),
    sender: 'assistant' as const,
    content: [] as Array<MemoChatContent>,
    timestamp: Date.now()
  })

  try {
    isLoading.value = true


    messages.value.push(assistantMessage)

    await aiMemoChat({
      friend: props.friend,
      think: thinkEnabled.value,
      onMessage: async (msg) => {
        if (msg.type === 'text' || msg.type === 'think') {
          const lastContent = assistantMessage.content[assistantMessage.content.length - 1]
          if (lastContent && lastContent.type === msg.type) {
            (lastContent as any).content += msg.content
          } else {
            assistantMessage.content.push({type: msg.type, content: msg.content} as MemoChatContent)
          }
        } else if (msg.type === 'mcp') {
          assistantMessage.content.push(msg)
        }
      }
    })


  } catch (error) {
    console.error('发送消息失败:', error)
    const errorMessage = {
      id: (Date.now() + 2).toString(),
      sender: 'assistant' as const,
      content: [{type: 'text' as const, content: '发送失败，请重试'}],
      timestamp: Date.now()
    }
    messages.value.push(errorMessage)
  } finally {
    isLoading.value = false;
    // 无论成功或者失败都要保存
    createDebouncedSave({
      friend_id: props.friend.id,
      role: 'assistant',
      content: assistantMessage.content,
      compression_level: 0,
      token_count: assistantMessage.content.reduce((sum, c) => {
        if (c.type === 'text' || c.type === 'think') {
          return sum + c.content.length
        }
        return sum
      }, 0)
    })
    triggerChatL1Summary(props.friend).then(() => {
      logDebug("[ChatArea] 触发 L1 总结完成")
    }).catch(e => {
      logError("[ChatArea] 触发 L1 总结失败", e)
    })
  }
}

const handleToggleThink = () => {
  thinkEnabled.value = !thinkEnabled.value
}

const handleToggleSummary = async () => {
  if (summaryLoading.value) return;
  try {
    summaryLoading.value = true;
    MessageUtil.info('正在触发总结，请稍候...');
    logDebug("[ChatArea] 触发 L1 总结")
    await triggerChatL1SummaryActive(props.friend, "主动触发", true);
    logDebug("[ChatArea] 触发 L2 总结")
    await setupChatL2Summary(props.friend, '用户主动触发')
    MessageUtil.success('触发总结成功');
    await loadHistoryMessages();
  } catch (e) {
    MessageUtil.error('触发总结失败', e);
    logDebug('[ChatArea] 触发总结失败', e)
  } finally {
    summaryLoading.value = false
  }
}

watch(() => props.friend.id, async () => {
  thinkEnabled.value = false
  await loadHistoryMessages()
}, {immediate: true})

watch(() => messages.value.length, () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}, {flush: 'post'})

</script>

<style scoped lang="less">
@import 'less/ChatArea.less';
</style>
