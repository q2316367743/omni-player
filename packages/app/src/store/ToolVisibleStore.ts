import {defineStore} from "pinia";
import {LocalName} from "@/global/LocalName.ts";
import {computed} from "vue";
import {
  DEFAULT_CATEGORIES,
  DEFAULT_TOOLS,
  type ToolCategory, type ToolItem,
  type ToolPanelConfig,
  type ToolSlot
} from "@/global/PluginList.ts";

// ============================================
// 辅助函数
// ============================================

function generateDefaultSlots(): ToolSlot[] {
  const slots: ToolSlot[] = [];

  // 主区域 12 个槽位（0-11）
  const mainToolIds = DEFAULT_TOOLS
    .filter(t => t.category === 'productivity' && !t.disabled)
    .slice(0, 12)
    .map(t => t.id);

  for (let i = 0; i < 12; i++) {
    slots.push({ slotIndex: i, toolId: mainToolIds[i] || null });
  }

  // 分类区域 16 个槽位（12-27）
  const subToolIds = DEFAULT_TOOLS
    .filter(t => t.category !== 'productivity' && !t.disabled)
    .slice(0, 16)
    .map(t => t.id);

  for (let i = 0; i < 16; i++) {
    slots.push({ slotIndex: 12 + i, toolId: subToolIds[i] || null });
  }

  return slots;
}

function generateDefaultConfig(): ToolPanelConfig {
  return {
    categories: DEFAULT_CATEGORIES,
    slots: generateDefaultSlots(),
    version: 2,
  };
}

// ============================================
// Store 定义
// ============================================

export const useToolVisibleStore = defineStore('tool-visible', () => {
  // 使用 localStorage 存储配置
  const config = useLocalStorage<ToolPanelConfig>(LocalName.KEY_SETTING_TOOL, generateDefaultConfig());

  // 当前平台
  const currentPlatform = ref<string>('');

  // 设置当前平台
  function setPlatform(platform: string) {
    currentPlatform.value = platform;
  }

  // 获取所有分类（按 order 排序）
  const categories = computed(() => {
    const cats = config.value.categories || DEFAULT_CATEGORIES;
    return [...cats].sort((a, b) => a.order - b.order);
  });

  // 获取可见的分类
  const visibleCategories = computed(() => {
    return categories.value.filter(cat => cat.visible);
  });

  // 获取所有工具
  const allTools = computed(() => DEFAULT_TOOLS);

  // 获取指定分类下的可见工具
  function getVisibleToolsByCategory(categoryId: ToolCategory) {
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

  // 获取主区域槽位（0-11）
  const mainSlots = computed<ToolSlot[]>(() => {
    const currentSlots = config.value.slots || generateDefaultSlots();
    const result: ToolSlot[] = [];
    for (let i = 0; i < 12; i++) {
      const existing = currentSlots.find(s => s.slotIndex === i);
      result.push(existing ? { ...existing } : { slotIndex: i, toolId: null });
    }
    return result;
  });

  // 获取分类区域槽位（12-27）
  const subSlots = computed<ToolSlot[]>(() => {
    const currentSlots = config.value.slots || generateDefaultSlots();
    const result: ToolSlot[] = [];
    for (let i = 12; i < 28; i++) {
      const existing = currentSlots.find(s => s.slotIndex === i);
      result.push(existing ? { ...existing } : { slotIndex: i, toolId: null });
    }
    return result;
  });

  // 获取工具的完整信息
  function getToolInfo(toolId: string): ToolItem | undefined {
    return DEFAULT_TOOLS.find(t => t.id === toolId);
  }

  return {
    // State
    config,
    currentPlatform,

    // Getters
    categories,
    visibleCategories,
    allTools,
    mainSlots,
    subSlots,

    // Actions
    setPlatform,
    getVisibleToolsByCategory,
    getToolInfo,
  };
});
