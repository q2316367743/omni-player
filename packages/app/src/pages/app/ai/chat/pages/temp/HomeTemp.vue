<template>
  <div class="home-chat">
    <div class="home-chat-collapse">
      <t-button theme="primary" variant="text" shape="square" @click="toggleCollapsed()" v-if="collapsed">
        <template #icon>
          <menu-fold-icon/>
        </template>
      </t-button>
    </div>
    <chat
      ref="chatRef"
      :data="items"
      :clear-history="false"
      :text-loading="loading"
      :is-stream-load="isStreamLoad"
      class="home-chat-content"
      @scroll="handleChatScroll"
    >
      <empty-result v-if="items.length === 0" title="您已进入临时对话" tip="临时对话不会显示在历史记录中，并将被完全删除"></empty-result>
      <template #content="{ item, index }">
        <chat-reasoning v-if="item.thinking && item.thinking.length > 0" expand-icon-placement="right">
          <template #header>
            <chat-loading v-if="isStreamLoad && index === 0" text="思考中..."/>
            <div v-else style="display: flex; align-items: center">
              <CheckCircleIcon style="color: var(--td-success-color-5); font-size: 20px; margin-right: 8px"/>
              <span>已深度思考</span>
            </div>
          </template>
          <chat-content :content="item.thinking"/>
        </chat-reasoning>
        <chat-content v-if="item.content.length > 0" :content="item.content" :class="[item.role]"/>
      </template>
      <template #actions="{ item }">
        <t-space size="small" class="mt-8px" style="margin-left: -16px">
          <t-tooltip content="复制">
            <t-button theme="primary" variant="text" shape="square" size="small"
                      @click="handleOperator('copy', item)">
              <template #icon>
                <copy-icon/>
              </template>
            </t-button>
          </t-tooltip>
          <t-tooltip content="删除">
            <t-button theme="danger" variant="text" shape="square" size="small"
                      @click="handleOperator('delete', item)">
              <template #icon>
                <delete-icon/>
              </template>
            </t-button>
          </t-tooltip>
          <t-tooltip content="分享">
            <t-button theme="primary" variant="text" shape="square" size="small"
                      @click="handleOperator('share', item)">
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
          :textarea-props="{placeholder: '有问题，尽管问',disabled: isStreamLoad}"
          @send="inputEnter"
        >
          <template #suffix>
            <t-button theme="danger" shape="circle" v-if="isStreamLoad" @click="handleStop">
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
import {
  Chat,
  ChatContent,
  ChatLoading,
  ChatReasoning,
  ChatSender,
  type ChatInstanceFunctions
} from '@tdesign-vue-next/chat';
import {
  ArrowDownIcon,
  CheckCircleIcon,
  CopyIcon,
  DeleteIcon,
  MenuFoldIcon,
  ShareIcon, StopIcon
} from "tdesign-icons-vue-next";
import HomeAssistantSelect from "@/pages/app/ai/chat/components/HomeAssistantSelect.vue";
import {collapsed, toggleCollapsed} from "@/pages/app/ai/chat/model";
import MessageUtil from "@/util/model/MessageUtil";
import {useSettingStore} from "@/store/GlobalSettingStore.ts";
import {askToOpenAi, type AskToOpenAiAbort} from "@/modules/ai/AiChat.ts";
import {
  type AiChatItem,
  type AiChatMessageCore,
  transferAiChatItemToChatMessageParam
} from "@/entity/app/ai/chat";
import {writeText} from "@tauri-apps/plugin-clipboard-manager";

const text = ref('');
const model = ref(useSettingStore().aiSetting.defaultChatModel);
const messages = ref<Array<AiChatMessageCore>>([]);
const isAsked = ref(false);

const chatRef = ref<ChatInstanceFunctions>();
const abort = shallowRef<AskToOpenAiAbort>();

const loading = ref(false);
const isStreamLoad = ref(false);
const isShowToBottom = ref(false);

const items = ref(new Array<AiChatItem>());

const disabled = computed(() => text.value.trim() === '');

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
    messages.value.unshift(message)
    // 上一次聊天项
    const old = messages.value[1];
    if (old) {
      if (old.model !== message.model) {
        // 服务是否变化
        // 模型发生变化
        messages.value.unshift({
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
  const model = messages.value[0]!.model;
  try {
    loading.value = true;
    isStreamLoad.value = true;
    isAsked.value = true;
    await askToOpenAi({
      messages: transferAiChatItemToChatMessageParam(messages.value),
      assistant: {
        model
      },
      onStart: () => {
        messages.value.unshift({
          role: 'assistant',
          content: '',
          model: model,
          thinking: ''
        });
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
      },
      onAborted: (a) => {
        abort.value = a;
      }
    });
  } catch (e) {
    MessageUtil.error("聊天失败", e);
    messages.value.unshift({
      role: 'error',
      content: '请求出错！原因：' + (e instanceof Error ? e.message : `${e}`),
      thinking: '',
      model: model,
    })
  } finally {
    loading.value = false;
    isStreamLoad.value = false;
    isAsked.value = false;
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
const handleOperator = (op: string, item: AiChatMessageCore) => {
  switch (op) {
    case 'copy':
      return writeText(item.content)
    case 'delete':
      break;
    case 'share':
      break;
  }
}
// 停止
const handleStop = () => {
  console.log(isStreamLoad.value, abort.value);
  if (!isStreamLoad.value) return;
  if (!abort.value) return;
  abort.value.abort("用户主动停止");
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
    width: 100%;
    overflow: hidden;
    padding:  8px;

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
