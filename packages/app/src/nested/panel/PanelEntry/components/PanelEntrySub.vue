<template>
  <div class="sub-section">
    <div class="sub-header">
      <span class="sub-title">{{ currentPanel?.label || '工具' }}</span>
      <div class="sub-pagination">
        <span
          v-for="(panel, index) in visiblePanels"
          :key="panel.id"
          class="pagination-dot"
          :class="{ 'active': currentPanelIndex === index }"
          @click="currentPanelIndex = index"
        />
      </div>
      <div class="sub-actions">
        <t-button theme="default" variant="text" size="small" class="action-btn-small">
          <search-icon/>
        </t-button>
        <t-button theme="default" variant="text" size="small" class="action-btn-small">
          <gesture-up-icon/>
        </t-button>
      </div>
    </div>
    <div
      class="sub-grid-wrapper"
      @wheel="handleWheel"
    >
      <transition :name="slideDirection" mode="out-in">
        <div
          :key="currentPanel?.id"
          class="sub-grid"
        >
          <template v-for="(row, rowIndex) in currentGrid" :key="rowIndex">
            <div
              v-for="(toolId, colIndex) in row"
              :key="`${rowIndex}-${colIndex}`"
              class="sub-tool-item"
              :class="{ 'empty': !toolId }"
              :data-row="rowIndex"
              :data-col="colIndex"
              @click="toolId && handleToolClick(toolId)"
            >
              <template v-if="toolId">
                <div class="sub-tool-icon">
                  <PanelEntryIcon :name="getToolIcon(toolId)"/>
                </div>
                <div class="sub-tool-name">{{ getToolLabel(toolId) }}</div>
              </template>
              <template v-else>
                <div class="empty-icon">
                  <add-icon/>
                </div>
              </template>
            </div>
          </template>
        </div>
      </transition>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { AddIcon, GestureUpIcon, SearchIcon } from "tdesign-icons-vue-next";
import { useToolVisibleStore } from "@/store/ToolVisibleStore.ts";
import PanelEntryIcon from "@/nested/panel/PanelEntry/components/PanelEntryIcon.vue";
import type {ToolItem} from "@/global/PluginList.ts";
import {handlePopupToolClick} from "@/lib/tool.ts";

const toolStore = useToolVisibleStore();

const currentPanelIndex = ref(0);

const slideDirection = ref('slide-left');

let wheelThrottle = false;

watch(currentPanelIndex, (newIndex, oldIndex) => {
  const total = visiblePanels.value.length;
  if (total <= 1) return;
  
  const isForwardJump = (newIndex === 0 && oldIndex === total - 1);
  const isBackwardJump = (newIndex === total - 1 && oldIndex === 0);
  
  if (isForwardJump || newIndex > oldIndex) {
    slideDirection.value = 'slide-left';
  } else if (isBackwardJump || newIndex < oldIndex) {
    slideDirection.value = 'slide-right';
  }
});

const visiblePanels = computed(() => {
  return toolStore.visiblePanels;
});

const currentPanel = computed(() => {
  return visiblePanels.value[currentPanelIndex.value];
});

const currentGrid = computed(() => {
  const panelId = currentPanel.value?.id;
  if (!panelId) {
    return [
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null]
    ];
  }
  return toolStore.getSubGrid(panelId);
});

function handleWheel(event: WheelEvent) {
  if (wheelThrottle) return;
  
  const total = visiblePanels.value.length;
  if (total <= 1) return;
  
  wheelThrottle = true;
  setTimeout(() => {
    wheelThrottle = false;
  }, 500);
  
  if (event.deltaY > 0) {
    currentPanelIndex.value = (currentPanelIndex.value + 1) % total;
  } else {
    currentPanelIndex.value = (currentPanelIndex.value - 1 + total) % total;
  }
}

function getToolIcon(toolId: string): string {
  const tool = toolStore.getToolInfo(toolId);
  return tool?.icon || 'HelpIcon';
}

function getToolLabel(toolId: string): string {
  const tool = toolStore.getToolInfo(toolId);
  return tool?.label || toolId;
}

const handleToolClick = (tool: ToolItem) => {
  handlePopupToolClick(tool)
};
</script>

<style scoped lang="less">
.sub-header {
  position: relative;
  display: flex;
  align-items: center;
}

.sub-pagination {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;

  .pagination-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    border: 1px solid var(--td-text-color-secondary);
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      border-color: var(--td-brand-color);
    }

    &.active {
      background-color: var(--td-brand-color);
      border-color: var(--td-brand-color);
    }
  }
}

.sub-grid-wrapper {
  position: relative;
  overflow: hidden;
}

.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s ease;
}

.slide-left-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-left-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-right-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-right-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
