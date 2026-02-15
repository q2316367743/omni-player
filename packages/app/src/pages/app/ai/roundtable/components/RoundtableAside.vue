<template>
  <div class="roundtable-aside">
    <div class="header">
      <div class="flex gap-8px items-center">
        <div class="title">圆桌派</div>
        <div class="ml-auto">
          <t-button theme="primary" variant="text" shape="square" @click="toggleCollapsed()">
            <template #icon>
              <menu-unfold-icon/>
            </template>
          </t-button>
        </div>
      </div>
    </div>
    <div class="content">
      <div class="item" :class="{active: modelValue === '/role'}"
           @click="toggleRole">
        <div class="text ellipsis">角色管理</div>
      </div>
      <div class="item" :class="{active: modelValue.startsWith('/group')}"
           @click="toggleGroup">
        <div class="text ellipsis">讨论组</div>
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
           :class="{active: modelValue.startsWith(`/meeting/0/${meeting.id}`)}"
           @click="onClickMeeting(meeting)" @contextmenu="onMeetingMenuClick(meeting, $event, fetchMeeting)">
        <div class="text ellipsis">{{ meeting.topic }}</div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {MenuUnfoldIcon, PlusIcon} from "tdesign-icons-vue-next";
import type {AiRtMeeting} from "@/entity/app/ai/roundtable";
import {listAiRtMeetingService} from "@/services/app/roundtable";
import {onMeetingMenuClick} from "@/pages/app/ai/roundtable/func/RoundtableMeetingEdit.tsx";

const modelValue = defineModel({
  type: String,
  default: ''
});
const emit = defineEmits(['toggleCollapsed']);

const meetings = ref<Array<AiRtMeeting>>([]);

const fetchMeeting = async () => {
  meetings.value = await listAiRtMeetingService("");
}

tryOnMounted(() => {
  fetchMeeting();
})

const toggleRole = () => {
  if (modelValue.value === '/role') {
    modelValue.value = ''
  } else {
    modelValue.value = '/role'
  }
}
const toggleGroup = () => {
  if (modelValue.value === '/group') {
    modelValue.value = ''
  } else {
    modelValue.value = '/group'
  }
}
const toggleCollapsed = () => {
  emit('toggleCollapsed');
}

const onAddMeeting = () => {
  // 创建临时圆桌会议
  modelValue.value = '';
  modelValue.value = `/create/`;
}

const onClickMeeting = (meeting: AiRtMeeting) => {
  modelValue.value = '';
  nextTick(() => {
    modelValue.value = `/meeting/0/${meeting.id}`;
  })
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
