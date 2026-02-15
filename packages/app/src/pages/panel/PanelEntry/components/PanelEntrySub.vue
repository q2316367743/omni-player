<template>
  <div class="sub-section">
    <div class="sub-header">
      <span class="sub-title">{{ currentCategory?.label || '工具' }}</span>
      <div class="sub-pagination">
        <span
          v-for="(cat, index) in visibleCategories"
          :key="cat.id"
          class="pagination-dot"
          :class="{ 'active': currentCategoryIndex === index }"
          @click="currentCategoryIndex = index"
        />
      </div>
      <div class="sub-actions">
        <t-button theme="default" variant="text" size="small" class="action-btn-small">
          <search-icon/>
        </t-button>
        <t-button theme="default" variant="text" size="small" class="action-btn-small">
          <gesture-up-icon/>
        </t-button>
      </div>
    </div>
    <div
      class="sub-grid-wrapper"
      @wheel="handleWheel"
    >
      <transition :name="slideDirection" mode="out-in">
        <div
          :key="currentCategory?.id"
          class="sub-grid"
        >
          <div
            v-for="(tool, index) in currentCategoryTools"
            :key="tool?.id || `empty-${index}`"
            class="sub-tool-item"
            :class="{ 'empty': !tool }"
            @click="tool && handleToolClick(tool)"
          >
            <template v-if="tool">
              <div class="sub-tool-icon">
                <PanelEntryIcon :name="tool.icon"/>
              </div>
              <div class="sub-tool-name">{{ tool.label }}</div>
            </template>
            <template v-else>
              <div class="empty-icon">
                <add-icon/>
              </div>
            </template>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { AddIcon, GestureUpIcon, SearchIcon } from "tdesign-icons-vue-next";
import { useToolVisibleStore, type ToolItem } from "@/store/ToolVisibleStore.ts";
import PanelEntryIcon from "@/pages/panel/PanelEntry/components/PanelEntryIcon.vue";

const emit = defineEmits(['select']);

// Store
const toolStore = useToolVisibleStore();

// 当前分类索引
const currentCategoryIndex = ref(0);

// 滑动方向
const slideDirection = ref('slide-left');

// 滚轮节流
let wheelThrottle = false;

// 监听索引变化，确定滑动方向
watch(currentCategoryIndex, (newIndex, oldIndex) => {
  const total = visibleCategories.value.length;
  if (total <= 1) return;
  
  // 判断是否是循环跳转
  const isForwardJump = (newIndex === 0 && oldIndex === total - 1);
  const isBackwardJump = (newIndex === total - 1 && oldIndex === 0);
  
  if (isForwardJump || newIndex > oldIndex) {
    slideDirection.value = 'slide-left';
  } else if (isBackwardJump || newIndex < oldIndex) {
    slideDirection.value = 'slide-right';
  }
});

// 获取可见的分类（排除 productivity，因为它在主区域显示）
const visibleCategories = computed(() => {
  return toolStore.visibleCategories.filter(cat => cat.id !== 'productivity');
});

// 当前分类
const currentCategory = computed(() => {
  return visibleCategories.value[currentCategoryIndex.value];
});

// 当前分类的工具列表（最多16个，填充空位）
const currentCategoryTools = computed(() => {
  const category = currentCategory.value;
  if (!category) return Array(16).fill(null);

  const tools = toolStore.getVisibleToolsByCategory(category.id);
  const result: (ToolItem | null)[] = [...tools.slice(0, 16)];
  while (result.length < 16) {
    result.push(null);
  }
  return result;
});

// 处理滚轮事件
function handleWheel(event: WheelEvent) {
  if (wheelThrottle) return;
  
  const total = visibleCategories.value.length;
  if (total <= 1) return;
  
  wheelThrottle = true;
  setTimeout(() => {
    wheelThrottle = false;
  }, 500);
  
  if (event.deltaY > 0) {
    // 向下滚动，下一页
    currentCategoryIndex.value = (currentCategoryIndex.value + 1) % total;
  } else {
    // 向上滚动，上一页
    currentCategoryIndex.value = (currentCategoryIndex.value - 1 + total) % total;
  }
}

// 处理工具点击
const handleToolClick = (tool: ToolItem) => {
  emit('select', tool.id);
};
</script>

<style scoped lang="less">
.sub-header {
  position: relative;
  display: flex;
  align-items: center;
}

.sub-pagination {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;

  .pagination-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    border: 1px solid var(--td-text-color-secondary);
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      border-color: var(--td-brand-color);
    }

    &.active {
      background-color: var(--td-brand-color);
      border-color: var(--td-brand-color);
    }
  }
}

.sub-grid-wrapper {
  position: relative;
  overflow: hidden;
}

// 左滑动画
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s ease;
}

.slide-left-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-left-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-right-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-right-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
