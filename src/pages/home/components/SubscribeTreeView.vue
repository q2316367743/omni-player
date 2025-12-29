<template>
  <div class="subscribe-tree-container">
    <div 
      v-for="node in nodes" 
      :key="node.id" 
      class="tree-node"
      :style="{ paddingLeft: level * 20 + 'px' }"
    >
      <div 
        :class="{
          'tree-item': true,
          'folder-item': node.type === 'folder',
          'subscribe-item': node.type === 'item'
        }"
        @click="handleClick(node)"
        @contextmenu="handleContextMenu(node, $event)"
      >
        <div class="item-content">
          <template v-if="node.type === 'folder'">
            <span class="folder-icon" @click.stop="toggleExpand(node)">
              <chevron-down-icon v-if="node.expanded"/>
              <chevron-right-icon v-else />
            </span>
            <folder-icon class="item-icon folder-icon-color"/>
            <span class="item-text">{{ node.name }}</span>
            <span class="item-count">{{ getTotalCount(node) }}</span>
          </template>
          <template v-else-if="node.type === 'item' && node.data">
            <rss-icon class="item-icon subscribe-icon-color"/>
            <span class="item-text">{{ node.data.name }}</span>
            <span v-if="node.data.count" class="item-count">{{ node.data.count }}</span>
          </template>
        </div>
      </div>
      <subscribe-tree-view 
        v-if="node.type === 'folder' && node.expanded && node.children" 
        :nodes="node.children" 
        :level="level + 1"
        @jump="$emit('jump', $event)"
        @contextmenu="$emit('contextmenu', $event)"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ChevronDownIcon, ChevronRightIcon, FolderIcon, RssIcon} from "tdesign-icons-vue-next";
import type {TreeNode} from "@/store/SubscribeStore.ts";
import {useSubscribeStore} from "@/store/SubscribeStore.ts";

interface Props {
  nodes: TreeNode[];
  level?: number;
}

const { level = 0 } = defineProps<Props>();

const emit = defineEmits(['jump', 'contextmenu']);

const subscribeStore = useSubscribeStore();

const toggleExpand = (node: TreeNode) => {
  if (node.type === 'folder') {
    subscribeStore.toggleFolderExpanded(node.path);
  }
};

const getTotalCount = (node: TreeNode): number => {
  if (node.type === 'item' && node.data) {
    return node.data.count || 0;
  }
  if (node.type === 'folder' && node.children) {
    return node.children.reduce((total, child) => total + getTotalCount(child), 0);
  }
  return 0;
};

const handleClick = (node: TreeNode) => {
  if (node.type === 'folder') {
    toggleExpand(node);
  } else if (node.type === 'item' && node.data) {
    emit('jump', node.data.id);
  }
};

const handleContextMenu = (node: TreeNode, e: PointerEvent) => {
  if (node.type === 'item' && node.data) {
    emit('contextmenu', node.data, e);
  }
};
</script>

<style scoped lang="less">
.subscribe-tree-container {
  .tree-node {
    margin-bottom: 2px;
  }

  .tree-item {
    display: flex;
    align-items: center;
    padding: 6px 10px;
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

    .item-content {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
      min-width: 0;
    }

    .folder-icon {
      font-size: 10px;
      color: var(--td-text-color-secondary);
      transition: transform 0.2s ease;
      flex-shrink: 0;

      &:hover {
        color: var(--td-text-color-primary);
      }
    }

    .item-icon {
      font-size: 16px;
      flex-shrink: 0;
    }

    .folder-icon-color {
      color: #f5a623;
    }

    .subscribe-icon-color {
      color: #ff6b6b;
    }

    .item-text {
      font-size: 13px;
      font-weight: 500;
      color: var(--td-text-color-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-left: 2px;
    }

    .item-count {
      font-size: 11px;
      color: var(--td-text-color-secondary);
      background: var(--td-bg-color-page);
      padding: 1px 6px;
      border-radius: 8px;
      margin-left: auto;
      flex-shrink: 0;
    }
  }

  .folder-item {
    .item-text {
      font-weight: 600;
    }
  }

  .subscribe-item {
    .item-text {
      font-weight: 500;
    }
  }
}
</style>
