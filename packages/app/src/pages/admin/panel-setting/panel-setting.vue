<template>
  <div class="panel-setting local-scroll">
    <div class="setting-header">
      <h2 class="page-title">面板设置</h2>
      <p class="page-subtitle">管理面板和工具布局</p>
    </div>

    <div class="monica-card global-section">
      <div class="section-header">
        <span class="section-title">全局管理</span>
      </div>
      <div class="global-actions">
        <div class="global-action-item">
          <div class="action-info">
            <span class="action-label">重置所有设置</span>
            <span class="action-desc">恢复所有面板和工具布局到默认状态</span>
          </div>
          <t-popconfirm content="确定要重置所有设置吗？此操作不可撤销。" @confirm="handleResetAll">
            <button class="monica-btn monica-btn-secondary danger-btn">
              <refresh-icon class="btn-icon"/>
              重置全部
            </button>
          </t-popconfirm>
        </div>
      </div>
    </div>

    <div class="monica-card grid-section">
      <div class="section-header">
        <span class="section-title">全局布局</span>
        <button class="monica-btn monica-btn-secondary" @click="resetMainGrid">
          清空布局
        </button>
      </div>

      <div class="grid-manager">
        <div class="grid-container">
          <div
            v-for="(row, rowIndex) in mainGrid"
            :key="rowIndex"
            class="grid-row"
          >
            <div
              v-for="(toolId, colIndex) in row"
              :key="`${rowIndex}-${colIndex}`"
              class="grid-cell"
              :class="{ 'empty': !toolId }"
              @click="openMainToolSelector(rowIndex, colIndex)"
            >
              <template v-if="toolId">
                <div class="tool-icon">
                  <span class="tool-icon-text">{{ getToolIconName(toolId) }}</span>
                </div>
                <div class="tool-name">{{ getToolLabel(toolId) }}</div>
                <button
                  class="remove-btn"
                  @click.stop="removeToolFromMainGrid(rowIndex, colIndex)"
                >
                  <close-icon/>
                </button>
              </template>
              <template v-else>
                <div class="empty-placeholder">
                  <add-icon/>
                  <span>点击添加</span>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="monica-card panel-section">
      <div class="section-header">
        <span class="section-title">子面板管理</span>
        <button class="monica-btn" @click="showAddPanelDialog = true">
          <add-icon class="btn-icon"/>
          添加面板
        </button>
      </div>
      <div class="panel-list local-scroll">
        <div
          v-for="(panel, index) in sortedPanels"
          :key="panel.id"
          class="panel-item"
        >
          <div class="panel-info">
            <span class="panel-label">{{ panel.label }}</span>
            <span class="panel-id">ID: {{ panel.id }}</span>
          </div>
          <div class="panel-actions">
            <button
              class="action-btn"
              :disabled="index === 0"
              @click="movePanelUp(panel.id)"
            >
              <chevron-up-icon/>
            </button>
            <button
              class="action-btn"
              :disabled="index === sortedPanels.length - 1"
              @click="movePanelDown(panel.id)"
            >
              <chevron-down-icon/>
            </button>
            <t-switch
              v-model="panel.visible"
              size="small"
              @change="updatePanelVisible(panel.id, $event as boolean)"
            />
            <t-popconfirm content="确定删除此面板？" @confirm="handleDeletePanel(panel.id)">
              <button class="action-btn danger">
                <delete-icon/>
              </button>
            </t-popconfirm>
          </div>
        </div>
      </div>
    </div>

    <div class="monica-card grid-section">
      <div class="section-header">
        <span class="section-title">子面板布局管理</span>
        <div class="grid-controls">
          <t-select
            v-model="selectedPanelId"
            :options="panelOptions"
            placeholder="选择面板"
            class="panel-select"
          />
          <button class="monica-btn monica-btn-secondary" @click="resetCurrentSubGrid">
            清空布局
          </button>
        </div>
      </div>

      <div v-if="selectedPanelId" class="grid-manager">
        <div class="grid-container">
          <div
            v-for="(row, rowIndex) in currentSubGrid"
            :key="rowIndex"
            class="grid-row"
          >
            <div
              v-for="(toolId, colIndex) in row"
              :key="`${rowIndex}-${colIndex}`"
              class="grid-cell"
              :class="{ 'empty': !toolId }"
              @click="openSubToolSelector(rowIndex, colIndex)"
            >
              <template v-if="toolId">
                <div class="tool-icon">
                  <span class="tool-icon-text">{{ getToolIconName(toolId) }}</span>
                </div>
                <div class="tool-name">{{ getToolLabel(toolId) }}</div>
                <button
                  class="remove-btn"
                  @click.stop="removeToolFromSubGrid(rowIndex, colIndex)"
                >
                  <close-icon/>
                </button>
              </template>
              <template v-else>
                <div class="empty-placeholder">
                  <add-icon/>
                  <span>点击添加</span>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="empty-tip">
        <span class="empty-text">请选择一个面板来管理工具布局</span>
      </div>
    </div>

    <t-dialog
      v-model:visible="showAddPanelDialog"
      header="添加面板"
      placement="center"
      @confirm="handleAddPanel"
      class="monica-dialog"
    >
      <div class="dialog-form">
        <div class="form-item">
          <label class="form-label">面板ID</label>
          <t-input
            v-model="newPanelForm.id"
            placeholder="请输入唯一标识，如: my-tools"
          />
        </div>
        <div class="form-item">
          <label class="form-label">面板名称</label>
          <t-input
            v-model="newPanelForm.label"
            placeholder="请输入显示名称"
          />
        </div>
      </div>
    </t-dialog>

    <t-dialog
      v-model:visible="showToolSelector"
      header="选择工具"
      width="600px"
      class="monica-dialog"
      placement="center"
      :footer="false"
    >
      <div class="tool-selector">
        <div class="search-box">
          <t-input
            v-model="toolSearchKeyword"
            placeholder="搜索工具"
          >
            <template #prefix-icon>
              <search-icon/>
            </template>
          </t-input>
        </div>
        <div class="tool-list local-scroll">
          <div
            v-for="tool in filteredTools"
            :key="tool.id"
            class="tool-option"
            @click="selectTool(tool.id)"
          >
            <div class="tool-option-icon">
              <span>{{ getToolIconName(tool.id) }}</span>
            </div>
            <div class="tool-option-info">
              <div class="tool-option-label">{{ tool.label }}</div>
              <div class="tool-option-desc">{{ tool.desc || '无描述' }}</div>
            </div>
          </div>
        </div>
      </div>
    </t-dialog>
  </div>
</template>

<script lang="ts" setup>
import {
  AddIcon,
  DeleteIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  CloseIcon,
  SearchIcon,
  RefreshIcon
} from 'tdesign-icons-vue-next';
import {useToolVisibleStore} from '@/store/ToolVisibleStore.ts';
import type {PanelConfig} from '@/global/PluginList.ts';
import {computed, ref} from 'vue';
import MessageUtil from '@/util/model/MessageUtil.ts';

const toolStore = useToolVisibleStore();

const selectedPanelId = ref<string>('');
const showAddPanelDialog = ref(false);
const showToolSelector = ref(false);
const toolSearchKeyword = ref('');
const editingCell = ref<{ row: number; col: number; isMain: boolean } | null>(null);

const newPanelForm = ref({
  id: '',
  label: ''
});

const sortedPanels = computed(() => {
  return [...toolStore.panels].sort((a, b) => a.order - b.order);
});

const panelOptions = computed(() => {
  return sortedPanels.value.map(panel => ({
    label: panel.label,
    value: panel.id
  }));
});

const mainGrid = computed(() => toolStore.mainGrid);

const currentSubGrid = computed(() => {
  if (!selectedPanelId.value) return [];
  return toolStore.getSubGrid(selectedPanelId.value);
});

const filteredTools = computed(() => {
  const keyword = toolSearchKeyword.value.toLowerCase();
  return toolStore.availableTools.filter(tool => {
    if (keyword) {
      return tool.label.toLowerCase().includes(keyword) ||
        tool.id.toLowerCase().includes(keyword);
    }
    return true;
  });
});

function movePanelUp(panelId: string) {
  const panels = [...sortedPanels.value];
  const index = panels.findIndex(p => p.id === panelId);
  if (index > 0) {
    [panels[index], panels[index - 1]] = [panels[index - 1], panels[index]];
    const newOrder = panels.map(p => p.id);
    toolStore.reorderPanels(newOrder);
  }
}

function movePanelDown(panelId: string) {
  const panels = [...sortedPanels.value];
  const index = panels.findIndex(p => p.id === panelId);
  if (index < panels.length - 1) {
    [panels[index], panels[index + 1]] = [panels[index + 1], panels[index]];
    const newOrder = panels.map(p => p.id);
    toolStore.reorderPanels(newOrder);
  }
}

function updatePanelVisible(panelId: string, visible: boolean) {
  toolStore.updatePanel(panelId, {visible});
}

function handleDeletePanel(panelId: string) {
  toolStore.removePanel(panelId);
  if (selectedPanelId.value === panelId) {
    selectedPanelId.value = '';
  }
  MessageUtil.success('面板已删除');
}

function handleAddPanel() {
  if (!newPanelForm.value.id || !newPanelForm.value.label) {
    MessageUtil.warning('请填写完整信息');
    return;
  }

  const exists = toolStore.panels.some(p => p.id === newPanelForm.value.id);
  if (exists) {
    MessageUtil.error('面板ID已存在');
    return;
  }

  const newPanel: PanelConfig = {
    id: newPanelForm.value.id,
    label: newPanelForm.value.label,
    order: toolStore.panels.length,
    visible: true
  };

  toolStore.addPanel(newPanel);
  newPanelForm.value = {id: '', label: ''};
  showAddPanelDialog.value = false;
  MessageUtil.success('面板已添加');
}

function resetMainGrid() {
  toolStore.resetMainGrid();
  MessageUtil.success('全局布局已清空');
}

function resetCurrentSubGrid() {
  if (selectedPanelId.value) {
    toolStore.resetSubGrid(selectedPanelId.value);
    MessageUtil.success('布局已清空');
  }
}

function handleResetAll() {
  toolStore.resetAll();
  selectedPanelId.value = '';
  MessageUtil.success('所有设置已重置');
}

function openMainToolSelector(row: number, col: number) {
  editingCell.value = {row, col, isMain: true};
  toolSearchKeyword.value = '';
  showToolSelector.value = true;
}

function openSubToolSelector(row: number, col: number) {
  editingCell.value = {row, col, isMain: false};
  toolSearchKeyword.value = '';
  showToolSelector.value = true;
}

function selectTool(toolId: string) {
  if (editingCell.value) {
    if (editingCell.value.isMain) {
      toolStore.setMainGridTool(editingCell.value.row, editingCell.value.col, toolId);
    } else if (selectedPanelId.value) {
      toolStore.setSubGridTool(
        selectedPanelId.value,
        editingCell.value.row,
        editingCell.value.col,
        toolId
      );
    }
    showToolSelector.value = false;
    editingCell.value = null;
  }
}

function removeToolFromMainGrid(row: number, col: number) {
  toolStore.setMainGridTool(row, col, null);
}

function removeToolFromSubGrid(row: number, col: number) {
  if (selectedPanelId.value) {
    toolStore.setSubGridTool(selectedPanelId.value, row, col, null);
  }
}

function getToolLabel(toolId: string): string {
  const tool = toolStore.getToolInfo(toolId);
  return tool?.label || toolId;
}

function getToolIconName(toolId: string): string {
  const tool = toolStore.getToolInfo(toolId);
  const iconName = tool?.icon || 'HelpIcon';
  return iconName.replace('Icon', '');
}
</script>

<style scoped lang="less">
@import "panel-setting.less";
</style>
