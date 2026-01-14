<template>
  <div class="todo-plan-tree-container">
    <div 
      v-for="node in nodes" 
      :key="node.id" 
      class="tree-node"
      :style="{ paddingLeft: level * 20 + 'px' }"
    >
      <div 
        :class="{
          'tree-item': true,
          'folder-item': node.folder,
          'plan-item': !node.folder,
          'active': modelValue === node.id
        }"
        @click="handleClick(node)"
        @contextmenu="handleContextMenu(node, $event)"
      >
        <div class="item-content">
          <template v-if="node.folder">
            <folder-open-icon v-if="node.expanded" class="item-icon folder-icon-color"/>
            <folder-icon v-else class="item-icon folder-icon-color"/>
            <span class="item-text">{{ node.name }}</span>
            <span class="item-count">{{ getGroupCount(node) }}</span>
          </template>
          <template v-else>
            <file-icon class="item-icon plan-icon-color"/>
            <span class="item-text">{{ node.name }}</span>
            <span class="item-count">{{ getGroupCount(node) }}</span>
          </template>
        </div>
      </div>
      <todo-plan-tree 
        v-if="node.folder && node.expanded && node.children" 
        :model-value="modelValue"
        :nodes="node.children" 
        :level="level + 1"
        @update:model-value="$emit('update:modelValue', $event)"
        @contextmenu="$emit('contextmenu', $event)"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import {FolderIcon, FolderOpenIcon, FileIcon} from "tdesign-icons-vue-next";
import type {TodoPlan} from "@/entity/todo/TodoPlan.ts";

interface TreeNode extends TodoPlan {
  expanded?: boolean;
  children?: TreeNode[];
}

interface Props {
  nodes: TreeNode[];
  level?: number;
  modelValue?: string;
}

withDefaults(defineProps<Props>(), {
  level: 0,
  modelValue: ''
});

const emit = defineEmits(['update:modelValue', 'contextmenu']);

const toggleExpand = (node: TreeNode) => {
  if (node.folder) {
    node.expanded = !node.expanded;
  }
};

const getGroupCount = (node: TreeNode): number => {
  if (node.folder && node.children) {
    return node.children.reduce((total, child) => total + getGroupCount(child), 0);
  }
  return node.groupCount || 0;
};

const handleClick = (node: TreeNode) => {
  if (node.folder) {
    toggleExpand(node);
  } else {
    emit('update:modelValue', node.id);
  }
};

const handleContextMenu = (node: TreeNode, e: PointerEvent) => {
  emit('contextmenu', node, e);
};
</script>

<style scoped lang="less">
.todo-plan-tree-container {
  .tree-node {
    margin-bottom: 2px;
  }

  .tree-item {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    background: var(--td-bg-color-container);
    border: 1px solid transparent;

    &:hover {
      background: var(--td-bg-color-container-hover);
      border-color: var(--td-brand-color-light);
      transform: translateX(2px);
    }

    &.active {
      background: var(--td-brand-color-1);
      border-color: var(--td-brand-color);
    }

    .item-content {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
      min-width: 0;
    }

    .item-icon {
      font-size: 16px;
      flex-shrink: 0;
    }

    .folder-icon-color {
      color: #f5a623;
    }

    .plan-icon-color {
      color: #5b8ff9;
    }

    .item-text {
      font-size: 14px;
      color: var(--td-text-color-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-left: 2px;
    }

    .item-count {
      font-size: 12px;
      color: var(--td-text-color-secondary);
      background: var(--td-bg-color-page);
      padding: 2px 8px;
      border-radius: 10px;
      margin-left: auto;
      flex-shrink: 0;
    }
  }
}
</style>
