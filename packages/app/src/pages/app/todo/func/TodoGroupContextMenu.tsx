import {AddIcon, EditIcon, DeleteIcon} from "tdesign-icons-vue-next";
import Ctx from "@imengyu/vue3-context-menu";
import {isDark} from "@/global/Constants.ts";
import {useTodoStore} from "@/lib/store.ts";
import {LocalName} from "@/global/LocalName.ts";
import type {TodoGroup} from "@/entity/todo/TodoGroup.ts";
import type {TodoItem} from "@/entity/todo/TodoItem.ts";
import {openTodoGroupEdit} from "@/pages/app/todo/func/TodoGroupEdit.tsx";
import {openTodoItemEdit} from "@/pages/app/todo/func/TodoItemEdit.tsx";
import MessageUtil from "@/util/model/MessageUtil.ts";
import MessageBoxUtil from "@/util/model/MessageBoxUtil.tsx";

export function openGroupContextMenu(group: TodoGroup, e: PointerEvent, groups: TodoGroup[], itemsMap: Map<string, TodoItem[]>, selectedPlanId: string, onRefresh: () => void) {
  e.preventDefault();
  e.stopPropagation();
  
  Ctx.showContextMenu({
    x: e.x,
    y: e.y,
    theme: isDark.value ? 'mac dark' : 'mac',
    items: [
      {
        label: "新增待办项",
        icon: () => <AddIcon/>,
        onClick: () => {
          if (!selectedPlanId) return;
          openTodoItemEdit(undefined, async (data) => {
            const newItem: TodoItem = {
              id: crypto.randomUUID(),
              createdAt: Date.now(),
              updatedAt: Date.now(),
              planId: selectedPlanId,
              groupId: group.id,
              ...data
            };
            const allItems = [...(itemsMap.get(group.id) || []), newItem];
            await useTodoStore().save(LocalName.STORE_TODO_ITEM(selectedPlanId, group.id), allItems);
            onRefresh();
            MessageUtil.success("新增待办项成功");
          });
        }
      },
      {
        label: "修改",
        icon: () => <EditIcon/>,
        onClick: () => {
          openTodoGroupEdit(group, async (data) => {
            const updatedGroup: TodoGroup = {
              ...group,
              ...data,
              updatedAt: Date.now()
            };
            const allGroups = groups.map(g => g.id === group.id ? updatedGroup : g);
            await useTodoStore().save(LocalName.STORE_TODO_GROUP(selectedPlanId), allGroups);
            onRefresh();
            MessageUtil.success("修改分组成功");
          });
        }
      },
      {
        label: () => <span style={{color: 'var(--td-error-color)'}}>删除</span>,
        icon: () => <DeleteIcon style={{color: 'var(--td-error-color)'}}/>,
        onClick: () => {
          MessageBoxUtil.confirm("确定要删除吗？", "提示", {
            confirmButtonText: "确定",
          }).then(async () => {
            const allGroups = groups.filter(g => g.id !== group.id);
            await useTodoStore().save(LocalName.STORE_TODO_GROUP(selectedPlanId), allGroups);
            await useTodoStore().delete(LocalName.STORE_TODO_ITEM(selectedPlanId, group.id));
            onRefresh();
            MessageUtil.success("删除成功");
          }).catch((e) => {
            console.log('删除已取消', e);
          });
        }
      }
    ]
  });
}
