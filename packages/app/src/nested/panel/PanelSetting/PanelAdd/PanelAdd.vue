<template>
  <div class="monica-container panel-add">
    <PluginAdd v-model="data" inner/>
    <div class="flex justify-end mt-16px">
      <t-button variant="outline" theme="primary" @click="handleSave">新增</t-button>
    </div>
  </div>
</template>
<script lang="ts" setup>
import type {ToolItem, ToolItemType, ToolItemTypeOuter, ToolItemInner, ToolItemPlugin} from "@/global/PluginList.ts";
import PluginAdd from "@/pages/admin/plugin-setting/PluginAdd.vue";
import {useToolVisibleStore} from "@/store/ToolVisibleStore.ts";
import {addPluginService} from "@/services/main/PluginService.ts";
import {getCurrentWindow} from "@tauri-apps/api/window";

const x = ref(0);
const y = ref(0);
const panel = ref('');

const data = ref<ToolItem>({
  id: '',
  label: '',
  icon: '',
  desc: '',
  platform: [],
  type: 'exe',
  payload: {
    path: ''
  }
});

watch(() => data.value.type, (type) => {
  data.value.id = '';
  switch (type) {
    case 'inner':
      data.value.payload = {} as ToolItemInner;
      break;
    case 'plugin':
      data.value.payload = {} as ToolItemPlugin;
      break;
    case 'link':
      data.value.payload = {
        url: '',
        openWith: 'default',
        program: ''
      };
      break;
    case 'exe':
      data.value.payload = {
        path: ''
      };
      break;
    case 'script':
      data.value.payload = {
        path: '',
        interpreter: '',
        cwd: ''
      };
      break;
    case 'folder':
      data.value.payload = {
        path: ''
      };
      break;
    case 'file':
      data.value.payload = {
        path: '',
        openWith: ''
      };
      break;
    case 'command':
      data.value.payload = {
        command: '',
        openWith: '',
        cwd: ''
      };
      break;
    case 'keyboard':
      data.value.payload = {
        key: ''
      };
      break;
  }
});

const setTool = (id: string) => {
  const toolStore = useToolVisibleStore();
  if (panel.value) {
    toolStore.setSubGridTool(
      panel.value,
      y.value,
      x.value,
      id
    );
  } else {
    toolStore.setMainGridTool(y.value, x.value, id);
  }
}

const handleSave = async () => {
  // 新增
  if (data.value.type === 'inner') {
    // 设置
    setTool(data.value.id)
  }else {
    // 新增插件
    const toolId = await addPluginService(data.value as ToolItem<ToolItemTypeOuter>);
    setTool(toolId);
  }

  // 关闭窗口
  const win = getCurrentWindow();
  await win.destroy();
}

onMounted(() => {
  const usp = new URLSearchParams(location.search);
  data.value.type = usp.get('type') as ToolItemType;
  x.value = Number(usp.get('x'));
  y.value = Number(usp.get('y'));
  panel.value = usp.get('panel') || '';
});
</script>
<style scoped lang="less">
.panel-add {
  padding: var(--monica-spacing-xl);
  min-height: calc(100vh - var(--monica-spacing-xl) * 2);
  width: calc(100% - var(--monica-spacing-xl) * 2) !important;
}
</style>
