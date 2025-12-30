<template>
  <div class="note-tree-container">
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
          'article-item': node.type === 'article',
          'active': selectedPath === node.path
        }"
        @click="handleClick(node)"
        @contextmenu="handleContextMenu(node, $event)"
      >
        <div class="item-content">
          <template v-if="node.type === 'folder'">
            <folder-open-icon v-if="node.expanded" class="item-icon folder-icon-color"/>
            <folder-icon v-else class="item-icon folder-icon-color"/>
            <span class="item-text">{{ node.name }}</span>
          </template>
          <template v-else>
            <file-icon class="item-icon article-icon-color"/>
            <span class="item-text">{{ node.name }}</span>
          </template>
        </div>
      </div>
      <note-tree
        v-if="node.type === 'folder' && node.expanded && node.children"
        :nodes="node.children"
        :level="level + 1"
        :selected-path="selectedPath"
        @select="$emit('select', $event)"
        @contextmenu="$emit('contextmenu', $event)"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import {FolderIcon, FolderOpenIcon, FileIcon} from "tdesign-icons-vue-next";
import type {NoteNode} from "../func/noteFs.ts";

interface Props {
  nodes: NoteNode[];
  level?: number;
  selectedPath?: string;
}

const {level = 0, selectedPath = ''} = defineProps<Props>();

const emit = defineEmits(['select', 'contextmenu']);

const toggleExpand = (node: NoteNode) => {
  if (node.type === 'folder') {
    node.expanded = !node.expanded;
  }
};

const handleClick = (node: NoteNode) => {
  if (node.type === 'folder') {
    toggleExpand(node);
  } else {
    emit('select', node.path);
  }
};

const handleContextMenu = (node: NoteNode, e: PointerEvent) => {
  emit('contextmenu', node, e);
};
</script>

<style scoped lang="less">
.note-tree-container {
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

    .article-icon-color {
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
  }
}
</style>
