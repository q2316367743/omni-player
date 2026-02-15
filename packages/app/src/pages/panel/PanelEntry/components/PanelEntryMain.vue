<template>
  <div ref="mainCategoriesRef" class="main-categories">
    <div
      v-for="(tool, index) in mainToolsWithEmpty"
      :key="tool?.id || `main-empty-${index}`"
      class="category-item"
      :class="{ 'empty': !tool }"
      :data-tool-id="tool?.id || ''"
      @click="tool && handleToolClick(tool)"
    >
      <template v-if="tool">
        <div class="category-icon">
          <PanelEntryIcon :name="tool.icon" />
        </div>
        <div class="category-name">{{ tool.label }}</div>
      </template>
      <template v-else>
        <div class="empty-icon">
          <add-icon />
        </div>
      </template>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {AddIcon} from "tdesign-icons-vue-next";
import {type ToolItem, useToolVisibleStore} from "@/store/ToolVisibleStore.ts";
import {computed, onMounted, ref} from "vue";
import Sortable from "sortablejs";
import PanelEntryIcon from "@/pages/panel/PanelEntry/components/PanelEntryIcon.vue";


// Store
const toolStore = useToolVisibleStore();

// DOM 引用
const mainCategoriesRef = ref<HTMLElement>();

// 主分类工具 - 使用 productivity 分类的工具（待办、笔记、记账），最多 12 个
const mainTools = computed(() => {
  const tools = toolStore.getVisibleToolsByCategory('productivity');
  return tools.slice(0, 12);
});

// 主工具（填充空位到12个）
const mainToolsWithEmpty = computed(() => {
  const tools = [...mainTools.value];
  while (tools.length < 12) {
    tools.push(null as any);
  }
  return tools;
});


const handleToolClick = (tool?: ToolItem) => {
  console.log('Tool clicked:', tool?.id);
};

// 处理主分类拖拽更新（列表内部排序）
function handleMainSort(evt: Sortable.SortableEvent) {
  const { oldIndex, newIndex } = evt;

  if (oldIndex === newIndex) return;
  if (oldIndex === undefined || newIndex === undefined) return;

  // 获取当前显示的工具列表（包含 empty 占位）
  const currentTools = [...mainToolsWithEmpty.value];

  // 被拖拽的项
  const movedItem = currentTools[oldIndex];

  // 如果拖拽的是 empty 位置，不允许排序
  if (!movedItem) return;

  // 重新构建工具顺序：只对有实际工具的项进行排序
  const realTools: ToolItem[] = [];
  for (const t of currentTools) {
    if (t !== null) {
      realTools.push(t);
    }
  }

  const oldToolIndex = realTools.findIndex(t => t.id === movedItem.id);

  if (oldToolIndex === -1) return;

  // 在 realTools 中移动
  const removed = realTools.splice(oldToolIndex, 1)[0];
  if (!removed) return;

  // 计算新的插入位置（基于 visual index 转换为 real tool index）
  let newToolIndex = 0;
  let nonEmptyCount = -1;
  for (let i = 0; i <= newIndex && i < currentTools.length; i++) {
    if (currentTools[i] !== null) {
      nonEmptyCount++;
    }
    if (i === newIndex) {
      newToolIndex = nonEmptyCount;
      break;
    }
  }

  realTools.splice(newToolIndex, 0, removed);

  // 更新所有工具的排序
  realTools.forEach((tool, index) => {
    toolStore.setToolOrder(tool.id, index);
  });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
let _mainSortable: Sortable | null = null;

function initSortable() {
  if (!mainCategoriesRef.value) {
    console.warn('Main categories ref not found');
    return;
  }

  console.log('Initializing main sortable on:', mainCategoriesRef.value);

  // 主分类拖拽 - 只允许在主分类区域内排序
  _mainSortable = new Sortable(mainCategoriesRef.value, {
    animation: 200,
    ghostClass: 'sortable-ghost',
    chosenClass: 'sortable-chosen',
    dragClass: 'sortable-drag',
    group: 'main-tools', // 独立的组，不允许跨组拖拽
    draggable: '.category-item:not(.empty)', // 只有非 empty 的项可以被拖拽
    forceFallback: true, // 使用自定义的拖拽实现，避免原生 HTML5 拖拽在某些情况下的问题
    fallbackClass: 'sortable-drag',
    delay: 0,
    delayOnTouchOnly: true,
    touchStartThreshold: 5,
    onStart: (evt) => {
      console.log('Main drag started:', evt.oldIndex);
    },
    onUpdate: handleMainSort,
  });
  console.log('Main sortable initialized', _mainSortable);
}

// 初始化平台信息
onMounted(async () => {
  initSortable();
});
</script>
<style scoped lang="less">

</style>
