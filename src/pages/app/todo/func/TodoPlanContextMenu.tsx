import {AddIcon, EditIcon, DeleteIcon} from "tdesign-icons-vue-next";
import Ctx from "@imengyu/vue3-context-menu";
import {isDark} from "@/global/Constants.ts";
import {useTodoStore} from "@/lib/store.ts";
import {LocalName} from "@/global/LocalName.ts";
import type {TodoPlan} from "@/entity/todo/TodoPlan.ts";
import {openTodoPlanEdit} from "@/pages/app/todo/func/TodoPlanEdit.tsx";
import MessageUtil from "@/util/model/MessageUtil.ts";
import MessageBoxUtil from "@/util/model/MessageBoxUtil.tsx";

interface TreeNode extends TodoPlan {
  expanded?: boolean;
  children?: TreeNode[];
}

export function openPlanContextMenu(node: TreeNode, e: PointerEvent, plans: TodoPlan[], onRefresh: () => void, selectedPlanId: { value: string }) {
  e.preventDefault();
  e.stopPropagation();
  
  Ctx.showContextMenu({
    x: e.x,
    y: e.y,
    theme: isDark.value ? 'mac dark' : 'mac',
    items: [
      {
        label: "新增子计划",
        icon: () => <AddIcon/>,
        onClick: () => {
          openTodoPlanEdit(undefined, node.id, async (data) => {
            const newPlan: TodoPlan = {
              id: crypto.randomUUID(),
              createdAt: Date.now(),
              updatedAt: Date.now(),
              name: data.name,
              folder: data.folder,
              parentId: node.id,
              groupCount: 0
            };
            const allPlans = [...plans, newPlan];
            await useTodoStore().save(LocalName.STORE_TODO_PLAN, allPlans);
            onRefresh();
            MessageUtil.success("新增计划成功");
          });
        }
      },
      {
        label: "修改",
        icon: () => <EditIcon/>,
        onClick: () => {
          openTodoPlanEdit(node, undefined, async (data) => {
            const updatedPlan: TodoPlan = {
              ...node,
              ...data,
              updatedAt: Date.now()
            };
            const allPlans = plans.map(p => p.id === node.id ? updatedPlan : p);
            await useTodoStore().save(LocalName.STORE_TODO_PLAN, allPlans);
            onRefresh();
            MessageUtil.success("修改计划成功");
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
            const allPlans = plans.filter(p => p.id !== node.id);
            await useTodoStore().save(LocalName.STORE_TODO_PLAN, allPlans);
            if (selectedPlanId.value === node.id) {
              selectedPlanId.value = '';
            }
            onRefresh();
            MessageUtil.success("删除成功");
          }).catch(() => {
            console.log('删除已取消');
          });
        }
      }
    ]
  });
}
