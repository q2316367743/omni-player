<template>
  <div class="roundtable-aside">
    <div class="header">
      <div class="flex gap-8px items-center">
        <app-tool-back/>
        <div class="title">圆桌派</div>
      </div>
    </div>
    <div class="content">
      <div class="item" :class="{active: modelValue === '/role'}"
           @click="toggleRole">
        <div class="text ellipsis">角色管理</div>
      </div>
      <div class="group">
        <div>讨论组</div>
        <t-tooltip content="创建讨论组">
          <t-button theme="primary" variant="text" shape="square" size="small" @click="onAddGroup">
            <template #icon>
              <plus-icon/>
            </template>
          </t-button>
        </t-tooltip>
      </div>
      <t-empty v-if="groups.length === 0" description="暂无讨论组" size="small"/>
      <div class="item" v-for="group in groups" :key="group.id" :class="{active: modelValue === `/group/${group.id}`}"
           @click="modelValue = `/group/${group.id}`" @contextmenu="onGroupMenuClick(group, $event)">
        <div class="text ellipsis">{{ group.name }}</div>
      </div>
      <div class="group">
        <div>圆桌会议</div>
        <t-tooltip content="发起圆桌会议">
          <t-button theme="primary" variant="text" shape="square" size="small" @click="onAddMeeting">
            <template #icon>
              <plus-icon/>
            </template>
          </t-button>
        </t-tooltip>
      </div>
      <t-empty v-if="meetings.length === 0" description="暂无临时会议" size="small"/>
      <div class="item" v-for="meeting in meetings" :key="meeting.id"
           :class="{active: modelValue === `/meeting/0/${meeting.id}`}"
           @click="modelValue = `/meeting/0/${meeting.id}`" @contextmenu="onMeetingMenuClick(meeting, $event)">
        <div class="text ellipsis">{{ meeting.topic }}</div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {PlusIcon} from "tdesign-icons-vue-next";
import ContextMenu from '@imengyu/vue3-context-menu';
import {isDark} from "@/global/Constants.ts";
import type {AiRtGroup, AiRtMeeting} from "@/entity/app/ai/roundtable";
import {listAiRtGroupService, listAiRtMeetingService} from "@/services/app/roundtable";

const modelValue = defineModel({
  type: String
});

const groups = ref<Array<AiRtGroup>>([]);
const meetings = ref<Array<AiRtMeeting>>([]);

tryOnMounted(async () => {
  groups.value = await listAiRtGroupService();
  meetings.value = await listAiRtMeetingService("");
})

const toggleRole = () => {
  if (modelValue.value === '/role') {
    modelValue.value = ''
  } else {
    modelValue.value = '/role'
  }
}

const onAddGroup = () => {
  console.log('添加讨论组');
}

const onAddMeeting = () => {
  // 创建临时圆桌会议
  modelValue.value = '';
  modelValue.value = `/create/`;
}

const onGroupMenuClick = (group: AiRtGroup, e: MouseEvent) => {
  e.preventDefault();
  ContextMenu.showContextMenu({
    x: e.x,
    y: e.y,
    theme: isDark.value ? 'mac dark' : 'mac',
    items: [{
      label: '编辑',
      onClick: () => {
        console.log('编辑讨论组', group);
      },
    }, {
      label: () => h('span', {
        style: {
          color: 'var(--td-error-color)'
        },
        class: 'label'
      }, '删除'),
      onClick: () => {
        console.log('删除讨论组', group.id);
      }
    }]
  });
}

const onMeetingMenuClick = (meeting: AiRtMeeting, e: MouseEvent) => {
  e.preventDefault();
  ContextMenu.showContextMenu({
    x: e.x,
    y: e.y,
    theme: isDark.value ? 'mac dark' : 'mac',
    items: [{
      label: '编辑',
      onClick: () => {
        console.log('编辑会议', meeting);
      },
    }, {
      label: () => h('span', {
        style: {
          color: 'var(--td-error-color)'
        },
        class: 'label'
      }, '删除'),
      onClick: () => {
        console.log('删除会议', meeting.id);
      }
    }]
  });
}

defineExpose({
  refreshMeeting: async () => {
    meetings.value = await listAiRtMeetingService("");
  }
})
</script>
<style scoped lang="less">
.roundtable-aside {
  width: 231px;
  height: 100vh;
  overflow: hidden;
  background: var(--td-bg-color-container);
  backdrop-filter: var(--fluent-acrylic-blur);
  border-right: 1px solid var(--fluent-sidebar-border);
  transition: var(--fluent-transition-normal);
  border-right: 1px solid var(--td-border-level-1-color);

  .header {
    padding: 8px;
    width: 232px;
    box-sizing: border-box;

    .title {
      font-weight: 600;
      font-size: var(--td-font-size-title-large);
      color: var(--td-text-color-primary);
    }
  }

  .content {
    width: 232px;
    height: calc(100% - 48px);
    padding: 0 8px 16px 8px;
    overflow: auto;
    box-sizing: border-box;
  }

  :deep(.group) {
    user-select: none;
    color: var(--td-text-color-secondary);
    font-size: var(--td-font-size-body-medium);
    font-weight: 600;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 16px 0 8px 0;
    padding: 0 8px;

    &:first-child {
      margin-top: 0;
    }
  }

  :deep(.item) {
    user-select: none;
    color: var(--td-text-color-secondary);
    display: flex;
    justify-content: flex-start;
    align-items: center;
    margin-bottom: 4px;
    padding: 8px 12px;
    transition: var(--fluent-transition-fast);
    border-radius: var(--fluent-radius-smooth);
    cursor: pointer;
    position: relative;

    &:hover {
      background-color: var(--fluent-item-hover);
      color: var(--td-text-color-primary);
    }

    &:active {
      background-color: var(--fluent-item-active);
    }

    &.active {
      background-color: var(--fluent-item-selected);
      color: var(--td-text-color-primary);
      font-weight: 500;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 3px;
        background-color: var(--fluent-item-selected-border);
        border-radius: 0 3px 3px 0;
      }
    }

    .text {
      flex: 1 1 auto;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  :deep(.t-empty) {
    padding: 24px 0;
    color: var(--td-text-color-placeholder);
  }

  :deep(.t-button) {
    opacity: 0.7;
    transition: var(--fluent-transition-fast);

    &:hover {
      opacity: 1;
    }
  }

  /* 滚动条样式 */

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: var(--td-scrollbar-color);
    border-radius: 3px;
    transition: var(--fluent-transition-fast);

    &:hover {
      background-color: var(--td-scrollbar-hover-color);
    }
  }
}
</style>
