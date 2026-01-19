import MessageBoxUtil from "@/util/model/MessageBoxUtil.tsx";
import type {AiChatGroup, AiChatItem} from "@/entity/app/ai/chat";
import MessageUtil from "@/util/model/MessageUtil.ts";
import {
  removeAiChatGroupService,
  removeAiChatItemService,
  updateAiChatGroupService,
  updateAiChatItemService
} from "@/services/app/chat";
import {activeKey} from "@/pages/app/ai/chat/model.ts";

export function onRenameChat(data: AiChatItem, onUpdate?: (name: string) => void) {
  MessageBoxUtil.prompt("请输入新的对话名称", "编辑对话名称", {
    inputValue: data.name,
    maxlength: 18
  })
    .then(name => {
      updateAiChatItemService(data.id, {
        name,
      })
        .then(() => {
          MessageUtil.success("修改成功");
          onUpdate?.(name);
        })
        .catch(e => MessageUtil.error("修改失败", e));
    })
}

export function onTopChat(data: AiChatItem) {
  updateAiChatItemService(data.id, {
    top: data.top === 0 ? 1 : 0,
  })
    .then(() => MessageUtil.success("修改成功"))
    .catch(e => MessageUtil.error("修改失败", e));
}

export function onRemoveChat(groupId: string, id: string, onUpdate?: () => void) {
  MessageBoxUtil.confirm("是否删除此聊天", "删除聊天").then(() => {
    removeAiChatItemService(id)
      .then(() => {
        MessageUtil.success("删除成功");
        onUpdate?.();
        // 如果是当前
        if (activeKey.value === `/home/chat/${groupId}/${id}`) {
          // 变为新聊天
          activeKey.value = '/home/welcome';
        }
      })
      .catch(e => MessageUtil.error("删除失败", e));
  })
}

export function onRenameGroup(group: AiChatGroup, onUpdate?: () => void) {
  MessageBoxUtil.prompt("请输入新的分组名称", "编辑分组名称", {
    inputValue: group.name,
    maxlength: 10
  })
    .then(name => {
      updateAiChatGroupService(group.id, {name})
        .then(() => {
          MessageUtil.success("修改成功");
          onUpdate?.();
        })
        .catch(e => MessageUtil.error("修改失败", e));
    })
}

export function onRemoveGroup(id: string, onUpdate?: () => void) {
  MessageBoxUtil.confirm("是否删除此分组", "删除分组")
    .then(() => removeAiChatGroupService(id)
      .then(() => {
        MessageUtil.success("删除成功");
        onUpdate?.();
      })
      .catch(e => MessageUtil.error("删除失败", e)))
}