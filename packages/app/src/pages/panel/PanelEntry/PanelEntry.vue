<template>
  <div class="panel-entry-container">
    <!-- 可拖动标题栏 -->
    <div class="panel-header" data-tauri-drag-region>
      <div class="panel-title" data-tauri-drag-region>楼下小黑</div>
      <div class="panel-actions">
        <t-button theme="default" variant="text" size="small" shape="square">
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
import {WebviewWindow} from "@tauri-apps/api/webviewWindow";
import {useToolVisibleStore} from "@/store/ToolVisibleStore.ts";
import {platform} from "@tauri-apps/plugin-os";
import PanelEntryMain from "@/pages/panel/PanelEntry/components/PanelEntryMain.vue";
import PanelEntrySub from "@/pages/panel/PanelEntry/components/PanelEntrySub.vue";
import PanelEntryPin from "@/pages/panel/PanelEntry/components/PanelEntryPin.vue";

// Store
const toolStore = useToolVisibleStore();

// 初始化平台信息
onMounted(() => {
  const p = platform();
  toolStore.setPlatform(p);
});

const handleClick = async (toolId: string) => {
  const tool = toolStore.getToolInfo(toolId);
  if (tool) {
    // 创建


    const ww = new WebviewWindow(`plugin-inner-${toolId}-${Date.now()}`, {
      url: import.meta.env.DEV ? `http://localhost:5123/popup-plugin.html?id=${toolId}` : `./popup-plugin.html?id=${toolId}`,
      title: tool.label,
      width: 1200,
      height: 800,
      minWidth: 1200,
      minHeight: 800,
      resizable: true,
      fullscreen: false,
      transparent: true
    })


    await ww.once('tauri://created', async () => {
      // webview successfully created
      console.log('webview successfully created')
    });
    await ww.once('tauri://error', function (e) {
      // an error happened creating the webview
      console.error('an error happened creating the webview');
      console.error(e);
    });

    await ww.show();
    await ww.setFocus();

  }
}
</script>

<style lang="less">
@import "PanelEntry.less";
</style>
