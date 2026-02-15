<template>
  <div class="panel-entry-container">
    <!-- 可拖动标题栏 -->
    <div class="panel-header" data-tauri-drag-region>
      <div class="panel-title" data-tauri-drag-region>楼下小黑</div>
      <div class="panel-actions">
        <t-button theme="default" variant="text" size="small" shape="square" @click="openPopupSetting()">
          <template #icon>
            <setting-icon/>
          </template>
        </t-button>
        <panel-entry-pin/>
      </div>
    </div>

    <!-- 主分类网格 - 固定 3 排 4 列（12 个位置） -->
    <panel-entry-main @select="handleClick"/>

    <!-- 子分类区域 - 固定 4 排 4 列（16 个位置） -->
    <PanelEntrySub @select="handleClick"/>
  </div>
</template>

<script lang="ts" setup>
import {SettingIcon} from 'tdesign-icons-vue-next';
import {useToolVisibleStore} from "@/store/ToolVisibleStore.ts";
import {platform} from "@tauri-apps/plugin-os";
import PanelEntryMain from "@/nested/panel/PanelEntry/components/PanelEntryMain.vue";
import PanelEntrySub from "@/nested/panel/PanelEntry/components/PanelEntrySub.vue";
import PanelEntryPin from "@/nested/panel/PanelEntry/components/PanelEntryPin.vue";
import {openPopupPlugin, openPopupSetting} from "@/nested/panel/PanelEntry/PanelEntry.ts";

// Store
const toolStore = useToolVisibleStore();

// 初始化平台信息
onMounted(() => {
  const p = platform();
  toolStore.setPlatform(p);
});

const handleClick = (toolId: string) => {
  openPopupPlugin(toolId);
}
</script>

<style lang="less">
@import "PanelEntry.less";
</style>
