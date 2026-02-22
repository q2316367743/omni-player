<template>
  <div class="monica-container panel-add">
    <PluginAdd v-model="data" :inner="isInner"/>
    <div class="flex justify-end mt-16px">
      <t-button variant="outline" theme="primary" @click="handleSave">{{ isEdit ? '保存' : '新增' }}</t-button>
    </div>
  </div>
</template>
<script lang="ts" setup>
import type {ToolItem, ToolItemType, ToolItemTypeOuter, ToolItemInner, ToolItemPlugin} from "@/global/PluginList.ts";
import PluginAdd from "@/pages/admin/plugin-setting/PluginAdd.vue";
import {useToolVisibleStore} from "@/store/ToolVisibleStore.ts";
import {addPluginService, getPlugin, updatePluginService} from "@/services/main/PluginService.ts";
import {getCurrentWindow} from "@tauri-apps/api/window";

const x = ref(0);
const y = ref(0);
const panel = ref('');
const editId = ref('');
const isEdit = computed(() => !!editId.value);
const isInner = ref(false);

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
  if (isEdit.value) return;
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
  if (isEdit.value) {
    await updatePluginService(data.value as ToolItem<ToolItemTypeOuter>);
  } else if (data.value.type === 'inner') {
    setTool(data.value.id)
    const win = getCurrentWindow();
    await win.destroy();
    return;
  } else {
    const toolId = await addPluginService(data.value as ToolItem<ToolItemTypeOuter>);
    setTool(toolId);
  }

  const win = getCurrentWindow();
  await win.destroy();
}

onMounted(async () => {
  const usp = new URLSearchParams(location.search);
  console.log('PanelAdd', location.search)
  editId.value = usp.get('edit') || '';
  x.value = Number(usp.get('x'));
  y.value = Number(usp.get('y'));
  panel.value = usp.get('panel') || '';

  if (isEdit.value) {
    const plugin = await getPlugin(editId.value);
    console.log('plugin', editId.value, plugin)
    if (plugin) {
      data.value = plugin;
    }
  } else {
    data.value.type = usp.get('type') as ToolItemType;
    isInner.value = data.value.type === 'inner';
  }
});
</script>
<style scoped lang="less">
.panel-add {
  padding: var(--monica-spacing-xl);
  min-height: calc(100vh - var(--monica-spacing-xl) * 2);
  width: calc(100% - var(--monica-spacing-xl) * 2) !important;
}
</style>
