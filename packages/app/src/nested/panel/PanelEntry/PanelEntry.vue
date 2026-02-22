<template>
  <div class="panel-entry-container">
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

    <panel-entry-main/>

    <panel-entry-sub/>
  </div>
</template>

<script lang="ts" setup>
import {SettingIcon} from 'tdesign-icons-vue-next';
import {useToolVisibleStore} from "@/store/ToolVisibleStore.ts";
import {platform} from "@tauri-apps/plugin-os";
import {openPopupSetting} from "@/lib/windows";
import PanelEntryMain from "@/nested/panel/PanelEntry/components/PanelEntryMain.vue";
import PanelEntrySub from "@/nested/panel/PanelEntry/components/PanelEntrySub.vue";
import PanelEntryPin from "@/nested/panel/PanelEntry/components/PanelEntryPin.vue";

const toolStore = useToolVisibleStore();

onMounted(() => {
  const p = platform();
  toolStore.setPlatform(p);
});

</script>

<style lang="less">
@import "PanelEntry.less";
</style>
