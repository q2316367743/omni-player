import {defineStore} from "pinia";
import {LocalName} from "@/global/LocalName.ts";
import {computed} from "vue";

// ============================================
// 工具分类定义（来自 ToolsPage.vue）
// ============================================

export type ToolCategory = 'productivity' | 'ai' | 'programmer' | 'online' | 'system';

// 分类配置
export interface CategoryConfig {
  id: ToolCategory;
  label: string;
  order: number;
  visible: boolean;
}

// 工具项定义（来自 ToolsPage.vue）
export interface ToolItem {
  id: string;
  label: string;
  category: ToolCategory;
  icon: string;
  tone: string;
  desc?: string;
  disabled?: boolean;
  platform?: string[];
}

// 工具可见性配置
export interface ToolVisibility {
  toolId: string;
  visible: boolean;
  order: number;
}

// 完整的工具面板配置
export interface ToolPanelConfig {
  categories: CategoryConfig[];
  tools: ToolVisibility[];
  version: number;
}

// ============================================
// 默认数据（来自 ToolsPage.vue）
// ============================================

// 默认分类配置
export const DEFAULT_CATEGORIES: CategoryConfig[] = [
  { id: 'productivity', label: '程序员三件套', order: 0, visible: true },
  { id: 'ai', label: 'AI 工具', order: 1, visible: true },
  { id: 'programmer', label: '程序员套件', order: 2, visible: true },
  { id: 'online', label: '在线工具', order: 3, visible: true },
  { id: 'system', label: '系统工具', order: 4, visible: true },
];

// 默认工具列表（来自 ToolsPage.vue）
export const DEFAULT_TOOLS: ToolItem[] = [
  // 程序员三件套 (productivity)
  { id: 'todo', label: '待办', category: 'productivity', icon: 'CheckRectangleIcon', tone: 'media', desc: '井井有条' },
  { id: 'editor', label: '笔记', category: 'productivity', icon: 'Edit1Icon', tone: 'media', desc: '妙笔生花' },
  { id: 'bookkeeping', label: '记账', category: 'productivity', icon: 'MoneyIcon', tone: 'media', desc: '精打细算' },

  // AI 工具
  { id: 'ai/chat', label: '聊天', category: 'ai', icon: 'ChatIcon', tone: 'ai' },
  { id: 'ai/roundtable', label: '圆桌会', category: 'ai', icon: 'UsergroupIcon', tone: 'ai' },

  // 程序员套件
  { id: 'programmer/regex', label: '正则表达式', category: 'programmer', icon: 'CodeIcon', tone: 'regex' },
  { id: 'programmer/http', label: '简单请求', category: 'programmer', icon: 'InternetIcon', tone: 'regex' },
  { id: 'programmer/nginx', label: 'nginx', category: 'programmer', icon: 'InternetIcon', tone: 'regex' },
  { id: 'programmer/release', label: '发版助手', category: 'programmer', icon: 'GitMergeIcon', tone: 'regex' },
  { id: 'programmer/snippet', label: '代码片段', category: 'programmer', icon: 'Code1Icon', tone: 'regex' },
  { id: 'programmer/command', label: '命令助手', category: 'programmer', icon: 'CommandIcon', tone: 'disabled', disabled: true },

  // 在线工具
  { id: 'fanyi', label: '在线翻译', category: 'online', icon: 'TranslateIcon', tone: 'online', desc: '在线双向翻译' },
  { id: 'dailyhot', label: '今日热搜', category: 'online', icon: 'ArticleIcon', tone: 'online', desc: '查看各大榜单的今日热榜排行' },
  { id: 'qushuiyin', label: '去水印', category: 'online', icon: 'VideoIcon', tone: 'disabled', disabled: true, desc: '视频图片水印去除' },
  { id: 'online/image', label: '随机图片', category: 'online', icon: 'ImageIcon', tone: 'disabled', disabled: true, desc: '随机图片' },

  // 系统工具
  { id: 'system/port', label: '端口扫描', category: 'system', icon: 'PortraitIcon', tone: 'todo' },
  { id: 'system/homebrew', label: 'Homebrew', category: 'system', icon: 'HomebrewIcon', tone: 'todo', platform: ['macos', 'linux'] },
];

// ============================================
// 辅助函数
// ============================================

// 生成默认工具可见性配置
function generateDefaultToolVisibility(): ToolVisibility[] {
  return DEFAULT_TOOLS.map((tool, index) => ({
    toolId: tool.id,
    visible: !tool.disabled,
    order: index,
  }));
}

// 生成默认配置
function generateDefaultConfig(): ToolPanelConfig {
  return {
    categories: DEFAULT_CATEGORIES,
    tools: generateDefaultToolVisibility(),
    version: 1,
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

  // 获取工具可见性配置
  const toolVisibilityMap = computed(() => {
    const map = new Map<string, ToolVisibility>();
    const tools = config.value.tools || generateDefaultToolVisibility();
    tools.forEach(t => map.set(t.toolId, t));
    return map;
  });

  // 获取指定分类下的可见工具
  function getVisibleToolsByCategory(categoryId: ToolCategory) {
    return DEFAULT_TOOLS
      .filter(tool => {
        // 匹配分类
        if (tool.category !== categoryId) return false;

        // 检查平台限制
        if (tool.platform && tool.platform.length > 0) {
          if (!currentPlatform.value || !tool.platform.includes(currentPlatform.value)) {
            return false;
          }
        }

        // 检查可见性配置
        const visibility = toolVisibilityMap.value.get(tool.id);
        if (visibility) {
          return visibility.visible;
        }

        // 默认可见性
        return !tool.disabled;
      })
      .sort((a, b) => {
        const visA = toolVisibilityMap.value.get(a.id);
        const visB = toolVisibilityMap.value.get(b.id);
        const orderA = visA?.order ?? 0;
        const orderB = visB?.order ?? 0;
        return orderA - orderB;
      });
  }

  // 检查工具是否可见
  function isToolVisible(toolId: string): boolean {
    const visibility = toolVisibilityMap.value.get(toolId);
    if (visibility) {
      return visibility.visible;
    }
    const tool = DEFAULT_TOOLS.find(t => t.id === toolId);
    return tool ? !tool.disabled : false;
  }

  // 设置工具可见性
  function setToolVisible(toolId: string, visible: boolean) {
    const tools = config.value.tools || generateDefaultToolVisibility();
    const existing = tools.find(t => t.toolId === toolId);
    if (existing) {
      existing.visible = visible;
    } else {
      tools.push({
        toolId,
        visible,
        order: tools.length,
      });
    }
    config.value.tools = [...tools];
  }

  // 设置工具排序
  function setToolOrder(toolId: string, order: number) {
    const tools = config.value.tools || generateDefaultToolVisibility();
    const existing = tools.find(t => t.toolId === toolId);
    if (existing) {
      existing.order = order;
    } else {
      tools.push({
        toolId,
        visible: true,
        order,
      });
    }
    config.value.tools = [...tools];
  }

  // 批量更新工具排序（用于拖拽排序）
  function updateToolsOrder(orderedToolIds: string[]) {
    const tools = config.value.tools || generateDefaultToolVisibility();
    orderedToolIds.forEach((toolId, index) => {
      const existing = tools.find(t => t.toolId === toolId);
      if (existing) {
        existing.order = index;
      } else {
        tools.push({
          toolId,
          visible: true,
          order: index,
        });
      }
    });
    config.value.tools = [...tools];
  }

  // 设置分类可见性
  function setCategoryVisible(categoryId: ToolCategory, visible: boolean) {
    const cats = config.value.categories || DEFAULT_CATEGORIES;
    const existing = cats.find(c => c.id === categoryId);
    if (existing) {
      existing.visible = visible;
    } else {
      const defaultCat = DEFAULT_CATEGORIES.find(c => c.id === categoryId);
      if (defaultCat) {
        cats.push({ ...defaultCat, visible });
      }
    }
    config.value.categories = [...cats];
  }

  // 设置分类排序
  function setCategoryOrder(categoryId: ToolCategory, order: number) {
    const cats = config.value.categories || DEFAULT_CATEGORIES;
    const existing = cats.find(c => c.id === categoryId);
    if (existing) {
      existing.order = order;
    }
    config.value.categories = [...cats];
  }

  // 批量更新分类排序
  function updateCategoriesOrder(orderedCategoryIds: ToolCategory[]) {
    const cats = config.value.categories || DEFAULT_CATEGORIES;
    orderedCategoryIds.forEach((catId, index) => {
      const existing = cats.find(c => c.id === catId);
      if (existing) {
        existing.order = index;
      }
    });
    config.value.categories = [...cats];
  }

  // 重置为默认配置
  function resetToDefault() {
    config.value = generateDefaultConfig();
  }

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
    toolVisibilityMap,

    // Actions
    setPlatform,
    getVisibleToolsByCategory,
    isToolVisible,
    setToolVisible,
    setToolOrder,
    updateToolsOrder,
    setCategoryVisible,
    setCategoryOrder,
    updateCategoriesOrder,
    resetToDefault,
    getToolInfo,
  };
});
