<template>
  <div class="subscribe-grid-container">
    <div
      v-for="node in nodes"
      :key="node.id"
      class="grid-item"
      @click="handleClick(node)"
      @contextmenu.stop="handleContextMenu(node, $event)"
    >
      <template v-if="node.type === 'folder'">
        <t-popup
          trigger="click"
          :placement="'right'"
          :showArrow="true"
        >
          <div class="folder-trigger">
            <div class="folder-icon-wrapper">
              <folder-open-icon class="folder-icon"/>
            </div>
            <div class="item-name">{{ node.name }}</div>
            <div class="item-count">{{ node.count }}</div>
          </div>
          <template #content>
            <div class="folder-popup">
              <div class="popup-header">
                <span class="folder-title">{{ node.name }}</span>
                <span class="folder-total">共 {{ node.count }} 个订阅源</span>
              </div>
              <div class="three-column-list">
                <div
                  v-for="child in getFlattenChildren(node)"
                  :key="child.id"
                  class="list-item"
                  @click.stop="handleItemClick(child)"
                  @contextmenu.stop="handleContextMenu(child, $event)"
                >
                  <rss-icon class="item-icon"/>
                  <span class="item-label">{{ child.name }}</span>
                  <span v-if="child.unRead" class="item-unread">新</span>
                </div>
              </div>
            </div>
          </template>
        </t-popup>
      </template>
      <template v-else-if="node.type === 'item' && node.data">
        <div class="subscribe-trigger">
          <div class="subscribe-icon-wrapper">
            <rss-icon class="subscribe-icon"/>
            <span v-if="node.unRead" class="unread-badge">新</span>
          </div>
          <div class="item-name">{{ node.data.name }}</div>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {FolderOpenIcon, RssIcon} from "tdesign-icons-vue-next";
import type {TreeNode} from "@/store/SubscribeStore.ts";

interface Props {
  nodes: TreeNode[];
}

const {nodes} = defineProps<Props>();

const emit = defineEmits(['jump', 'contextmenu']);

const hoveredFolder = ref('');

const getFlattenChildren = (node: TreeNode): TreeNode[] => {
  if (!node.children) return [];
  const result: TreeNode[] = [];
  const flatten = (children: TreeNode[]) => {
    children.forEach(child => {
      if (child.type === 'item') {
        result.push(child);
      } else if (child.type === 'folder' && child.children) {
        flatten(child.children);
      }
    });
  };
  flatten(node.children);
  return result;
};

const handleClick = (node: TreeNode) => {
  if (node.type === 'folder') {
    hoveredFolder.value = hoveredFolder.value === node.path ? '' : node.path;
  } else if (node.type === 'item' && node.data) {
    emit('jump', node.data.id);
  }
};

const handleItemClick = (node: TreeNode) => {
  if (node.type === 'item' && node.data) {
    emit('jump', node.data.id);
    hoveredFolder.value = '';
  }
};

const handleContextMenu = (node: TreeNode, e: PointerEvent) => {
  if (node.type === 'item' && node.data) {
    emit('contextmenu', {data: node.data, e: e});
  }
};
</script>

<style scoped lang="less">
.subscribe-grid-container {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  width: calc(100% - 16px);
  padding: 8px;

  .grid-item {
    width: 100px;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 12px 8px;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    background: var(--td-bg-color-container);
    border: 1px solid transparent;

    &:hover {
      background: var(--td-bg-color-container-hover);
      border-color: var(--td-brand-color-light);
    }
  }

  .folder-trigger, .subscribe-trigger {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }

  .folder-icon-wrapper, .subscribe-icon-wrapper {
    position: relative;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    margin-bottom: 8px;
  }

  .folder-icon-wrapper {
    background: linear-gradient(135deg, #f5a623 0%, #f78b00 100%);

    .folder-icon {
      color: white;
      font-size: 24px;
    }
  }

  .subscribe-icon-wrapper {
    background: linear-gradient(135deg, #f18751 0%, #e06c35 100%);

    .subscribe-icon {
      color: white;
      font-size: 20px;
    }
  }

  .unread-badge {
    position: absolute;
    top: -4px;
    right: -4px;
    background: #ff6b6b;
    color: white;
    font-size: 10px;
    padding: 1px 4px;
    border-radius: 6px;
    border: 1px solid white;
  }

  .item-name {
    font-size: 12px;
    color: var(--td-text-color-primary);
    text-align: center;
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: 1.3;
  }

  .item-count {
    font-size: 11px;
    color: var(--td-text-color-secondary);
    margin-top: 4px;
  }
}

.folder-popup {
  width: 350px;
  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--td-border-level-1-color);
    margin-bottom: 12px;

    .folder-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--td-text-color-primary);
    }

    .folder-total {
      font-size: 12px;
      color: var(--td-text-color-secondary);
    }
  }

  .three-column-list {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    max-height: 300px;
    overflow-y: auto;

    .list-item {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: var(--td-bg-color-container-hover);
      }

      .item-icon {
        font-size: 14px;
        color: #f18751;
        flex-shrink: 0;
      }

      .item-label {
        font-size: 12px;
        color: var(--td-text-color-primary);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .item-unread {
        color: #ff6b6b;
        border: 1px solid #ff6b6b;
        border-radius: 4px;
        padding: 0 3px;
        font-size: 10px;
        flex-shrink: 0;
      }
    }
  }
}
</style>
