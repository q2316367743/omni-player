import {defineStore} from "pinia";
import {LocalName} from "@/global/LocalName.ts";
import {computed, ref} from "vue";
import {
  DEFAULT_PANELS,
  DEFAULT_TOOLS,
  type PanelConfig,
  type ToolGrid,
  type ToolItem,
  type ToolItemPlatform,
  type ToolItemTypeInner
} from "@/global/PluginList.ts";
import {listPlugin, onPluginChange} from "@/services/main/PluginService.ts";
import {logError, logInfo} from "@/lib/log.ts";
import {map} from "@/util";

const MAIN_GRID_ROWS = 3;
const MAIN_GRID_COLS = 4;

const SUB_GRID_ROWS = 4;
const SUB_GRID_COLS = 4;

function createEmptyMainGrid(): ToolGrid {
  return Array.from({length: MAIN_GRID_ROWS}, () => Array(MAIN_GRID_COLS).fill(null));
}

function createEmptySubGrid(): ToolGrid {
  return Array.from({length: SUB_GRID_ROWS}, () => Array(SUB_GRID_COLS).fill(null));
}

function generateDefaultSubGrids(): Record<string, ToolGrid> {
  const grids: Record<string, ToolGrid> = {};

  DEFAULT_PANELS.forEach(panel => {
    grids[panel.id] = createEmptySubGrid();
  });

  return grids;
}

function isInnerTool(tool: ToolItem): tool is ToolItem<ToolItemTypeInner> {
  return tool.type === 'inner';
}

export const useToolVisibleStore = defineStore('tool-visible', () => {

  // 面板配置
  const rawPanelConfig = useLocalStorage<PanelConfig[]>(LocalName.KEY_SETTING_TOOL_CATEGORY, DEFAULT_PANELS);
  // 主面板配置
  const rawMainGrid = useLocalStorage<ToolGrid>(LocalName.KEY_SETTING_TOOL_MAIN_GRID, createEmptyMainGrid());
  // 子面板配置
  const rawSubGridConfig = useLocalStorage<Record<string, ToolGrid>>(LocalName.KEY_SETTING_TOOL_GRID, generateDefaultSubGrids());
  // 工具列表
  const tools = ref<ToolItem[]>([]);
  // 当前的平台
  const currentPlatform = ref<ToolItemPlatform | ''>('');

  function setPlatform(platform: ToolItemPlatform) {
    currentPlatform.value = platform;
  }

  const panels = computed<PanelConfig[]>(() => {
    return rawPanelConfig.value || DEFAULT_PANELS;
  });

  const visiblePanels = computed<PanelConfig[]>(() => {
    return panels.value.filter(panel => panel.visible).sort((a, b) => a.order - b.order);
  });

  const allTools = computed<ToolItem[]>(() => ([
    ...tools.value,
    ...DEFAULT_TOOLS
  ]));

  const toolMap = computed(() => map(allTools.value, 'id'));

  const availableTools = computed<ToolItem[]>(() => {
    return allTools.value.filter(tool => {
      if (isInnerTool(tool) && tool.payload.disabled) return false;
      if (tool.platform && tool.platform.length > 0) {
        if (!currentPlatform.value || !tool.platform.includes(currentPlatform.value)) {
          return false;
        }
      }
      return true;
    });
  });

  const mainGrid = computed<Array<Array<ToolItem | undefined>>>(() => {
    return (rawMainGrid.value || createEmptyMainGrid()).map(row => {
      return row.map(col => {
        if (col) return toolMap.value.get(col);
        return undefined
      })
    });
  });

  // 注册插件变更事件
  onPluginChange(res => tools.value = res)
    .then(() => logInfo("[ToolVisibleStore] 注册插件变更事件成功"))
    .catch(e => logError("[ToolVisibleStore] 注册插件变更事件错误", e));

  async function initTool() {
    tools.value = await listPlugin();
  }

  function getSubGrid(panelId: string): Array<Array<ToolItem | undefined>> {
    return (rawSubGridConfig.value[panelId] || createEmptySubGrid()).map(row => {
      return row.map(col => {
        if (col) return toolMap.value.get(col);
        return undefined
      })
    });
  }

  function getToolInfo(toolId: string): ToolItem | undefined {
    return toolMap.value.get(toolId);
  }

  function setMainGridTool(row: number, col: number, toolId: string | null) {
    if (row >= 0 && row < MAIN_GRID_ROWS && col >= 0 && col < MAIN_GRID_COLS) {
      const newGrid = rawMainGrid.value.map(r => [...r]);
      newGrid[row]![col] = toolId;
      rawMainGrid.value = newGrid;
    }
  }

  function setSubGridTool(panelId: string, row: number, col: number, toolId: string | null) {
    if (row >= 0 && row < SUB_GRID_ROWS && col >= 0 && col < SUB_GRID_COLS) {
      const newGrids = {...rawSubGridConfig.value};
      if (!newGrids[panelId]) {
        newGrids[panelId] = createEmptySubGrid();
      }
      newGrids[panelId] = newGrids[panelId]!.map(r => [...r]);
      newGrids[panelId]![row]![col] = toolId;
      rawSubGridConfig.value = newGrids;
    }
  }

  function swapMainGridTools(r1: number, c1: number, r2: number, c2: number) {
    const newGrid = rawMainGrid.value.map(r => [...r]);
    const temp = newGrid[r1]![c1]!;
    newGrid[r1]![c1] = newGrid[r2]![c2]!;
    newGrid[r2]![c2] = temp;
    rawMainGrid.value = newGrid;
  }

  function swapSubGridTools(panelId: string, r1: number, c1: number, r2: number, c2: number) {
    const newGrids = {...rawSubGridConfig.value};
    if (!newGrids[panelId]) {
      newGrids[panelId] = createEmptySubGrid();
    }
    newGrids[panelId] = newGrids[panelId]!.map(r => [...r]);
    const temp = newGrids[panelId]![r1]![c1]!;
    newGrids[panelId]![r1]![c1] = newGrids[panelId]![r2]![c2]!;
    newGrids[panelId]![r2]![c2] = temp;
    rawSubGridConfig.value = newGrids;
  }

  function addPanel(panel: PanelConfig) {
    rawPanelConfig.value = [...panels.value, panel];

    const newGrids = {...rawSubGridConfig.value};
    if (!newGrids[panel.id]) {
      newGrids[panel.id] = createEmptySubGrid();
    }
    rawSubGridConfig.value = newGrids;
  }

  function updatePanel(panelId: string, updates: Partial<PanelConfig>) {
    rawPanelConfig.value = panels.value.map(panel =>
      panel.id === panelId ? {...panel, ...updates} : panel
    );
  }

  function removePanel(panelId: string) {
    rawPanelConfig.value = panels.value.filter(panel => panel.id !== panelId);

    const newGrids = {...rawSubGridConfig.value};
    delete newGrids[panelId];
    rawSubGridConfig.value = newGrids;
  }

  function reorderPanels(newOrder: string[]) {
    const newPanels: PanelConfig[] = [];
    newOrder.forEach((id, index) => {
      const existing = panels.value.find(p => p.id === id);
      if (existing) {
        newPanels.push({...existing, order: index});
      }
    });
    rawPanelConfig.value = newPanels;
  }

  function resetMainGrid() {
    rawMainGrid.value = createEmptyMainGrid();
  }

  function resetSubGrid(panelId: string) {
    const newGrids = {...rawSubGridConfig.value};
    newGrids[panelId] = createEmptySubGrid();
    rawSubGridConfig.value = newGrids;
  }

  function resetAll() {
    rawPanelConfig.value = DEFAULT_PANELS;
    rawMainGrid.value = createEmptyMainGrid();
    rawSubGridConfig.value = generateDefaultSubGrids();
  }

  return {
    currentPlatform,
    panels,
    visiblePanels,
    allTools,
    availableTools,
    mainGrid,
    toolMap,
    initTool,
    getSubGrid,
    setPlatform,
    getToolInfo,
    setMainGridTool,
    setSubGridTool,
    swapMainGridTools,
    swapSubGridTools,
    addPanel,
    updatePanel,
    removePanel,
    reorderPanels,
    resetMainGrid,
    resetSubGrid,
    resetAll,
  };
});
