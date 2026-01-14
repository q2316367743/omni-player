<template>
  <div 
    class="todo-group-card"
    :class="{ 'expanded': expanded, 'all-completed': isAllCompleted }"
    @click="handleClick"
    @contextmenu="handleContextMenu"
  >
    <div class="group-header">
      <div class="group-title">
        <folder-icon class="group-icon"/>
        <span class="group-name">{{ group.name }}</span>
        <span class="group-count">{{ items.length }}</span>
      </div>
      <div class="group-actions">
        <chevron-down-icon v-if="!expanded" class="action-icon"/>
        <chevron-up-icon v-else class="action-icon"/>
      </div>
    </div>
    
    <div class="group-content">
      <div 
        v-for="item in displayItems" 
        :key="item.id" 
        class="todo-item-preview"
        @click.stop="handleItemClick(item)"
      >
        <div class="item-left">
          <div class="item-status-checks">
            <div 
              class="status-check check-done"
              :class="{ 'checked': item.status === 1 }"
              @click.stop="handleStatusChange(item, 1)"
            >
              <check-icon/>
            </div>
            <div 
              class="status-check check-cancel"
              :class="{ 'checked': item.status === 2 }"
              @click.stop="handleStatusChange(item, 2)"
            >
              <close-icon/>
            </div>
          </div>
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
        </div>
      </div>
      
      <div v-if="items.length > 5 && !expanded" class="show-more">
        <span>还有 {{ items.length - 5 }} 项</span>
      </div>
      
      <div v-if="expanded" class="add-item-btn" @click.stop="handleAddItem">
        <add-icon class="add-icon"/>
        <span>新增待办项</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {FolderIcon, ChevronDownIcon, ChevronUpIcon, CheckIcon, CloseIcon, AddIcon} from "tdesign-icons-vue-next";
import {Tag} from "tdesign-vue-next";
import type {TodoGroup} from "@/entity/todo/TodoGroup.ts";
import type {TodoItem} from "@/entity/todo/TodoItem.ts";

interface Props {
  group: TodoGroup;
  items: TodoItem[];
}

const props = defineProps<Props>();

const emit = defineEmits(['click', 'itemClick', 'contextmenu', 'addItem', 'statusChange']);

const expanded = ref(false);

const displayItems = computed(() => {
  if (expanded.value) {
    return props.items;
  }
  return props.items.slice(0, 5);
});

const isAllCompleted = computed(() => {
  if (props.items.length === 0) return false;
  return props.items.every(item => item.status === 1);
});

const handleClick = () => {
  expanded.value = !expanded.value;
  emit('click', props.group);
};

const handleItemClick = (item: TodoItem) => {
  emit('itemClick', item);
};

const handleContextMenu = (e: PointerEvent) => {
  emit('contextmenu', props.group, e);
};

const handleAddItem = () => {
  emit('addItem', props.group);
};

const handleStatusChange = (item: TodoItem, status: number) => {
  emit('statusChange', item, status);
};
</script>

<style scoped lang="less">
.todo-group-card {
  background: var(--td-bg-color-container);
  border: 1px solid var(--td-component-border);
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 12px;
  min-width: 0;

  &:hover {
    border-color: var(--td-brand-color-light);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }

  &.expanded {
    border-color: var(--td-brand-color);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }

  &.all-completed {
    opacity: 0.5;
    background: var(--td-bg-color-page);
    border-color: var(--td-component-border);

    .group-title {
      .group-name {
        color: var(--td-text-color-secondary);
        text-decoration: line-through;
      }
    }

    .group-content {
      .todo-item-preview {
        .item-left {
          .item-title {
            color: var(--td-text-color-secondary);
            text-decoration: line-through;
          }
        }
      }
    }
  }

  .group-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--td-component-border);

    .group-title {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
      min-width: 0;

      .group-icon {
        font-size: 20px;
        color: #f5a623;
        flex-shrink: 0;
      }

      .group-name {
        font-size: 16px;
        font-weight: 600;
        color: var(--td-text-color-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .group-count {
        font-size: 12px;
        color: var(--td-text-color-secondary);
        background: var(--td-bg-color-page);
        padding: 2px 8px;
        border-radius: 10px;
        flex-shrink: 0;
      }
    }

    .group-actions {
      .action-icon {
        font-size: 16px;
        color: var(--td-text-color-secondary);
        transition: transform 0.3s ease;
      }
    }
  }

  .group-content {
    .todo-item-preview {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      border-radius: 8px;
      transition: all 0.2s ease;
      margin-bottom: 6px;

      &:hover {
        background: var(--td-bg-color-container-hover);
      }

      .item-left {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 1;
        min-width: 0;

        .item-status-checks {
          display: flex;
          gap: 4px;
          flex-shrink: 0;

          .status-check {
            width: 20px;
            height: 20px;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 14px;

            &.check-done {
              border: 2px solid var(--td-success-color);
              color: var(--td-success-color);
              background: transparent;

              &:hover {
                background: var(--td-success-color-1);
              }

              &.checked {
                background: var(--td-success-color);
                color: white;
              }
            }

            &.check-cancel {
              border: 2px solid var(--td-error-color);
              color: var(--td-error-color);
              background: transparent;

              &:hover {
                background: var(--td-error-color-1);
              }

              &.checked {
                background: var(--td-error-color);
                color: white;
              }
            }
          }
        }

        .item-title {
          font-size: 14px;
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

    .show-more {
      text-align: center;
      padding: 8px;
      color: var(--td-text-color-secondary);
      font-size: 13px;
      background: var(--td-bg-color-page);
      border-radius: 6px;
      margin-top: 8px;
    }

    .add-item-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 10px;
      margin-top: 12px;
      background: var(--td-brand-color-1);
      border: 1px dashed var(--td-brand-color);
      border-radius: 8px;
      color: var(--td-brand-color);
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: var(--td-brand-color-2);
        border-color: var(--td-brand-color-3);
      }

      .add-icon {
        font-size: 16px;
      }
    }
  }

  @media (max-width: 768px) {
    padding: 12px;
    margin-bottom: 10px;

    .group-header {
      margin-bottom: 10px;
      padding-bottom: 10px;

      .group-title {
        .group-icon {
          font-size: 18px;
        }

        .group-name {
          font-size: 15px;
        }

        .group-count {
          font-size: 11px;
          padding: 1px 6px;
        }
      }

      .group-actions {
        .action-icon {
          font-size: 14px;
        }
      }
    }

    .group-content {
      .todo-item-preview {
        padding: 6px 10px;
        margin-bottom: 5px;

        .item-left {
          .item-status-checks {
            gap: 3px;

            .status-check {
              width: 18px;
              height: 18px;
              font-size: 12px;
            }
          }

          .item-title {
            font-size: 13px;
          }
        }

        .item-right {
          :deep(.t-tag) {
            font-size: 12px;
          }
        }
      }

      .show-more {
        padding: 6px;
        font-size: 12px;
      }

      .add-item-btn {
        padding: 8px;
        margin-top: 10px;
        font-size: 13px;
        gap: 5px;

        .add-icon {
          font-size: 14px;
        }
      }
    }
  }

  @media (max-width: 480px) {
    padding: 10px;
    margin-bottom: 8px;

    .group-header {
      margin-bottom: 8px;
      padding-bottom: 8px;

      .group-title {
        gap: 6px;

        .group-icon {
          font-size: 16px;
        }

        .group-name {
          font-size: 14px;
        }
      }
    }

    .group-content {
      .todo-item-preview {
        padding: 5px 8px;
        margin-bottom: 4px;

        .item-left {
          gap: 6px;

          .item-status-checks {
            gap: 2px;

            .status-check {
              width: 16px;
              height: 16px;
              font-size: 11px;
            }
          }

          .item-title {
            font-size: 12px;
          }
        }
      }

      .add-item-btn {
        padding: 6px;
        margin-top: 8px;
        font-size: 12px;
      }
    }
  }
}
</style>
