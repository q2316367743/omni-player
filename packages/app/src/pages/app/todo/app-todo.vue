<template>
  <div class="todo-page">
    <div class="todo-container">
      <div class="todo-sidebar">
        <div class="sidebar-header">
          <span class="sidebar-title">待办计划</span>
          <t-button variant="text" shape="square" @click="handleAddPlan">
            <template #icon><add-icon/></template>
          </t-button>
        </div>
        <todo-plan-tree 
          v-model="selectedPlanId"
          :nodes="planTree"
          @contextmenu="handlePlanContextMenu"
        />
      </div>
      
      <div class="todo-main">
        <div v-if="selectedPlanId" class="plan-content">
          <div class="plan-header">
            <span class="plan-name">{{ selectedPlan?.name }}</span>
            <t-button size="small" variant="outline" @click="handleAddGroup">
              <template #icon><add-icon/></template>
              新增分组
            </t-button>
          </div>
          
          <div v-if="sortedGroups.length > 0" class="groups-container">
            <todo-group-card
              v-for="group in sortedGroups"
              :key="group.id"
              :group="group"
              :items="getGroupItems(group.id)"
              @click="handleGroupClick"
              @item-click="handleItemClick"
              @contextmenu="handleGroupContextMenu"
              @add-item="handleAddItem"
              @status-change="handleStatusChange"
            />
          </div>
          
          <div v-else class="empty-state">
            <div class="empty-icon">📂</div>
            <span class="empty-text">暂无分组，点击上方按钮添加</span>
          </div>
        </div>
        
        <div v-else class="empty-state">
          <div class="empty-icon">📝</div>
          <span class="empty-text">请选择一个待办计划</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {AddIcon} from "tdesign-icons-vue-next";
import {useTodoStore} from "@/lib/store.ts";
import {LocalName} from "@/global/LocalName.ts";
import type {TodoPlan} from "@/entity/todo/TodoPlan.ts";
import type {TodoGroup} from "@/entity/todo/TodoGroup.ts";
import type {TodoItem} from "@/entity/todo/TodoItem.ts";
import {openTodoPlanEdit} from "@/pages/app/todo/func/TodoPlanEdit.tsx";
import {openTodoGroupEdit} from "@/pages/app/todo/func/TodoGroupEdit.tsx";
import {openTodoItemEdit} from "@/pages/app/todo/func/TodoItemEdit.tsx";
import {openPlanContextMenu} from "@/pages/app/todo/func/TodoPlanContextMenu.tsx";
import {openGroupContextMenu} from "@/pages/app/todo/func/TodoGroupContextMenu.tsx";
import MessageUtil from "@/util/model/MessageUtil.ts";
import TodoPlanTree from "@/pages/app/todo/components/TodoPlanTree.vue";
import TodoGroupCard from "@/pages/app/todo/components/TodoGroupCard.vue";

interface TreeNode extends TodoPlan {
  expanded?: boolean;
  children?: TreeNode[];
}

const plans = ref<TodoPlan[]>([]);
const groups = ref<TodoGroup[]>([]);
const itemsMap = ref<Map<string, TodoItem[]>>(new Map());
const selectedPlanId = ref('');

const planTree = computed(() => {
  return buildTree(plans.value);
});

const sortedGroups = computed(() => {
  return [...groups.value].sort((a, b) => {
    if (a.allCompleted === b.allCompleted) return 0;
    return a.allCompleted ? 1 : -1;
  });
});

const selectedPlan = computed(() => {
  return plans.value.find(p => p.id === selectedPlanId.value);
});

const buildTree = (plans: TodoPlan[]): TreeNode[] => {
  const map = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];
  
  plans.forEach(plan => {
    map.set(plan.id, { ...plan, expanded: false, children: [] });
  });
  
  plans.forEach(plan => {
    const node = map.get(plan.id)!;
    if (plan.parentId && map.has(plan.parentId)) {
      map.get(plan.parentId)!.children!.push(node);
    } else {
      roots.push(node);
    }
  });
  
  return roots;
};

const loadPlans = async () => {
  const loadedPlans = await useTodoStore().list<TodoPlan>(LocalName.STORE_TODO_PLAN);
  plans.value = await Promise.all(loadedPlans.map(async (plan) => {
    const groups = await useTodoStore().list<TodoGroup>(LocalName.STORE_TODO_GROUP(plan.id));
    const completedGroups = groups.filter(g => g.allCompleted);
    return {
      ...plan,
      groupCount: completedGroups.length
    };
  }));
};

const loadGroups = async (planId: string) => {
  const loadedGroups = await useTodoStore().list<TodoGroup>(LocalName.STORE_TODO_GROUP(planId));
  const newItemsMap = new Map<string, TodoItem[]>();
  
  groups.value = [];
  
  for (const group of loadedGroups) {
    const items = await useTodoStore().list<TodoItem>(LocalName.STORE_TODO_ITEM(planId, group.id));
    newItemsMap.set(group.id, items);
    
    const allCompleted = items.length > 0 && items.every(item => item.status === 1);
    
    const newGroup: TodoGroup = {
      id: group.id,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
      name: group.name,
      allCompleted
    };
    
    groups.value.push(newGroup);
  }
  
  itemsMap.value = newItemsMap;
};

const loadItems = async (planId: string) => {
  const newItemsMap = new Map<string, TodoItem[]>();
  for (const group of groups.value) {
    const items = await useTodoStore().list<TodoItem>(LocalName.STORE_TODO_ITEM(planId, group.id));
    newItemsMap.set(group.id, items);
  }
  itemsMap.value = newItemsMap;
};

const refreshData = async () => {
  await loadPlans();
  if (selectedPlanId.value) {
    await loadGroups(selectedPlanId.value);
    await loadItems(selectedPlanId.value);
  }
};

const getGroupItems = (groupId: string): TodoItem[] => {
  return itemsMap.value.get(groupId) || [];
};

const handleAddPlan = () => {
  openTodoPlanEdit(undefined, selectedPlanId.value, async (data) => {
    const newPlan: TodoPlan = {
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      name: data.name,
      folder: data.folder,
      parentId: data.parentId,
      groupCount: 0
    };
    const allPlans = [...plans.value, newPlan];
    await useTodoStore().save(LocalName.STORE_TODO_PLAN, allPlans);
    await loadPlans();
    MessageUtil.success("新增计划成功");
  });
};

const handleAddGroup = () => {
  if (!selectedPlanId.value) return;
  
  openTodoGroupEdit(undefined, async (data) => {
    const newGroup: TodoGroup = {
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      name: data.name,
      allCompleted: false
    };
    const allGroups = [...groups.value, newGroup];
    await useTodoStore().save(LocalName.STORE_TODO_GROUP(selectedPlanId.value), allGroups);
    await loadGroups(selectedPlanId.value);
    MessageUtil.success("新增分组成功");
  });
};

const handleGroupClick = () => {
};

const handleAddItem = (group: TodoGroup) => {
  if (!selectedPlanId.value) return;
  openTodoItemEdit(undefined, async (data) => {
    const newItem: TodoItem = {
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      planId: selectedPlanId.value,
      groupId: group.id,
      ...data
    };
    const allItems = [...getGroupItems(group.id), newItem];
    await useTodoStore().save(LocalName.STORE_TODO_ITEM(selectedPlanId.value, group.id), allItems);
    await loadItems(selectedPlanId.value);
    MessageUtil.success("新增待办项成功");
  });
};

const handleStatusChange = async (item: TodoItem, status: number) => {
  let newStatus: 0 | 1 | 2;
  
  if (status === 1) {
    newStatus = item.status === 1 ? 0 : 1;
  } else if (status === 2) {
    newStatus = item.status === 2 ? 0 : 2;
  } else {
    newStatus = 0;
  }
  
  const updatedItem: TodoItem = {
    ...item,
    status: newStatus,
    updatedAt: Date.now()
  };
  const allItems = [...getGroupItems(item.groupId)];
  const index = allItems.findIndex(i => i.id === item.id);
  if (index !== -1) {
    allItems[index] = updatedItem;
  }
  await useTodoStore().save(LocalName.STORE_TODO_ITEM(item.planId, item.groupId), allItems);
  
  const groupIndex = groups.value.findIndex(g => g.id === item.groupId);
  if (groupIndex !== -1) {
    const allCompleted = allItems.every(i => i.status === 1);
    const currentGroup = groups.value[groupIndex];
    if (currentGroup) {
      groups.value[groupIndex] = {
        id: currentGroup.id,
        createdAt: currentGroup.createdAt,
        updatedAt: currentGroup.updatedAt,
        name: currentGroup.name,
        allCompleted
      };
      
      if (currentGroup.allCompleted !== allCompleted) {
        const planIndex = plans.value.findIndex(p => p.id === item.planId);
        if (planIndex !== -1) {
          const currentPlan = plans.value[planIndex];
          if (currentPlan) {
            const updatedPlan: TodoPlan = {
              ...currentPlan,
              groupCount: allCompleted ? currentPlan.groupCount + 1 : Math.max(0, currentPlan.groupCount - 1),
              updatedAt: Date.now()
            };
            const allPlans = [...plans.value];
            allPlans[planIndex] = updatedPlan;
            await useTodoStore().save(LocalName.STORE_TODO_PLAN, allPlans);
          }
        }
      }
    }
  }
  
  itemsMap.value.set(item.groupId, allItems);
};

const handleItemClick = (item: TodoItem) => {
  openTodoItemEdit(item, async (data) => {
    const oldAllCompleted = getGroupItems(item.groupId).every(i => i.status === 1);
    
    const updatedItem: TodoItem = {
      ...item,
      ...data,
      updatedAt: Date.now()
    };
    const allItems = [...getGroupItems(item.groupId)];
    const index = allItems.findIndex(i => i.id === item.id);
    if (index !== -1) {
      allItems[index] = updatedItem;
    }
    await useTodoStore().save(LocalName.STORE_TODO_ITEM(item.planId, item.groupId), allItems);
    
    const newAllCompleted = allItems.every(i => i.status === 1);
    
    if (oldAllCompleted !== newAllCompleted) {
      const groupIndex = groups.value.findIndex(g => g.id === item.groupId);
      if (groupIndex !== -1) {
        const currentGroup = groups.value[groupIndex];
        if (currentGroup) {
          groups.value[groupIndex] = {
            ...currentGroup,
            allCompleted: newAllCompleted,
            updatedAt: Date.now()
          };
          
          const planIndex = plans.value.findIndex(p => p.id === item.planId);
          if (planIndex !== -1) {
            const currentPlan = plans.value[planIndex];
            if (currentPlan) {
              const updatedPlan: TodoPlan = {
                ...currentPlan,
                groupCount: newAllCompleted ? currentPlan.groupCount + 1 : Math.max(0, currentPlan.groupCount - 1),
                updatedAt: Date.now()
              };
              const allPlans = [...plans.value];
              allPlans[planIndex] = updatedPlan;
              await useTodoStore().save(LocalName.STORE_TODO_PLAN, allPlans);
            }
          }
        }
      }
    }
    
    await loadItems(item.planId);
    MessageUtil.success("修改待办项成功");
  });
};

const handlePlanContextMenu = (node: TreeNode, e: PointerEvent) => {
  openPlanContextMenu(node, e, plans.value, refreshData, selectedPlanId);
};

const handleGroupContextMenu = (group: TodoGroup, e: PointerEvent) => {
  openGroupContextMenu(group, e, groups.value, itemsMap.value, selectedPlanId.value, async () => {
    if (group.allCompleted) {
      const planIndex = plans.value.findIndex(p => p.id === selectedPlanId.value);
      if (planIndex !== -1) {
        const currentPlan = plans.value[planIndex];
        if (currentPlan) {
          const updatedPlan: TodoPlan = {
            ...currentPlan,
            groupCount: Math.max(0, currentPlan.groupCount - 1),
            updatedAt: Date.now()
          };
          const allPlans = [...plans.value];
          allPlans[planIndex] = updatedPlan;
          await useTodoStore().save(LocalName.STORE_TODO_PLAN, allPlans);
        }
      }
    }
    await loadPlans();
    await loadGroups(selectedPlanId.value);
    await loadItems(selectedPlanId.value);
  });
};

watch(selectedPlanId, async (newPlanId) => {
  if (newPlanId) {
    await loadGroups(newPlanId);
    await loadItems(newPlanId);
  }
});

onMounted(async () => {
  await loadPlans();
});
</script>

<style scoped lang="less">
.todo-page {
  position: relative;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  user-select: none;
  background-color: var(--td-bg-color-container);

  .todo-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    display: flex;
    gap: 16px;
    padding: 16px;
    box-sizing: border-box;
    overflow: hidden;
    
    .todo-sidebar {
      width: 280px;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      background: var(--td-bg-color-container);
      border-radius: 12px;
      padding: 16px;
      border: 1px solid var(--td-component-border);
      overflow-y: auto;
      
      .sidebar-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 1px solid var(--td-component-border);
        
        .sidebar-title {
          font-size: 15px;
          font-weight: 600;
          color: var(--td-text-color-primary);
          flex: 1;
        }
      }
    }
    
    .todo-main {
      flex: 1;
      min-width: 0;
      background: var(--td-bg-color-container);
      border-radius: 12px;
      padding: 20px;
      border: 1px solid var(--td-component-border);
      overflow-y: auto;
      
      .plan-content {
        .plan-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--td-component-border);
          
          .plan-name {
            font-size: 18px;
            font-weight: 600;
            color: var(--td-text-color-primary);
          }
        }
        
        .groups-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 16px;
        }
      }
      
      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        min-height: 300px;
        color: var(--td-text-color-placeholder);
        
        .empty-icon {
          font-size: 64px;
          margin-bottom: 16px;
          opacity: 0.5;
        }
        
        .empty-text {
          font-size: 14px;
        }
      }
    }
  }

  @media (max-width: 768px) {
    .todo-container {
      padding: 12px;
      gap: 12px;
      
      .todo-sidebar {
        width: 200px;
        padding: 12px;
        
        .sidebar-header {
          margin-bottom: 12px;
          padding-bottom: 10px;
        }
      }
      
      .todo-main {
        padding: 16px;
        
        .plan-content {
          .plan-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
            margin-bottom: 16px;
            padding-bottom: 12px;
            
            .plan-name {
              font-size: 16px;
            }
          }
          
          .groups-container {
            grid-template-columns: 1fr;
            gap: 12px;
          }
        }
      }
    }
  }

  @media (max-width: 480px) {
    .todo-container {
      padding: 8px;
      gap: 8px;
      
      .todo-sidebar {
        width: 160px;
        padding: 10px;
        
        .sidebar-header {
          .sidebar-title {
            font-size: 14px;
          }
        }
      }
      
      .todo-main {
        padding: 12px;
      }
    }
  }
}
</style>
