<template>
  <div>
    <div class="group">聊天</div>
    <div
      class="item"
      v-for="i in items"
      :key="i.id"
      :class="{ active: activeKey.startsWith(`/home/chat/0/${i.id}`) }"
      @click="onClick(`/home/chat/0/${i.id}`)"
      @contextmenu="onChatMenuClick(i, $event)"
    >
      <div class="text ellipsis">
        {{ i.name }}
        <t-tag v-if="i.top" size="small" variant="outline" theme="primary">
          <template #icon>
            <align-top-icon/>
          </template>
        </t-tag>
      </div>
      <t-button
        theme="primary"
        variant="text"
        shape="square"
        size="small"
        class="more"
        @click.stop="onChatMenuClick(i, $event)"
      >
        <template #icon>
          <more-icon/>
        </template>
      </t-button>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {AlignTopIcon, FolderIcon, MoreIcon, PlusIcon} from "tdesign-icons-vue-next";
import ContextMenu, {type MenuItem} from "@imengyu/vue3-context-menu";
import type {AiChatItem} from "@/entity/app/ai/chat";
import {listAiChatGroupService} from "@/services/app/chat";
import {activeKey, autoHideCollapsed} from "@/pages/app/ai/chat/model.ts";
import {openAddAiChatGroupDialog} from "@/pages/app/ai/chat/modal/AddAiChatGroup.tsx";
import {isDark} from "@/global/Constants.ts";
import {onRemoveChat, onRenameChat, onTopChat} from "@/pages/app/ai/chat/components/HomeContext.tsx";
import {chatMove} from "@/pages/app/ai/chat/components/ChatMove.ts";

defineProps({
  items: {
    type: Array as PropType<Array<AiChatItem>>,
    default: () => new Array<AiChatItem>(),
  }
});

const emit = defineEmits(["refreshGroup", "refreshItem"]);


const onClick = (path: string) => {
  activeKey.value = path;
  if (path !== "/home/welcome" && path !== "/home/temp") {
    // 收起
    autoHideCollapsed()
  }
};

const onChatMenuClick = async (data: AiChatItem, e: MouseEvent) => {
  const groups = await listAiChatGroupService();
  const items = new Array<MenuItem>();
  groups.forEach((group) => {
    items.push({
      label: group.name,
      icon: () => h(FolderIcon),
      onClick: () => onMove(data, group.id),
    });
  });
  if (items.length > 0) {
    items.push({divided: "self"});
  }
  items.push({
    label: "新建分组",
    icon: () => h(PlusIcon),
    onClick: () => openAddAiChatGroupDialog(() => {
      emit("refreshGroup");
    }),
  });
  e.preventDefault();
  ContextMenu.showContextMenu({
    x: e.x,
    y: e.y,
    theme: isDark.value ? "mac dark" : "mac",
    items: [
      {
        label: "移动到分组",
        children: items,
      },
      {
        label: "编辑名称",
        onClick: () => onRenameChat(data),
      },
      {
        label: data.top ? "取消置顶" : "置顶",
        onClick: () => onTopChat(data),
      },
      {
        label: () =>
          h(
            "span",
            {
              style: {
                color: "var(--td-error-color)",
              },
            },
            "删除"
          ),
        onClick: () =>
          onRemoveChat("0", data.id, () => {
            emit('refreshItem');
            if (activeKey.value === `/home/chat/0/${data.id}`)
              activeKey.value = "";
          }),
      },
    ],
  });
};

function onMove(chat: AiChatItem, targetGroupId: string) {
  chatMove({
    chatId: chat.id,
    targetGroupId,
  }).then(() => {
    emit('refreshItem');
  });
}

</script>
<style scoped lang="less">
</style>
