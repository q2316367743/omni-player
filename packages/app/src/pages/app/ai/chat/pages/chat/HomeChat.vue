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
    <custom-chat v-model:model="model" v-model:think="think" :messages :is-stream-load="isStreamLoad" :layout
                 @operator="handleOperator" @send="onSend" @stop="handleStop"/>
  </div>
</template>
<script lang="ts" setup>
import {writeText} from '@tauri-apps/plugin-clipboard-manager';
import {
  ChevronDownIcon,
  MenuFoldIcon,
} from "tdesign-icons-vue-next";
import {activeKey, collapsed, toggleCollapsed} from "@/pages/app/ai/chat/model.ts";
import {
  type AiChatGroup,
  type AiChatItem,
  type AiChatMessage,
  type AiChatMessageCore,
  transferAiChatItemToChatMessageParam
} from "@/entity/app/ai/chat";
import {askToOpenAi, type AskToOpenAiAbort} from "@/modules/ai";
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
import CustomChat from "@/pages/app/ai/chat/pages/chat/components/CustomChat.vue";

const layout = useLocalStorage(LocalName.PAGE_APP_AI_CHAT_LAYOUT, "compact")

const group = ref<AiChatGroup>();
const chatItem = ref<AiChatItem>();
// 聊天项
const messages = ref<Array<AiChatMessage>>([]);

const chatId = ref('');
const groupId = ref('');

const model = ref('');

const abort = shallowRef<AskToOpenAiAbort>();

const loading = ref(false);
const isStreamLoad = ref(false);
const isAsked = ref(false);
const think = ref(true);

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
  think.value = typeof messages.value[messages.value.length - 1]?.think === 'undefined' ?
    true :
    messages.value[messages.value.length - 1]?.think === 1;
  if (mode === 'create') {
    // 立即提问
    onAsk();
  }
  await nextTick();
  // UI 渲染完成，滚动到底部
  chatItem.value = await getAiChatItemService(chatId.value) || undefined;
});


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
  try {
    // 上一次聊天项
    const old = messages.value[messages.value.length - 2];
    const message: AiChatMessageCore = {
      role: 'user',
      content: inputValue,
      model: model.value,
      thinking: '',
      think: think.value ? 1 : 0
    };
    await onSaveContent(message)
    if (old) {
      if (old.model !== message.model) {
        // 模型发生变化
        await onSaveContent({
          role: 'model-change',
          content: `模型由<span>${old.model}</span>变为<span>${message.model}</span>`,
          model: model.value,
          thinking: '',
          think: message.think
        });
      }
    }
    // 提问
    await onAsk();
  } catch (e) {
    MessageUtil.error("提问失败", e);
  }
}
const onSend = (text: string) => {
  inputEnter(text);
};

async function onAsk() {
  abort.value = undefined;
  const model = messages.value[messages.value.length - 1]!.model;
  const _think = think.value ? 1 : 0;
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
      thinking: '',
      think: _think
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
      think: _think
    });
  } finally {
    loading.value = false;
    isStreamLoad.value = false;
    isAsked.value = false;
    // 保存
    // await onSaveContent();
  }
}

// 复制
const handleOperator = (prop: { operator: string, item: AiChatMessage, index: number }) => {
  const {operator: op, item, index} = prop;
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
