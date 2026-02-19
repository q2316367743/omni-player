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
          v-for="type in pluginTypes"
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
            <div
              v-for="plugin in getPluginsByType(type.value)"
              :key="plugin.id"
              class="plugin-card monica-card"
              @contextmenu="(e) => openMediaContextmenuWrap(plugin, e)"
            >
              <div class="plugin-icon">
                <XhAvatar :src="plugin.icon" :size="48" folder="setting/plugin"/>
              </div>
              <div class="plugin-info">
                <div class="plugin-header">
                  <h3 class="plugin-name">{{ plugin.label }}</h3>
                  <t-tag
                    v-for="platform in plugin.platform"
                    :key="platform"
                    size="small"
                    class="plugin-tag"
                  >
                    {{ getPlatformLabel(platform) }}
                  </t-tag>
                </div>
                <p class="plugin-desc">{{ plugin.desc || '暂无描述' }}</p>
                <div class="plugin-meta">
                  <span class="meta-item">
                    <span class="meta-label">类型:</span>
                    <span class="meta-value">{{ type.label }}</span>
                  </span>
                  <span class="meta-item">
                    <span class="meta-label">ID:</span>
                    <span class="meta-value">{{ plugin.id }}</span>
                  </span>
                </div>
              </div>
              <div class="plugin-actions">
                <t-button
                  variant="text"
                  size="small"
                  class="action-btn"
                  @click="handleDeletePlugin(plugin)"
                >
                  <template #icon>
                    <DeleteIcon/>
                  </template>
                </t-button>
              </div>
            </div>
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
  pluginEntityToOuter,
  type ToolItem,
  type ToolItemTypeOuter,
  type ToolItemPlatform
} from '@/global/PluginList.ts';
import {addPluginDrawer, openMediaContextmenu} from './func.tsx';
import MessageUtil from '@/util/model/MessageUtil.ts';
import MessageBoxUtil from '@/util/model/MessageBoxUtil.tsx';
import {removePlugin} from '@/services/main/PluginService.ts';
import {getAllWindows} from "@tauri-apps/api/window";

const activeTab = ref<ToolItemTypeOuter>('plugin');
const plugins = ref<Array<ToolItem<ToolItemTypeOuter>>>([]);

const pluginTypes = [
  {label: '第三方插件', value: 'plugin' as ToolItemTypeOuter},
  {label: '网页链接', value: 'link' as ToolItemTypeOuter},
  {label: '可执行文件', value: 'exe' as ToolItemTypeOuter},
  {label: '脚本', value: 'script' as ToolItemTypeOuter},
  {label: '文件夹', value: 'folder' as ToolItemTypeOuter},
  {label: '文件', value: 'file' as ToolItemTypeOuter},
];

const platformLabels: Record<ToolItemPlatform, string> = {
  win32: 'Windows',
  macos: 'Mac OS',
  linux: 'Linux',
};

function getPlatformLabel(platform: ToolItemPlatform): string {
  return platformLabels[platform] || platform;
}

function getPluginsByType(type: ToolItemTypeOuter): Array<ToolItem<ToolItemTypeOuter>> {
  return plugins.value.filter(p => p.type === type);
}

async function loadPlugins() {
  try {
    const result = await listPlugin();
    plugins.value = result.map(pluginEntityToOuter);
  } catch (e) {
    MessageUtil.error('加载插件列表失败', e);
  }
}

function handleAddPlugin() {
  addPluginDrawer(() => {
    loadPlugins();
    getAllWindows().then((wins) => {
      for (let win of wins) {
        if (win.label === 'popup_main') {
          win.emit('xiaohei://db/plugin/refresh');
          return;
        }
      }
    });
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

const openMediaContextmenuWrap = (data: ToolItem<ToolItemTypeOuter>, e: PointerEvent) => {
  openMediaContextmenu(data, e, () => {
    loadPlugins();
    getAllWindows().then((wins) => {
      for (let win of wins) {
        if (win.label === 'popup_main') {
          win.emit('xiaohei://db/plugin/refresh');
          return;
        }
      }
    });
  })
}

onMounted(() => {
  loadPlugins();
});
</script>

<style scoped lang="less">
@import "./PluginSetting.less";
</style>
