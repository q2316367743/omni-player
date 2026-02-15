<template>
  <div class="main-categories">
    <template v-for="(row, rowIndex) in mainGrid" :key="rowIndex">
      <div
        v-for="(toolId, colIndex) in row"
        :key="`${rowIndex}-${colIndex}`"
        class="category-item"
        :class="{ 'empty': !toolId }"
        :data-row="rowIndex"
        :data-col="colIndex"
        @click="toolId && handleToolClick(toolId)"
        @contextmenu="openMainContext(toolId, rowIndex, colIndex, $event)"
      >
        <template v-if="toolId">
          <div class="category-icon">
            <PanelEntryIcon :name="getToolIcon(toolId)" />
          </div>
          <div class="category-name">{{ getToolLabel(toolId) }}</div>
        </template>
        <template v-else>
          <div class="empty-icon">
            <add-icon />
          </div>
        </template>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { AddIcon } from "tdesign-icons-vue-next";
import { useToolVisibleStore } from "@/store/ToolVisibleStore.ts";
import PanelEntryIcon from "@/nested/panel/PanelEntry/components/PanelEntryIcon.vue";
import {openMainContext} from "@/nested/panel/PanelEntry/PanelEntryEdit.tsx";

const emit = defineEmits(['select']);

const toolStore = useToolVisibleStore();

const mainGrid = computed(() => toolStore.mainGrid);

function getToolIcon(toolId: string): string {
  const tool = toolStore.getToolInfo(toolId);
  return tool?.icon || 'HelpIcon';
}

function getToolLabel(toolId: string): string {
  const tool = toolStore.getToolInfo(toolId);
  return tool?.label || toolId;
}

const handleToolClick = (toolId: string) => {
  emit('select', toolId)
};
</script>

<style scoped lang="less">

</style>
