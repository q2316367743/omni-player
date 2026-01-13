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
    <div class="home-chat-content">
      <div class="chat-list" ref="chatContentRef" @scroll="handleChatScroll">
        <div v-for="(item, index) in messages" :key="item.id" class="chat-item" :class="[item.role]">
          <div v-if="item.role === 'system'" class="system-message">
            <div class="system-content">{{ item.content }}</div>
          </div>
          <div v-else-if="item.role === 'assistant'" class="assistant-message">
            <div class="message-avatar assistant-avatar">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
            </div>
            <div class="message-body">
              <div v-if="item.thinking && item.thinking.length > 0" class="thinking-section">
                <div class="thinking-header">
                  <check-circle-icon v-if="!isStreamLoad || index !== messages.length - 1" class="thinking-icon"/>
                  <div v-else class="thinking-loading">
                    <span class="dot"></span>
                    <span class="dot"></span>
                    <span class="dot"></span>
                  </div>
                  <span class="thinking-text">{{ isStreamLoad && index === messages.length - 1 ? '思考中...' : '已深度思考' }}</span>
                </div>
                <div class="thinking-content">
                  <markdown-preview :content="item.thinking"/></div>
              </div>
              <div v-if="item.content" class="message-content">
                <markdown-preview :content="item.content"/>
              </div>
              <div class="message-footer">
                <span class="message-info">tokens used: {{ calculateTokens(item.content) }}, model: {{ item.model }}</span>
                <div class="message-actions">
                  <t-tooltip content="复制">
                    <t-button theme="primary" variant="text" shape="square" size="small" @click="handleOperator('copy', item, index)">
                      <template #icon>
                        <copy-icon/>
                      </template>
                    </t-button>
                  </t-tooltip>
                  <t-popconfirm content="是否删除此对话，删除后无法恢复" confirm-btn="删除" @confirm="handleOperator('delete', item, index)">
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
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
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
  CopyIcon,
  DeleteIcon,
  MenuFoldIcon,
  StopIcon
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
import {askToOpenAi, type AskToOpenAiAbort} from "@/util/lang/ChatUtil";
import {
  addAiChatMessageService,
  getAiChatGroupService, getAiChatItemService,
  listAiChatMessageService,
  updateAiChatMessageService
} from "@/services/app/chat";
import MessageUtil from "@/util/model/MessageUtil.ts";
import {debounce} from "es-toolkit";
import {onRemoveChat, onRenameChat} from "@/pages/app/ai/chat/components/HomeContext.tsx";
import {useSettingStore} from "@/store/GlobalSettingStore.ts";

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
      messages: transferAiChatItemToChatMessageParam(messages.value),
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
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--td-bg-color-container);

  .home-chat-collapse {
    display: flex;
    align-items: center;
    height: 40px;
    padding: 0 12px;
    background: var(--fluent-acrylic-bg);
    backdrop-filter: var(--fluent-acrylic-blur);
    border-bottom: 1px solid var(--fluent-border-subtle);
    box-shadow: var(--fluent-elevation-1);
    transition: all var(--fluent-transition-normal);

    .divider {
      margin: 0 8px;
      color: var(--td-text-color-placeholder);
    }

    .breadcrumb {
      user-select: none;
      cursor: pointer;
      border-radius: var(--fluent-radius-smooth);
      transition: all var(--fluent-transition-fast);
      padding: 6px 12px;
      display: flex;
      align-items: center;
      gap: 6px;

      &:hover {
        background: var(--fluent-item-hover);
        transform: translateY(-1px);
      }

      &:active {
        background: var(--fluent-item-active);
        transform: translateY(0);
      }

      &.group {
        color: var(--td-text-color-secondary);
        font-weight: 500;
      }

      .text {
        font-weight: 500;
      }

      .icon {
        transition: transform var(--fluent-transition-fast);
        color: var(--td-text-color-placeholder);
      }

      &:hover .icon {
        transform: rotate(180deg);
      }
    }
  }

  .home-chat-content {
    flex: 1;
    overflow: hidden;
    padding: 24px 16px;
    background: transparent;
    display: flex;
    flex-direction: column;

    .chat-list {
      flex: 1;
      overflow-y: auto;
      padding-right: 8px;

      .chat-item {
        max-width: 900px;
        margin: 0 auto 24px;
        transition: all var(--fluent-transition-normal);

        &.system {
          .system-message {
            padding: 12px 16px;
            background: transparent;
            border: 1px solid var(--td-text-color-disabled);
            border-radius: var(--fluent-radius-card);
            color: var(--td-text-color-disabled);
            font-size: 13px;
            line-height: 1.5;
            max-width: 800px;
            margin: 0 auto;

            .system-content {
              overflow: hidden;
              text-overflow: ellipsis;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
            }
          }
        }

        &.assistant {
          .assistant-message {
            display: flex;
            gap: 12px;
            max-width: 800px;
            margin: 0 auto;

            .message-avatar {
              width: 40px;
              height: 40px;
              border-radius: 50%;
              background: var(--fluent-gradient-primary);
              display: flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
              color: white;
              box-shadow: var(--fluent-elevation-2);

              svg {
                width: 24px;
                height: 24px;
              }
            }

            .message-body {
              flex: 1;
              min-width: 0;

              .thinking-section {
                margin-bottom: 12px;
                background: var(--fluent-card-bg);
                backdrop-filter: blur(10px);
                border: 1px solid var(--fluent-card-border);
                border-radius: var(--fluent-radius-card);
                box-shadow: var(--fluent-elevation-1);
                overflow: hidden;
                transition: all var(--fluent-transition-normal);

                &:hover {
                  box-shadow: var(--fluent-elevation-2);
                }

                .thinking-header {
                  padding: 12px 16px;
                  background: var(--fluent-item-hover);
                  border-bottom: 1px solid var(--fluent-border-subtle);
                  display: flex;
                  align-items: center;
                  gap: 8px;
                  font-weight: 500;

                  .thinking-icon {
                    color: var(--td-success-color-5);
                    font-size: 20px;
                  }

                  .thinking-loading {
                    display: flex;
                    gap: 4px;

                    .dot {
                      width: 6px;
                      height: 6px;
                      border-radius: 50%;
                      background: var(--fluent-accent-color);
                      animation: bounce 1.4s infinite ease-in-out both;

                      &:nth-child(1) {
                        animation-delay: -0.32s;
                      }

                      &:nth-child(2) {
                        animation-delay: -0.16s;
                      }
                    }
                  }

                  @keyframes bounce {
                    0%, 80%, 100% {
                      transform: scale(0);
                    }
                    40% {
                      transform: scale(1);
                    }
                  }

                  .thinking-text {
                    font-size: 14px;
                  }
                }

                .thinking-content {
                  padding: 16px;
                  font-size: 14px;
                  line-height: 1.6;
                  color: var(--td-text-color-secondary);
                }
              }

              .message-content {
                padding: 16px 20px;
                background: var(--td-bg-color-container);
                border: 1px solid var(--fluent-card-border);
                border-radius: var(--fluent-radius-card);
                font-size: 15px;
                line-height: 1.7;
                color: var(--td-text-color-primary);
                word-wrap: break-word;
                white-space: pre-wrap;
              }

              .message-footer {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 8px 0;

                .message-info {
                  font-size: 12px;
                  color: var(--td-text-color-placeholder);
                  font-family: var(--td-font-family);
                }

                .message-actions {
                  display: flex;
                  gap: 4px;
                }
              }
            }
          }
        }

        &.user {
          .user-message {
            display: flex;
            gap: 12px;
            max-width: 800px;
            margin: 0 auto;
            flex-direction: row-reverse;

            .message-avatar {
              width: 40px;
              height: 40px;
              border-radius: 50%;
              background: var(--fluent-gradient-secondary);
              display: flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
              color: white;
              box-shadow: var(--fluent-elevation-2);

              svg {
                width: 24px;
                height: 24px;
              }
            }

            .message-body {
              flex: 1;
              min-width: 0;

              .message-content {
                padding: 16px 20px;
                background: var(--td-bg-color-secondarycontainer);
                backdrop-filter: blur(10px);
                border: 1px solid var(--fluent-card-border);
                border-radius: var(--fluent-radius-card);
                box-shadow: var(--fluent-card-shadow);
                font-size: 15px;
                line-height: 1.7;
                color: var(--td-text-color-primary);
                word-wrap: break-word;
                white-space: pre-wrap;
                transition: all var(--fluent-transition-normal);

                &:hover {
                  box-shadow: var(--fluent-card-shadow-hover);
                }
              }
            }
          }
        }

        &.model-change {
          .model-change-message {
            padding: 12px 16px;
            background: var(--fluent-accent-light);
            border: 1px solid var(--fluent-accent-color);
            border-radius: var(--fluent-radius-card);
            max-width: 800px;
            margin: 0 auto;
            text-align: center;
            font-size: 14px;
            color: var(--td-text-color-primary);

            .model-change-content {
              :deep(span) {
                font-weight: 600;
                color: var(--fluent-accent-color);
              }
            }
          }
        }

        &.error {
          .error-message {
            padding: 16px 20px;
            background: var(--td-error-color-1);
            border: 1px solid var(--td-error-color-3);
            border-radius: var(--fluent-radius-card);
            max-width: 800px;
            margin: 0 auto;
            font-size: 14px;
            color: var(--td-error-color-6);
          }
        }
      }
    }

    .chat-sender-wrapper {
      margin-top: 16px;
      max-width: 800px;
      margin-left: auto;
      margin-right: auto;
      width: 100%;

      .chat-sender {
        background: var(--fluent-card-bg);
        backdrop-filter: blur(10px);
        border: 1px solid var(--fluent-card-border);
        border-radius: var(--fluent-radius-large);
        box-shadow: var(--fluent-elevation-3);
        padding: 16px;
        transition: all var(--fluent-transition-normal);

        &:hover {
          box-shadow: var(--fluent-elevation-4);
        }
      }
    }
  }

  .bottomBtn {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    bottom: 180px;
    padding: 0;
    border: none;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: var(--fluent-card-bg);
    backdrop-filter: blur(10px);
    border: 1px solid var(--fluent-card-border);
    box-shadow: var(--fluent-elevation-4);
    transition: all var(--fluent-transition-normal);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 10;

    &:hover {
      transform: translateX(-50%) translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
      background: var(--fluent-card-bg-hover);
    }

    &:active {
      transform: translateX(-50%) translateY(0);
    }

    svg {
      width: 24px;
      height: 24px;
      color: var(--fluent-accent-color);
    }
  }

}
</style>
