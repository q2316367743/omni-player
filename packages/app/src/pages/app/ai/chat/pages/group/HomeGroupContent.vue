<template>
  <div class="home-group-content" v-if="group">
    <div class="home-group-content-title">
      <div class="home-group-content-title-left">
        <div class="home-group-content-title-left-icon">
          <folder-icon size="32px"/>
        </div>
        <div class="home-group-content-title-left-name">
          {{ group.name }}
        </div>
      </div>
      <div class="home-group-content-title-right">
        <t-space size="small">
          <t-input placeholder="搜索组内对话" v-model="keyword">
            <template #prefix-icon>
              <search-icon/>
            </template>
          </t-input>
          <t-dropdown trigger="click" placement="bottom">
            <t-button theme="primary" shape="square">
              <template #icon>
                <more-icon/>
              </template>
            </t-button>
            <t-dropdown-menu>
              <t-dropdown-item @click="onRenameGroup(group, initGroup)">编辑名称</t-dropdown-item>
              <t-dropdown-item @click="onDelete" style="color: var(--td-error-color)">删除分组</t-dropdown-item>
            </t-dropdown-menu>
          </t-dropdown>
        </t-space>
      </div>
    </div>
    <t-row :gutter="16">
      <t-col flex="auto">
        <div class="home-group-content-prompt" @click="onUpdatePrompt">
          <div class="main">
            <div class="home-group-content-prompt__title">{{ hasPrompt ? "工作指令" : "添加指令" }}</div>
            <div class="home-group-content-prompt__content ellipsis" v-if="hasPrompt">{{ group.prompt }}</div>
            <div class="home-group-content-prompt__placeholder" v-else>定制问一问在该分组的回答方式</div>
          </div>
          <div class="icon">
            <chevron-right-icon size="20px" class="mt-15px"/>
          </div>
        </div>
      </t-col>
      <t-col flex="72px" v-if="!hasPrompt" class="home-group-content-prompt center" @click="onUpdatePrompt1()">
        指令库
      </t-col>
    </t-row>
    <div class="chat-title">
      <span>对话 · </span>
      <span>{{ items.length }}</span>
    </div>
    <div class="chat-list" v-if="items.length > 0">
      <div class="chat-item" v-for="item in items" :key="item.id" @click="onChatClick(item)"
           @contextmenu="onChatContextMenuClick(item, $event)">
        <div class="left">
          <chat-double-icon size="16px"/>
          <div class="title">{{ item.name }}</div>
        </div>
        <div class="right">
          {{ formatDate(item.created_at) }}
        </div>
      </div>
    </div>
    <t-empty style="margin-top: 5vh" type="empty" v-else description="发送消息新建对话，或将历史对话移入"/>
  </div>
</template>
<script lang="ts" setup>
import {
  ChatDoubleIcon,
  ChevronRightIcon,
  FolderIcon,
  MinusIcon,
  MoreIcon,
  PlusIcon,
  SearchIcon
} from "tdesign-icons-vue-next";
import ContextMenu, {type MenuItem} from '@imengyu/vue3-context-menu'
import MessageUtil from "@/util/model/MessageUtil";
import {openAiGroupPrompt, openPrompt} from "@/pages/app/ai/chat/modal/AiGroupPrompt";
import {activeKey} from "@/pages/app/ai/chat/model";
import {onRemoveChat, onRemoveGroup, onRenameChat, onRenameGroup} from "@/pages/app/ai/chat/components/HomeContext";
import {chatMove} from "@/pages/app/ai/chat/components/ChatMove";
import {openAddAiChatGroupDialog} from "@/pages/app/ai/chat/modal/AddAiChatGroup";
import {formatDate} from "@/util/lang/FormatUtil.ts";
import type {AiChatGroup, AiChatItem} from "@/entity/app/ai/chat";
import {
  getAiChatGroupService,
  listAiChatGroupService,
  listAiChatItemService,
  updateAiChatGroupService
} from "@/services/app/chat";
import {isDark} from "@/global/Constants.ts";

const props = defineProps({
  groupId: {
    type: String,
    default: '0'
  }
});

const keyword = ref('');
const group = ref<AiChatGroup>();
const items = ref<Array<AiChatItem>>([]);


const hasPrompt = computed(() => !!group.value?.prompt);

const initGroup = () => {
  getAiChatGroupService(props.groupId)
    .then(g => group.value = (g || undefined))
    .catch(e => MessageUtil.error("获取分组详情失败", e));
}
const initChats = () => {
  listAiChatItemService(props.groupId)
    .then(d => {
      items.value = d;
    })
    .catch(e => MessageUtil.error("获取分组对话失败", e));
}

onMounted(() => {
  // 获取分组详情
  initGroup();
  // 获取分组对话
  initChats();
});

const onUpdatePrompt = () => {
  openAiGroupPrompt(group.value!)
    .then(prompt => {
      updateAiChatGroupService(props.groupId, {prompt})
        .then(() => {
          group.value!.prompt = prompt;
          MessageUtil.success("更新指令成功");
        })
        .catch(e => MessageUtil.error("更新指令失败", e));
    })
}
const onUpdatePrompt1 = () => {
  openPrompt()
    .then(prompt => {
      updateAiChatGroupService(props.groupId, {prompt})
        .then(() => {
          group.value!.prompt = prompt;
          MessageUtil.success("更新指令成功");
        })
        .catch(e => MessageUtil.error("更新指令失败", e));
    })
}

function onChatClick(data: AiChatItem) {
  activeKey.value = `/home/chat/${props.groupId}/${data.id}`
}

async function onChatContextMenuClick(data: AiChatItem, e: MouseEvent) {
  e.preventDefault();
  e.stopPropagation()
  const g: Array<MenuItem> = (await listAiChatGroupService())
    .filter(e => e.id !== props.groupId).map(e => ({
      label: e.name,
      icon: () => h(FolderIcon),
      onClick: () => onMove(data, e.id)
    }));
  if (g.length > 0) {
    g.push({
      divided: true,
    })
  }
  e.preventDefault();
  ContextMenu.showContextMenu({
    x: e.x,
    y: e.y,
    theme: isDark.value ? "default dark" : "default",
    zIndex: 200,
    items: [{
      label: '移动到',
      children: [
        ...g, {
          label: "移出本组",
          icon: () => h(MinusIcon),
          onClick: () => onMove(data, '0')
        }, {
          label: '新建分组',
          icon: () => h(PlusIcon),
          onClick: () => openAddAiChatGroupDialog(() => {})
        }]
    }, {
      label: '编辑名称',
      onClick() {
        onRenameChat(data, () => {
          // 重新初始化
          initChats();
        })
      }
    }, {
      label: () => h('span', {
        style: {
          color: 'var(--td-error-color)'
        },
        class: 'label'
      }, "删除"),
      onClick() {
        onRemoveChat(props.groupId, data.id, () => {
          // 重新初始化
          initChats();
        })
      }
    }]
  })
}

function onDelete() {
  onRemoveGroup(props.groupId, () => {
    activeKey.value = "/home/welcome";
  })
}

function onMove(chat: AiChatItem, targetGroupId: string) {
  chatMove({
    chatId: chat.id,
    targetGroupId,
    onSuccess: () => {
      // 重新初始化
      initChats();
    }
  })
}
</script>
<style scoped lang="less">
.home-group-content {
  max-width: 752px;
  padding: 0 24px;
  margin: 0 auto;

  .home-group-content-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    .home-group-content-title-left {
      display: flex;
      align-items: center;

      .home-group-content-title-left-icon {
        border-radius: var(--fluent-radius-smooth);
        padding: 8px;
      }

      .home-group-content-title-left-name {
        font-size: var(--td-font-size-title-large);
        margin-left: 12px;
        font-weight: 600;
        color: var(--td-text-color-primary);
      }
    }
  }

  .home-group-content-prompt {
    padding: 20px;
    background: var(--fluent-acrylic-bg);
    backdrop-filter: var(--fluent-acrylic-blur);
    -webkit-backdrop-filter: var(--fluent-acrylic-blur);
    border-radius: var(--fluent-radius-card);
    cursor: pointer;
    transition: all var(--fluent-transition-normal);
    display: flex;
    border: 1px solid var(--fluent-border-subtle);
    box-shadow: var(--fluent-card-shadow);

    &:hover {
      background: var(--fluent-card-bg-hover);
      box-shadow: var(--fluent-card-shadow-hover);
      transform: translateY(-2px);
      border-color: var(--fluent-item-hover);
    }

    &:active {
      background: var(--fluent-item-active);
      transform: translateY(0);
    }

    &.center {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 80px;
      background: var(--fluent-gradient-primary);
      color: #ffffff;
      font-weight: 600;
      border: none;

      &:hover {
        box-shadow: var(--fluent-elevation-3);
      }
    }

    .main {
      width: calc(100% - 48px);
    }

    .icon {
      width: 32px;
      margin-left: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--td-text-color-placeholder);
      transition: all var(--fluent-transition-fast);
    }

    &:hover .icon {
      color: var(--fluent-accent-color);
      transform: translateX(4px);
    }

    .home-group-content-prompt__title {
      font-size: var(--td-font-size-body-large);
      font-weight: 600;
      color: var(--td-text-color-primary);
      margin-bottom: 8px;
    }

    .home-group-content-prompt__content {
      font-size: var(--td-font-size-body-medium);
      color: var(--td-text-color-secondary);
      line-height: 1.6;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .home-group-content-prompt__placeholder {
      font-size: var(--td-font-size-body-medium);
      color: var(--td-text-color-placeholder);
      margin-top: 6px;
    }
  }

  .chat-title {
    color: var(--td-text-color-placeholder);
    font-size: var(--td-font-size-title-small);
    margin-top: 32px;
    margin-left: 8px;
    font-weight: 600;
    letter-spacing: 0.5px;

    .number {
      font-weight: 700;
      color: var(--fluent-accent-color);
    }
  }

  .chat-list {
    margin-top: 12px;
    display: flex;
    flex-direction: column-reverse;
    gap: 8px;

    .chat-item {
      padding: 16px 20px;
      background: var(--fluent-card-bg);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border-radius: var(--fluent-radius-card);
      transition: all var(--fluent-transition-normal);
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border: 1px solid var(--fluent-card-border);
      box-shadow: var(--fluent-elevation-1);

      &:hover {
        background: var(--fluent-card-bg-hover);
        box-shadow: var(--fluent-elevation-2);
        transform: translateY(-2px);
        border-color: var(--fluent-item-hover);
      }

      &:active {
        background: var(--fluent-item-active);
        transform: translateY(0);
      }

      .left {
        display: flex;
        align-items: center;
        color: var(--fluent-accent-color);

        .title {
          font-weight: 600;
          margin-left: 12px;
          color: var(--td-text-color-primary);
        }
      }

      .right {
        color: var(--td-text-color-placeholder);
        font-size: var(--td-font-size-body-small);
      }
    }
  }

}
</style>
