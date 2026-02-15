<template>
  <div class="main-categories">
    <div
      v-for="(slot, index) in mainSlots"
      :key="index"
      class="category-item"
      :class="{ 'empty': !slot.toolId }"
      :data-slot-index="slot.slotIndex"
      @click="slot.toolId && handleToolClick(slot.toolId)"
    >
      <template v-if="slot.toolId">
        <div class="category-icon">
          <PanelEntryIcon :name="getToolIcon(slot.toolId)" />
        </div>
        <div class="category-name">{{ getToolLabel(slot.toolId) }}</div>
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
import { AddIcon } from "tdesign-icons-vue-next";
import { useToolVisibleStore } from "@/store/ToolVisibleStore.ts";
import { computed } from "vue";
import PanelEntryIcon from "@/pages/panel/PanelEntry/components/PanelEntryIcon.vue";

const emit = defineEmits(['select']);

// Store
const toolStore = useToolVisibleStore();

// 主区域槽位（0-11）
const mainSlots = computed(() => {
  return toolStore.mainSlots;
});

// 获取工具图标
function getToolIcon(toolId: string): string {
  const tool = toolStore.getToolInfo(toolId);
  return tool?.icon || 'HelpIcon';
}

// 获取工具标签
function getToolLabel(toolId: string): string {
  const tool = toolStore.getToolInfo(toolId);
  return tool?.label || toolId;
}

// 处理工具点击
const handleToolClick = (toolId: string) => {
  emit('select', toolId)
};
</script>

<style scoped lang="less">

</style>
