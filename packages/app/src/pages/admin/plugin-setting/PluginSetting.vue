<template>
  <div class="plugin-setting monica-container">
    <div class="setting-header">
      <div class="header-content">
        <h2 class="page-title">插件管理</h2>
        <p class="page-subtitle">管理应用程序中的所有插件</p>
      </div>
      <t-button class="monica-btn" @click="handleAddPlugin">
        <template #icon>
          <AddIcon/>
        </template>
        新增插件
      </t-button>
    </div>

    <div class="setting-content">
      <t-tabs v-model="activeTab" class="plugin-tabs">
        <t-tab-panel
          v-for="type in ToolItemTypeOptions"
          :key="type.value"
          :value="type.value"
          :label="type.label"
        >
          <div class="plugin-list">
            <div v-if="getPluginsByType(type.value).length === 0" class="empty-state">
              <div class="empty-icon">📦</div>
              <p class="empty-text">暂无{{ type.label }}插件</p>
              <p class="empty-hint">点击右上角"新增插件"按钮添加</p>
            </div>
            <t-list :split="true">
              <t-list-item
                v-for="plugin in getPluginsByType(type.value)"
                :key="plugin.id"
              >
                <t-list-item-meta :title="plugin.label" :description="plugin.desc">
                  <template #avatar>
                    <XhAvatar :src="plugin.icon" :size="56" folder="setting/plugin"/>
                  </template>
                </t-list-item-meta>
                <template #action>
                  <t-button
                    variant="text"
                    theme="danger"
                    shape="square"
                    class="action-btn"
                    @click="handleDeletePlugin(plugin)"
                  >
                    <template #icon>
                      <DeleteIcon/>
                    </template>
                  </t-button>
                </template>
              </t-list-item>
            </t-list>
          </div>
        </t-tab-panel>
      </t-tabs>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {AddIcon, DeleteIcon} from 'tdesign-icons-vue-next';
import {listPlugin} from '@/services/main/PluginService.ts';
import {
  type ToolItem, ToolItemTypeOptions,
  type ToolItemTypeOuter,
} from '@/global/PluginList.ts';
import {addPluginDrawer} from './func.tsx';
import MessageUtil from '@/util/model/MessageUtil.ts';
import MessageBoxUtil from '@/util/model/MessageBoxUtil.tsx';
import {removePlugin} from '@/services/main/PluginService.ts';

const activeTab = ref<ToolItemTypeOuter>('plugin');
const plugins = ref<Array<ToolItem<ToolItemTypeOuter>>>([]);

function getPluginsByType(type: ToolItemTypeOuter): Array<ToolItem<ToolItemTypeOuter>> {
  return plugins.value.filter(p => p.type === type);
}

async function loadPlugins() {
  try {
    plugins.value = await listPlugin();
  } catch (e) {
    MessageUtil.error('加载插件列表失败', e);
  }
}

function handleAddPlugin() {
  addPluginDrawer(() => {
    loadPlugins();
    // getAllWindows().then((wins) => {
    //   for (let win of wins) {
    //     if (win.label === 'popup_main') {
    //       win.emit('xiaohei://store/plugin/refresh');
    //       return;
    //     }
    //   }
    // });
  });
}

async function handleDeletePlugin(plugin: ToolItem<ToolItemTypeOuter>) {
  try {
    await MessageBoxUtil.confirm('确定要删除该插件吗？', '提示', {
      confirmButtonText: '确定',
    });
    await removePlugin(plugin.id);
    MessageUtil.success('删除成功');
    await loadPlugins();
  } catch (e) {
    if (e !== 'cancel') {
      MessageUtil.error('删除失败', e);
    }
  }
}

onMounted(() => {
  loadPlugins();
});
</script>

<style scoped lang="less">
@import "./PluginSetting.less";
</style>
