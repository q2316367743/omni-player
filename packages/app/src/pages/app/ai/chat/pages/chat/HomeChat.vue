<template>
  <div class="home-chat">
    <div class="home-chat-collapse">
      <t-button theme="primary" variant="text" shape="square" @click="toggleCollapsed()" v-if="collapsed">
        <template #icon>
          <menu-fold-icon/>
        </template>
      </t-button>
      <t-divider layout="vertical" v-if="collapsed"/>
      <div class="breadcrumb group" v-if="group" @click="handleGroup">{{ group.name }}</div>
      <div class="divider" v-if="group">/</div>
      <t-dropdown trigger="click">
        <div class="breadcrumb">
          <span class="text">{{ chatItem?.name }}</span>
          <chevron-down-icon class="icon"/>
        </div>
        <t-dropdown-menu>
          <t-dropdown-item @click="handleUpdate">编辑名称</t-dropdown-item>
          <t-dropdown-item style="color: var(--td-error-color)" @click="handleRemove">删除对话</t-dropdown-item>
        </t-dropdown-menu>
      </t-dropdown>
      <div class="ml-auto">
        <t-radio-group v-model="layout" theme="button" variant="default-filled">
          <t-radio-button value="compact">紧凑</t-radio-button>
          <t-radio-button value="relaxed">宽松</t-radio-button>
        </t-radio-group>
      </div>
    </div>
    <div :class="['home-chat-content', layout]">
      <div class="chat-list" ref="chatContentRef" @scroll="handleChatScroll">
        <div v-for="(item, index) in messages" :key="item.id" class="chat-item" :class="[item.role]">
          <div v-if="item.role === 'system'" class="system-message">
            <div class="system-content">{{ item.content }}</div>
          </div>
          <div v-else-if="item.role === 'assistant'" class="assistant-message">
            <div class="message-avatar assistant-avatar">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
            </div>
            <div class="message-body">
              <div v-if="item.thinking && item.thinking.length > 0" class="thinking-section" :class="{collapsed: isThinkingCollapsed(item.id)}">
                <div class="thinking-header" @click="toggleThinking(item.id)">
                  <chevron-right-icon class="collapse-icon" :class="{rotated: !isThinkingCollapsed(item.id)}"/>
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
                <div class="thinking-content" v-show="!isThinkingCollapsed(item.id)">
                  <markdown-preview :content="item.thinking" stream/>
                </div>
              </div>
              <div v-if="item.content" class="message-content">
                <markdown-preview :content="item.content" stream/>
              </div>
              <div class="message-footer">
                <span class="message-info">tokens used: {{ calculateTokens(item.content) }}, model: {{
                    item.model
                  }}</span>
                <div class="message-actions">
                  <t-tooltip content="复制">
                    <t-button theme="primary" variant="text" shape="square" size="small"
                              @click="handleOperator('copy', item, index)">
                      <template #icon>
                        <copy-icon/>
                      </template>
                    </t-button>
                  </t-tooltip>
                  <t-popconfirm content="是否删除此对话，删除后无法恢复" confirm-btn="删除"
                                @confirm="handleOperator('delete', item, index)">
                    <t-button theme="danger" variant="text" shape="square" size="small">
                      <template #icon>
                        <delete-icon/>
                      </template>
                    </t-button>
                  </t-popconfirm>
                </div>
              </div>
            </div>
          </div>
          <div v-else-if="item.role === 'user'" class="user-message">
            <div class="message-body">
              <div class="message-content">{{ item.content }}</div>
            </div>
            <div class="message-avatar user-avatar">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
          </div>
          <div v-else-if="item.role === 'model-change'" class="model-change-message">
            <div class="model-change-content" v-html="item.content"></div>
          </div>
          <div v-else-if="item.role === 'error'" class="error-message">
            <div class="error-content">{{ item.content }}</div>
          </div>
        </div>
      </div>
      <div class="chat-sender-wrapper">
        <t-chat-sender
          v-model="text"
          class="chat-sender"
          :textarea-props="{placeholder: '请输入消息...',disabled: isAsked}"
        >
          <template #suffix>
            <t-button theme="danger" shape="circle" v-if="isAsked" @click="handleStop">
              <template #icon>
                <stop-circle-icon/>
              </template>
            </t-button>
            <t-space size="small" v-else>
              <t-button variant="outline" shape="round" :disabled @click="onClear">
                <template #icon>
                  <delete-icon/>
                </template>
                清空输入
              </t-button>
              <t-button shape="round" :disabled @click="onSend">发送</t-button>
            </t-space>
          </template>
          <template #footer-prefix>
            <home-assistant-select v-model="model"/>
          </template>
        </t-chat-sender>
      </div>
    </div>
    <t-button v-if="isShowToBottom" variant="text" class="bottomBtn" @click="backBottom">
      <arrow-down-icon/>
    </t-button>
  </div>
</template>
<script lang="ts" setup>
import {writeText} from '@tauri-apps/plugin-clipboard-manager';
import {
  ArrowDownIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CopyIcon,
  DeleteIcon,
  MenuFoldIcon, StopCircleIcon,
} from "tdesign-icons-vue-next";
import {activeKey, collapsed, toggleCollapsed} from "@/pages/app/ai/chat/model.ts";
import HomeAssistantSelect from "@/pages/app/ai/chat/components/HomeAssistantSelect.vue";
import {
  type AiChatGroup,
  type AiChatItem,
  type AiChatMessage,
  type AiChatMessageCore,
  transferAiChatItemToChatMessageParam
} from "@/entity/app/ai/chat";
import {askToOpenAi, type AskToOpenAiAbort} from "@/modules/ai/AiChat.ts";
import {
  addAiChatMessageService,
  getAiChatGroupService, getAiChatItemService,
  listAiChatMessageService, removeAiChatMessageService,
  updateAiChatMessageService
} from "@/services/app/chat";
import MessageUtil from "@/util/model/MessageUtil.ts";
import {debounce} from "es-toolkit";
import {onRemoveChat, onRenameChat} from "@/pages/app/ai/chat/components/HomeContext.tsx";
import {useSettingStore} from "@/store/GlobalSettingStore.ts";
import {LocalName} from "@/global/LocalName.ts";

const layout = useLocalStorage(LocalName.PAGE_APP_AI_CHAT_LAYOUT, "compact")

const group = ref<AiChatGroup>();
const chatItem = ref<AiChatItem>();
// 聊天项
const messages = ref<Array<AiChatMessage>>([]);

const chatId = ref('');
const groupId = ref('');

const text = ref('');
const model = ref('');

const chatContentRef = ref<HTMLDivElement>();
const abort = shallowRef<AskToOpenAiAbort>();

const loading = ref(false);
const isStreamLoad = ref(false);
const isShowToBottom = ref(false);
const isAsked = ref(false);
const isAtBottom = ref(true);

const thinkingCollapsedMap = ref<Map<string, boolean>>(new Map());

const toggleThinking = (messageId: string) => {
  thinkingCollapsedMap.value.set(messageId, !thinkingCollapsedMap.value.get(messageId));
};

const isThinkingCollapsed = (messageId: string): boolean => {
  return thinkingCollapsedMap.value.get(messageId) ?? true;
};

const calculateTokens = (content: string): number => {
  return Math.ceil(content.length / 4);
};

tryOnMounted(async () => {

  const url = new URL(`https://example.com${activeKey.value}`);
  const mode = url.searchParams.get('mode');
  let path = url.pathname.split("/");
  chatId.value = path.pop()!;
  groupId.value = path.pop()!;
  // 获取聊天分组
  if (groupId.value) {
    group.value = await getAiChatGroupService(groupId.value) || undefined;
  }
  // 先获取聊天消息
  messages.value = await listAiChatMessageService(chatId.value);
  model.value = messages.value[messages.value.length - 1]?.model || group.value?.model || useSettingStore().aiSetting.defaultChatModel;
  if (mode === 'create') {
    // 立即提问
    onAsk();
  }
  await nextTick();
  // UI 渲染完成，滚动到底部
  backBottom();
  chatItem.value = await getAiChatItemService(chatId.value) || undefined;
});

const disabled = computed(() => text.value.trim() === '');

const onSaveContent = async (res?: AiChatMessageCore) => {
  let result: string | undefined = undefined;
  if (res) {
    // 保存内容
    result = await addAiChatMessageService(chatId.value, res);
  }
  // 并刷新列表
  messages.value = await listAiChatMessageService(chatId.value);
  return result;
};

// 模拟消息发送
const inputEnter = async (inputValue: string) => {
  // 清空问题
  text.value = '';
  try {
    // 上一次聊天项
    const old = messages.value[messages.value.length - 2];
    const message: AiChatMessageCore = {
      role: 'user',
      content: inputValue,
      model: model.value,
      thinking: '',
    };
    await onSaveContent(message)
    if (old) {
      if (old.model !== message.model) {
        // 模型发生变化
        await onSaveContent({
          role: 'model-change',
          content: `模型由<span>${old.model}</span>变为<span>${message.model}</span>`,
          model: model.value,
          thinking: ''
        });
      }
    }
    // 提问
    await onAsk();
  } catch (e) {
    MessageUtil.error("提问失败", e);
  }
}
const onClear = () => text.value = '';
const onSend = () => {
  if (disabled.value) {
    return;
  }
  inputEnter(text.value);
  text.value = '';
};

async function onAsk() {
  abort.value = undefined;
  const model = messages.value[messages.value.length - 1]!.model;
  try {
    loading.value = true;
    isStreamLoad.value = true;
    isAsked.value = true;
    // 插入回答
    const oldMessages = transferAiChatItemToChatMessageParam(messages.value);
    const messageId = await onSaveContent({
      role: 'assistant',
      content: '',
      model: model,
      thinking: ''
    })
    const onUpdateMessage = debounce(async (data: AiChatMessageCore) => {
      await updateAiChatMessageService(messageId!, {thinking: data.thinking, content: data.content});
    }, 300);
    await askToOpenAi({
      messages: oldMessages,
      assistant: {
        model
      },
      onStart: () => {
      },
      onAppend: (data, t) => {
        loading.value = false;
        if (!data) return;
        if (t) {
          messages.value[messages.value.length - 1]!.thinking += data;
        } else {
          messages.value[messages.value.length - 1]!.content += data;
          isStreamLoad.value = false;
        }
        if (isAtBottom.value) {
          nextTick(() => {
            backBottom();
          });
        }
        onUpdateMessage(messages.value[messages.value.length - 1]!);
      },
      onAborted: (a) => {
        abort.value = a;
      }
    });
  } catch (e) {
    MessageUtil.error("聊天失败", e);
    await onSaveContent({
      role: 'error',
      content: '请求出错！原因：' + (e instanceof Error ? e.message : `${e}`),
      thinking: '',
      model: model,
    });
  } finally {
    loading.value = false;
    isStreamLoad.value = false;
    isAsked.value = false;
    // 保存
    // await onSaveContent();
  }
}

// 是否显示回到底部按钮
const handleChatScroll = function (e: Event) {
  const target = e.target as HTMLDivElement;
  const scrollTop = target.scrollTop;
  const scrollHeight = target.scrollHeight;
  const clientHeight = target.clientHeight;
  isShowToBottom.value = scrollHeight - scrollTop - clientHeight > 100;
  isAtBottom.value = scrollHeight - scrollTop - clientHeight < 50;
};
// 滚动到底部
const backBottom = () => {
  if (chatContentRef.value) {
    chatContentRef.value.scrollTo({
      top: chatContentRef.value.scrollHeight,
      behavior: 'smooth',
    });
  }
};
// 复制
const handleOperator = (op: string, item: AiChatMessage, index: number) => {
  switch (op) {
    case 'copy':
      return writeText(item.content)
        .then(() => MessageUtil.success("已复制"))
        .catch(e => MessageUtil.error("复制失败", e));
    case 'delete':
      handleDeleteChat(index);
      break;
    case 'share':
      break;
  }
}
// 停止
const handleStop = () => {
  if (!abort.value) return;
  abort.value.abort("用户主动停止");
}
const handleUpdate = () => {
  onRenameChat(chatItem.value!, name => {
    chatItem.value!.name = name;
  });
}
const handleRemove = () => {
  onRemoveChat(groupId.value, chatId.value);
}
const handleGroup = () => {
  activeKey.value = `/home/group/${group.value?.id}`;
}
const handleDeleteChat = async (index: number) => {
  const old = messages.value[index];
  // 删除提问
  await removeAiChatMessageService(old!.id)
  onSaveContent().then(() => MessageUtil.success("已删除")).catch(e => MessageUtil.error("删除失败", e));
}


</script>
<style scoped lang="less">
@import "./HomeChat.less";
</style>
