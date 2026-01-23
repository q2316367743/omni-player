<template>
  <div class="control-panel">
    <t-button theme="primary" @click="enterScene">
      <template #icon>
        <login-icon/>
      </template>
      进入场景
    </t-button>
    <t-button theme="primary" variant="outline" @click="roleAdd">
      <template #icon>
        <user-add-icon/>
      </template>
      角色入场
    </t-button>
    <t-button theme="warning" variant="outline" @click="triggerEvent">
      <template #icon>
        <error-circle-icon/>
      </template>
      突发事件
    </t-button>
    <t-button theme="default" @click="advanceStory">
      <template #icon>
        <chevron-right-icon/>
      </template>
      推进剧情
    </t-button>
    <t-dropdown placement="top" trigger="click" max-column-width="350px">
      <t-button theme="default" variant="dashed">
        <template #icon>
          <add-icon/>
        </template>
        发送指令
      </t-button>
      <t-dropdown-menu>
        <t-dropdown-item @click="openSpDirector('character_slip')">
          强制角色说出指定台词
        </t-dropdown-item>
        <t-dropdown-item @click="openSpDirector('reveal_item')">
          插入物品发现事件
        </t-dropdown-item>
        <t-dropdown-item @click="openSpDirector('external_event')">
          插入环境事件
        </t-dropdown-item>
        <t-dropdown-item @click="openSpDirector('skip_turn')">
          跳过某角色本轮发言
        </t-dropdown-item>
        <t-dropdown-item @click="openSpDirector('trigger_emotion')">
          强制修改情绪
        </t-dropdown-item>
      </t-dropdown-menu>
    </t-dropdown>
  </div>
</template>
<script lang="ts" setup>
import {
  AddIcon,
  ChevronRightIcon,
  ErrorCircleIcon,
  LoginIcon,
  UserAddIcon
} from "tdesign-icons-vue-next";
import type {SpDilInstruction} from "@/entity/screenplay";
import {openSpDirectorInstructionLog} from "@/pages/mp/screenplay/chapter/func/SpDilEdit.tsx";
import type {ScreenEngine} from "@/pages/mp/screenplay/chapter/ScreenEngine.ts";

const props = defineProps({
  engine: {
    type: Object as PropType<ScreenEngine>,
    required: true
  },
});

// 进入场景
const enterScene = () => {
  props.engine.enterScene()
}

// 角色入场
const roleAdd = () => {
}

// 触发事件
const triggerEvent = () => {
  console.log('Trigger event')
}

// 推进剧情
const advanceStory = () => {
}

const openSpDirector = (instruction: SpDilInstruction) => {
  openSpDirectorInstructionLog(props.engine.config.screenplay.id, props.engine.config.getCurrentScene()!.id, instruction)
}

</script>
<style scoped lang="less">
.control-panel {
  padding: 7px 16px 8px;
  background: var(--fluent-acrylic-bg);
  backdrop-filter: var(--fluent-acrylic-blur);
  border-top: 1px solid var(--td-border-level-1-color);
  display: flex;
  gap: 8px;
}
</style>
