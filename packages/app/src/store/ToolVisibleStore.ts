import {defineStore} from "pinia";
import {LocalName} from "@/global/LocalName.ts";
import {computed} from "vue";
import {
  DEFAULT_CATEGORIES,
  DEFAULT_TOOLS,
  type ToolCategory,
  type ToolGrid,
  type ToolItem,
  type ToolPanelConfig
} from "@/global/PluginList.ts";

const MAIN_ROWS = 3;
const MAIN_COLS = 4;
const SUB_ROWS = 4;
const SUB_COLS = 4;

function createEmptyGrid(rows: number, cols: number): ToolGrid {
  return Array.from({ length: rows }, () => Array(cols).fill(null));
}

function generateDefaultMainGrid(): ToolGrid {
  const grid = createEmptyGrid(MAIN_ROWS, MAIN_COLS);
  const tools = DEFAULT_TOOLS.filter(t => t.category === 'productivity' && !t.disabled);
  
  for (let r = 0; r < MAIN_ROWS; r++) {
    for (let c = 0; c < MAIN_COLS; c++) {
      const index = r * MAIN_COLS + c;
      if (index < tools.length) {
        grid[r][c] = tools[index].id;
      }
    }
  }
  
  return grid;
}

function generateDefaultSubGrid(categoryId: ToolCategory): ToolGrid {
  const grid = createEmptyGrid(SUB_ROWS, SUB_COLS);
  const tools = DEFAULT_TOOLS.filter(t => t.category === categoryId && !t.disabled);
  
  for (let r = 0; r < SUB_ROWS; r++) {
    for (let c = 0; c < SUB_COLS; c++) {
      const index = r * SUB_COLS + c;
      if (index < tools.length) {
        grid[r][c] = tools[index].id;
      }
    }
  }
  
  return grid;
}

function generateDefaultSubGrids(): Record<ToolCategory, ToolGrid> {
  const grids: Record<ToolCategory, ToolGrid> = {} as Record<ToolCategory, ToolGrid>;
  
  DEFAULT_CATEGORIES.forEach(cat => {
    if (cat.id !== 'productivity') {
      grids[cat.id] = generateDefaultSubGrid(cat.id);
    }
  });
  
  return grids;
}

function generateDefaultConfig(): ToolPanelConfig {
  return {
    categories: DEFAULT_CATEGORIES,
    mainGrid: generateDefaultMainGrid(),
    subGrids: generateDefaultSubGrids(),
    version: 3,
  };
}

function migrateOldConfig(oldConfig: any): ToolPanelConfig {
  if (oldConfig.version >= 3) {
    return oldConfig;
  }
  
  const newConfig = generateDefaultConfig();
  
  if (oldConfig.categories) {
    newConfig.categories = oldConfig.categories;
  }
  
  if (oldConfig.slots && Array.isArray(oldConfig.slots)) {
    for (const slot of oldConfig.slots) {
      const idx = slot.slotIndex;
      if (idx < 12 && slot.toolId) {
        const r = Math.floor(idx / MAIN_COLS);
        const c = idx % MAIN_COLS;
        if (r < MAIN_ROWS) {
          newConfig.mainGrid[r][c] = slot.toolId;
        }
      }
    }
  }
  
  return newConfig;
}

export const useToolVisibleStore = defineStore('tool-visible', () => {
  const rawConfig = useLocalStorage<any>(LocalName.KEY_SETTING_TOOL, generateDefaultConfig());
  
  const config = computed<ToolPanelConfig>({
    get: () => migrateOldConfig(rawConfig.value),
    set: (val) => { rawConfig.value = val; }
  });

  const currentPlatform = ref<string>('');

  function setPlatform(platform: string) {
    currentPlatform.value = platform;
  }

  const categories = computed(() => {
    const cats = config.value.categories || DEFAULT_CATEGORIES;
    return [...cats].sort((a, b) => a.order - b.order);
  });

  const visibleCategories = computed(() => {
    return categories.value.filter(cat => cat.visible);
  });

  const allTools = computed(() => DEFAULT_TOOLS);

  const mainGrid = computed<ToolGrid>(() => {
    return config.value.mainGrid || generateDefaultMainGrid();
  });

  const subGrids = computed<Record<ToolCategory, ToolGrid>>(() => {
    return config.value.subGrids || generateDefaultSubGrids();
  });

  function getSubGrid(categoryId: ToolCategory): ToolGrid {
    return subGrids.value[categoryId] || createEmptyGrid(SUB_ROWS, SUB_COLS);
  }

  function getVisibleToolsByCategory(categoryId: ToolCategory): ToolItem[] {
    return DEFAULT_TOOLS.filter(tool => {
      if (tool.category !== categoryId) return false;
      if (tool.platform && tool.platform.length > 0) {
        if (!currentPlatform.value || !tool.platform.includes(currentPlatform.value)) {
          return false;
        }
      }
      return !tool.disabled;
    });
  }

  function getToolInfo(toolId: string): ToolItem | undefined {
    return DEFAULT_TOOLS.find(t => t.id === toolId);
  }

  function setMainGridTool(row: number, col: number, toolId: string | null) {
    if (row >= 0 && row < MAIN_ROWS && col >= 0 && col < MAIN_COLS) {
      const newGrid = mainGrid.value.map(r => [...r]);
      newGrid[row][col] = toolId;
      config.value = { ...config.value, mainGrid: newGrid };
    }
  }

  function setSubGridTool(categoryId: ToolCategory, row: number, col: number, toolId: string | null) {
    if (row >= 0 && row < SUB_ROWS && col >= 0 && col < SUB_COLS) {
      const newSubGrids = { ...subGrids.value };
      if (!newSubGrids[categoryId]) {
        newSubGrids[categoryId] = createEmptyGrid(SUB_ROWS, SUB_COLS);
      }
      newSubGrids[categoryId] = newSubGrids[categoryId].map(r => [...r]);
      newSubGrids[categoryId][row][col] = toolId;
      config.value = { ...config.value, subGrids: newSubGrids };
    }
  }

  function swapMainGridTools(r1: number, c1: number, r2: number, c2: number) {
    const newGrid = mainGrid.value.map(r => [...r]);
    const temp = newGrid[r1][c1];
    newGrid[r1][c1] = newGrid[r2][c2];
    newGrid[r2][c2] = temp;
    config.value = { ...config.value, mainGrid: newGrid };
  }

  function swapSubGridTools(categoryId: ToolCategory, r1: number, c1: number, r2: number, c2: number) {
    const newSubGrids = { ...subGrids.value };
    if (!newSubGrids[categoryId]) {
      newSubGrids[categoryId] = createEmptyGrid(SUB_ROWS, SUB_COLS);
    }
    newSubGrids[categoryId] = newSubGrids[categoryId].map(r => [...r]);
    const temp = newSubGrids[categoryId][r1][c1];
    newSubGrids[categoryId][r1][c1] = newSubGrids[categoryId][r2][c2];
    newSubGrids[categoryId][r2][c2] = temp;
    config.value = { ...config.value, subGrids: newSubGrids };
  }

  return {
    config,
    currentPlatform,
    categories,
    visibleCategories,
    allTools,
    mainGrid,
    subGrids,
    getSubGrid,
    setPlatform,
    getVisibleToolsByCategory,
    getToolInfo,
    setMainGridTool,
    setSubGridTool,
    swapMainGridTools,
    swapSubGridTools,
  };
});
