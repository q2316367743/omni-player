<template>
  <div class="main-categories">
    <template v-for="(row, rowIndex) in mainGrid" :key="rowIndex">
      <div
        v-for="(tool, colIndex) in row"
        :key="`${rowIndex}-${colIndex}`"
        class="category-item"
        :class="{ 'empty': !tool }"
        :data-row="rowIndex"
        :data-col="colIndex"
        :title="tool?.desc"
        @click="tool && handleToolClick(tool)"
        @contextmenu="openMainContext(tool?.id, rowIndex, colIndex, $event)"
      >
        <template v-if="tool">
          <div class="category-icon">
            <PanelEntryIcon :name="tool?.icon"/>
          </div>
          <div class="category-name">{{ tool?.label }}</div>
        </template>
        <template v-else>
          <div class="empty-icon" @click="openPluginAdd($event, '', colIndex, rowIndex)">
            <add-icon/>
          </div>
        </template>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import {AddIcon} from "tdesign-icons-vue-next";
import {useToolVisibleStore} from "@/store/ToolVisibleStore.ts";
import PanelEntryIcon from "@/nested/panel/PanelEntry/components/PanelEntryIcon.vue";
import {openMainContext, openPluginAdd} from "@/nested/panel/PanelEntry/PanelEntryEdit.tsx";
import {handlePopupToolClick} from "@/lib/tool.ts";
import type {ToolItem} from "@/global/PluginList.ts";

const toolStore = useToolVisibleStore();

const mainGrid = computed(() => toolStore.mainGrid);

const handleToolClick = (tool: ToolItem) => {
  handlePopupToolClick(tool)
};
</script>

<style scoped lang="less">

</style>
