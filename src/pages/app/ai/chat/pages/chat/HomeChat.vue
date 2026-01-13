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
    </div>
    <chat
      ref="chatRef"
      :data="messages"
      :clear-history="false"
      :text-loading="loading"
      :is-stream-load="isStreamLoad"
      class="home-chat-content"
      @scroll="handleChatScroll"
    >
      <template #content="{ item, index }">
        <chat-reasoning v-if="item.thinking && item.thinking.length > 0 && item.role !== 'system'"
                        expand-icon-placement="right">
          <template #header>
            <chat-loading v-if="isStreamLoad && index === 0" text="思考中..."/>
            <div v-else style="display: flex; align-items: center">
              <CheckCircleIcon style="color: var(--td-success-color-5); font-size: 20px; margin-right: 8px"/>
              <span>已深度思考</span>
            </div>
          </template>
          <chat-content :content="item.thinking" class="reason"/>
        </chat-reasoning>
        <chat-content v-if="item.content.length > 0 && item.role !== 'system'" :content="item.content"
                      :class="[item.role]" class="typo"/>
      </template>
      <template #actions="{ item, index }">
        <t-space size="small" class="mt-8px">
          <t-tooltip content="复制">
            <t-button theme="primary" variant="text" shape="square" size="small"
                      @click="handleOperator('copy', item, index)">
              <template #icon>
                <copy-icon/>
              </template>
            </t-button>
          </t-tooltip>
          <t-tooltip content="收藏">
            <t-button theme="primary" variant="text" shape="square" size="small"
                      @click="handleOperator('coll', item, index)">
              <template #icon>
                <collection-icon/>
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
          <t-tooltip content="分享">
            <t-button theme="primary" variant="text" shape="square" size="small"
                      @click="handleOperator('share', item, index)" disabled>
              <template #icon>
                <share-icon/>
              </template>
            </t-button>
          </t-tooltip>
        </t-space>
      </template>
      <template #footer>
        <chat-sender
          v-model="text"
          class="chat-sender"
          :textarea-props="{placeholder: '请输入消息...',disabled: isAsked}"
          @send="inputEnter"
        >
          <template #suffix>
            <t-button theme="danger" shape="circle" v-if="isAsked" @click="handleStop">
              <template #icon>
                <stop-icon/>
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
          <template #prefix>
            <home-assistant-select v-model="model"/>
          </template>
        </chat-sender>
      </template>
    </chat>
    <t-button v-if="isShowToBottom" variant="text" class="bottomBtn" @click="backBottom">
      <arrow-down-icon/>
    </t-button>
  </div>
</template>
<script lang="ts" setup>
import { writeText } from '@tauri-apps/plugin-clipboard-manager';
import {
  Chat,
  ChatContent,
  type ChatInstanceFunctions,
  ChatLoading,
  ChatReasoning,
  ChatSender
} from '@tdesign-vue-next/chat';
import {
  ArrowDownIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  CollectionIcon,
  CopyIcon,
  DeleteIcon,
  MenuFoldIcon,
  ShareIcon,
  StopIcon
} from "tdesign-icons-vue-next";
import {activeKey, collapsed, toggleCollapsed} from "@/pages/app/ai/chat/model.ts";
import HomeAssistantSelect from "@/pages/app/ai/chat/components/HomeAssistantSelect.vue";
import {
  type AiChatGroup, type AiChatItem, type AiChatMessage, type AiChatMessageCore,
  transferAiChatItemToChatMessageParam
} from "@/entity/app/ai/chat";
import {askToOpenAi, type AskToOpenAiAbort} from "@/util/lang/ChatUtil";
import {
  addAiChatMessageService,
  getAiChatGroupService,
  listAiChatMessageService,
  updateAiChatMessageService
} from "@/services/app/chat";
import MessageUtil from "@/util/model/MessageUtil.ts";
import {debounce} from "es-toolkit";
import {onRemoveChat, onRenameChat} from "@/pages/app/ai/chat/components/HomeContext.tsx";

const group = ref<AiChatGroup>();
const chatItem = ref<AiChatItem>();
// 聊天项
const messages = ref<Array<AiChatMessage>>([]);

const chatId = ref('');
const groupId = ref('');

const text = ref('');
const model = ref('');

const chatRef = ref<ChatInstanceFunctions>();
const abort = shallowRef<AskToOpenAiAbort>();

const loading = ref(false);
const isStreamLoad = ref(false);
const isShowToBottom = ref(false);
const isAsked = ref(false);

tryOnMounted(async () => {

  const url = new URL(activeKey.value);
  const mode = url.searchParams.get('mode');
  let path = url.pathname.split("/");
  chatId.value = path.pop()!;
  groupId.value = path.pop()!;
  // 先获取聊天消息
  messages.value = await listAiChatMessageService(chatId.value);
  if (mode === 'create') {
    // 立即提问
    onAsk();
  }
  // 获取聊天分组
  if (groupId.value) {
    group.value = await getAiChatGroupService(groupId.value) || undefined;
  }
});

const disabled = computed(() => text.value.trim() === '');

const onSaveContent = async (res?: Array<AiChatMessageCore>) => {
  if (res && res.length > 0) {
    // 保存内容
    await addAiChatMessageService(chatId.value, res);
  }
  // 并刷新列表
  messages.value = await listAiChatMessageService(chatId.value);
};

// 模拟消息发送
const inputEnter = async (inputValue: string) => {
  // 清空问题
  text.value = '';
  try {
    const message: AiChatMessageCore = {
      role: 'user',
      content: inputValue,
      model: model.value,
      thinking: '',
    };
    const pedMessages = [message];
    // 上一次聊天项
    const old = messages.value[1];
    if (old) {
      if (old.model !== message.model) {
        // 服务是否变化
        // 模型发生变化
        pedMessages.push({
          role: 'model-change',
          content: `模型由<span>${old.model}</span>变为<span>${message.model}</span>`,
          model: model.value,
          thinking: ''
        });
      }
    }
    // 保存内容
    await onSaveContent(pedMessages);
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
  const model = messages.value[0]!.model;
  try {
    loading.value = true;
    isStreamLoad.value = true;
    isAsked.value = true;
    let messageId = '';
    const onUpdateMessage = debounce(async (data: AiChatMessageCore) => {
      if (messageId) {
        await updateAiChatMessageService(messageId, data);
      }
    }, 300);
    await askToOpenAi({
      messages: transferAiChatItemToChatMessageParam(messages.value),
      assistant: {
        model
      },
      onStart: () => {
        onSaveContent([{
          role: 'assistant',
          content: '',
          model: model,
          thinking: ''
        }])
        messageId = messages.value[0]!.id;
      },
      onAppend: (data, t) => {
        loading.value = false;
        if (!data) return;
        if (t) {
          messages.value[0]!.thinking += data;
        } else {
          messages.value[0]!.content += data;
          isStreamLoad.value = false;
        }
        // 更新
        onUpdateMessage(messages.value[0]!);
      },
      onAborted: (a) => {
        abort.value = a;
      }
    });
  } catch (e) {
    MessageUtil.error("聊天失败", e);
    await onSaveContent([{
      role: 'error',
      content: '请求出错！原因：' + (e instanceof Error ? e.message : `${e}`),
      thinking: '',
      model: model,
    }]);
  } finally {
    loading.value = false;
    isStreamLoad.value = false;
    isAsked.value = false;
    // 保存
    await onSaveContent();
  }
}

// 是否显示回到底部按钮
const handleChatScroll = function (context: any) {
  const {e} = context;
  const scrollTop = (e.target as HTMLDivElement)?.scrollTop || 0;
  isShowToBottom.value = scrollTop < 0;
};
// 滚动到底部
const backBottom = () => {
  chatRef.value?.scrollToBottom?.({
    behavior: 'smooth',
  });
};
// 复制
const handleOperator = (op: string, item: AiChatMessage, index: number) => {
  switch (op) {
    case 'copy':
      return writeText(item.content)
    case 'delete':
      handleDeleteChat(index);
      break;
    case 'share':
      break;
  }
}
// 停止
const handleStop = () => {
  if (!isStreamLoad.value) return;
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
const handleDeleteChat = (index: number) => {
  messages.value.splice(index, 1);
  // 删除提问
  while (true) {
    const old = messages.value[index];
    if (!old) break;
    if (old.role === 'assistant') break;
    // 删除所有非助手回答
    messages.value.splice(index, 1);
  }
  // TODO：删除
  onSaveContent().then(() => MessageUtil.success("已删除")).catch(e => MessageUtil.error("删除失败", e));
}


</script>
<style scoped lang="less">
.home-chat {
  position: relative;

  .home-chat-collapse {
    display: flex;
    align-items: center;
    height: 32px;
    border-bottom: 1px solid var(--td-border-level-2-color);
    padding: 4px;

    .divider {
      margin: 0 8px;
    }

    .breadcrumb {
      user-select: none;
      cursor: pointer;
      border-radius: var(--td-radius-default);
      transition: background-color 0.3s ease-in-out;
      padding: 4px 8px;

      &:hover {
        background-color: var(--td-bg-color-container-hover);
      }

      &:active {
        background-color: var(--td-bg-color-container-active);
      }

      &.group {
        color: var(--td-text-color-secondary);
      }

      .icon {
        margin-left: 4px;
      }
    }
  }

  .home-chat-content {
    height: calc(100vh - 41px);
    overflow: hidden;
    padding: 8px 0;

    :deep(.t-chat__inner) {
      width: 100%;
      max-width: 800px;
      margin: 0 auto var(--td-comp-margin-l);
    }

    :deep(.t-chat__footer) {
      width: 100%;
      max-width: 800px;
      margin: 0 auto;
    }

  }

  .bottomBtn {
    position: absolute;
    left: 50%;
    margin-left: -20px;
    bottom: 160px;
    padding: 0;
    border: 0;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    box-shadow: 0 8px 10px -5px rgba(0, 0, 0, 0.08), 0px 16px 24px 2px rgba(0, 0, 0, 0.04),
    0px 6px 30px 5px rgba(0, 0, 0, 0.05);
    background-color: var(--td-bg-color-container);
  }

}
</style>
