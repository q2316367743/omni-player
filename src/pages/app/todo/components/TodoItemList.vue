<template>
  <div class="todo-item-list">
    <div 
      v-for="item in items" 
      :key="item.id" 
      class="todo-item"
      :class="{ 'completed': item.status === 2 }"
      @click="handleClick(item)"
      @contextmenu="handleContextMenu(item, $event)"
    >
      <div class="item-header">
        <div class="item-left">
          <check-circle-filled-icon 
            v-if="item.status === 2" 
            class="item-status-icon completed"
          />
          <time-filled-icon 
            v-else-if="item.status === 1" 
            class="item-status-icon in-progress"
          />
          <close-circle-filled-icon 
            v-else-if="item.status === 3" 
            class="item-status-icon cancelled"
          />
          <circle-icon v-else class="item-status-icon pending"/>
          <span class="item-title">{{ item.title }}</span>
        </div>
        <div class="item-right">
          <tag 
            v-if="item.priority === 1" 
            theme="danger" 
            size="small"
            variant="light"
          >高</tag>
          <tag 
            v-else-if="item.priority === 2" 
            theme="warning" 
            size="small"
            variant="light"
          >中</tag>
          <tag 
            v-else-if="item.priority === 3" 
            theme="success" 
            size="small"
            variant="light"
          >低</tag>
          <tag 
            v-else 
            theme="default" 
            size="small"
            variant="light"
          >无</tag>
        </div>
      </div>
      
      <div v-if="item.desc" class="item-desc">
        {{ item.desc }}
      </div>
      
      <div v-if="item.tags" class="item-tags">
        <tag 
          v-for="tag in parseTags(item.tags)" 
          :key="tag"
          size="small"
          variant="outline"
        >{{ tag }}</tag>
      </div>
      
      <div class="item-meta">
        <span class="meta-time">
          <time-icon class="meta-icon"/>
          {{ formatTime(item.updatedAt) }}
        </span>
      </div>
    </div>
    
    <div v-if="items.length === 0" class="empty-state">
      <div class="empty-icon">📝</div>
      <span class="empty-text">暂无待办项</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {CheckCircleFilledIcon, TimeFilledIcon, CloseCircleFilledIcon, CircleIcon, TimeIcon} from "tdesign-icons-vue-next";
import {Tag} from "tdesign-vue-next";
import type {TodoItem} from "@/entity/todo/TodoItem.ts";

interface Props {
  items: TodoItem[];
}

defineProps<Props>();

const emit = defineEmits(['click', 'contextmenu']);

const parseTags = (tags: string): string[] => {
  if (!tags) return [];
  return tags.split(',').map(t => t.trim()).filter(t => t);
};

const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) {
    return '今天';
  } else if (days === 1) {
    return '昨天';
  } else if (days < 7) {
    return `${days}天前`;
  } else {
    return date.toLocaleDateString();
  }
};

const handleClick = (item: TodoItem) => {
  emit('click', item);
};

const handleContextMenu = (item: TodoItem, e: PointerEvent) => {
  emit('contextmenu', item, e);
};
</script>

<style scoped lang="less">
.todo-item-list {
  .todo-item {
    background: var(--td-bg-color-container);
    border: 1px solid var(--td-component-border);
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 12px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      border-color: var(--td-brand-color-light);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    &.completed {
      opacity: 0.7;

      .item-title {
        text-decoration: line-through;
        color: var(--td-text-color-secondary);
      }
    }

    .item-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;

      .item-left {
        display: flex;
        align-items: center;
        gap: 10px;
        flex: 1;
        min-width: 0;

        .item-status-icon {
          font-size: 18px;
          flex-shrink: 0;

          &.completed {
            color: var(--td-success-color);
          }

          &.in-progress {
            color: var(--td-warning-color);
          }

          &.cancelled {
            color: var(--td-error-color);
          }

          &.pending {
            color: var(--td-text-color-placeholder);
          }
        }

        .item-title {
          font-size: 15px;
          font-weight: 500;
          color: var(--td-text-color-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }

      .item-right {
        flex-shrink: 0;
      }
    }

    .item-desc {
      font-size: 13px;
      color: var(--td-text-color-secondary);
      line-height: 1.6;
      margin-bottom: 10px;
      white-space: pre-wrap;
      word-break: break-word;
    }

    .item-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 10px;
    }

    .item-meta {
      display: flex;
      align-items: center;
      gap: 16px;
      padding-top: 10px;
      border-top: 1px solid var(--td-component-border);

      .meta-time {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        color: var(--td-text-color-placeholder);

        .meta-icon {
          font-size: 14px;
        }
      }
    }
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    color: var(--td-text-color-placeholder);

    .empty-icon {
      font-size: 64px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .empty-text {
      font-size: 14px;
    }
  }
}
</style>
