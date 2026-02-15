<template>
  <div class="sub-section">
    <div class="sub-header">
      <span class="sub-title">工具</span>
      <div class="sub-actions">
        <t-button theme="default" variant="text" size="small" class="action-btn-small">
          <search-icon/>
        </t-button>
        <t-button theme="default" variant="text" size="small" class="action-btn-small">
          <gesture-up-icon/>
        </t-button>
      </div>
    </div>
    <div ref="subGridRef" class="sub-grid">
      <div
        v-for="(tool, index) in subToolsWithEmpty"
        :key="tool?.id || `sub-empty-${index}`"
        class="sub-tool-item"
        :class="{ 'empty': !tool }"
        :data-tool-id="tool?.id || ''"
        @click="tool && handleToolClick(tool)"
      >
        <template v-if="tool">
          <div class="sub-tool-icon">
            <PanelEntryIcon :name="tool.icon"/>
          </div>
          <div class="sub-tool-name">{{ tool.label }}</div>
        </template>
        <template v-else>
          <div class="empty-icon">
            <add-icon/>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {AddIcon, GestureUpIcon, SearchIcon} from "tdesign-icons-vue-next";
import {type ToolItem, useToolVisibleStore} from "@/store/ToolVisibleStore.ts";
import Sortable from "sortablejs";
import PanelEntryIcon from "@/pages/panel/PanelEntry/components/PanelEntryIcon.vue";
import {computed, onMounted, ref} from "vue";


// Store
const toolStore = useToolVisibleStore();

const subGridRef = ref<HTMLElement>();

// 子工具 - 使用其他分类的工具，最多 16 个
const subTools = computed(() => {
  const categories: Array<'ai' | 'programmer' | 'online' | 'system'> = ['ai', 'programmer', 'online', 'system'];
  const tools: ToolItem[] = [];
  categories.forEach(cat => {
    tools.push(...toolStore.getVisibleToolsByCategory(cat));
  });
  return tools.slice(0, 16);
});

// 子工具（填充空位到16个）
const subToolsWithEmpty = computed(() => {
  const tools = [...subTools.value];
  while (tools.length < 16) {
    tools.push(null as any);
  }
  return tools;
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
let _subSortable: Sortable | null = null;


// 处理子工具拖拽更新（列表内部排序）
function handleSubSort(evt: Sortable.SortableEvent) {
  const {oldIndex, newIndex} = evt;

  if (oldIndex === newIndex) return;
  if (oldIndex === undefined || newIndex === undefined) return;

  // 获取子工具列表
  const allSubTools: (ToolItem | undefined)[] = [...subTools.value];

  // 子工具内部拖拽排序
  const item = allSubTools.splice(oldIndex, 1)[0];
  if (item) {
    allSubTools.splice(newIndex, 0, item);
  }

  // 更新子工具排序（从 100 开始，避免与主分类冲突）
  const filteredTools = allSubTools.filter((t): t is ToolItem => t !== undefined);
  filteredTools.forEach((tool, index) => {
    toolStore.setToolOrder(tool.id, 100 + index);
  });
}

// 初始化拖拽
function initSortable() {
  if (!subGridRef.value) {
    console.warn('Sub grid ref not found');
    return;
  }

  console.log('Initializing sub sortable on:', subGridRef.value);

  // 子工具拖拽 - 只允许在子工具区域内排序
  _subSortable = new Sortable(subGridRef.value, {
    animation: 200,
    ghostClass: 'sortable-ghost',
    chosenClass: 'sortable-chosen',
    dragClass: 'sortable-drag',
    group: 'sub-tools', // 独立的组，不允许跨组拖拽
    forceFallback: true, // 使用自定义的拖拽实现，避免原生 HTML5 拖拽在某些情况下的问题
    fallbackClass: 'sortable-drag',
    delay: 0,
    delayOnTouchOnly: true,
    touchStartThreshold: 5,
    onStart: (evt) => {
      console.log('Sub drag started:', evt.oldIndex);
    },
    onUpdate: handleSubSort,
  });
  console.log('Sub sortable initialized', _subSortable);
}

onMounted(() => {
  initSortable()
})

const handleToolClick = (tool?: ToolItem) => {
  console.log('Tool clicked:', tool?.id);
};
</script>
<style scoped lang="less">

</style>
