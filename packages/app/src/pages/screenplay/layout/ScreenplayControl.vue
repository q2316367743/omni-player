<template>
  <div class="control-panel">
    <t-button theme="primary" @click="enterScene">
      <template #icon>
        <login-icon/>
      </template>
      进入场景
    </t-button>
    <t-button v-if="showRoleAdd" theme="primary" variant="outline" @click="roleAdd">
      <template #icon>
        <user-add-icon/>
      </template>
      角色入场
    </t-button>
    <t-button v-if="showRoleAdd" theme="warning" variant="outline" @click="triggerEvent">
      <template #icon>
        <error-circle-icon/>
      </template>
      突发事件
    </t-button>
    <t-button v-if="showRoleAdd" theme="default" @click="advanceStory">
      <template #icon>
        <chevron-right-icon/>
      </template>
      推进剧情
    </t-button>
    <t-button theme="default" variant="dashed" @click="addScene">
      <template #icon>
        <add-icon/>
      </template>
      新场景
    </t-button>
    <div class="ml-auto">
      <t-button v-if="pause" theme="default" variant="outline" @click="pauseStory">
        <template #icon>
          <play-circle-icon />
        </template>
        继续
      </t-button>
      <t-button v-else theme="default" variant="outline" @click="pauseStory">
        <template #icon>
          <pause-circle-icon/>
        </template>
        暂停
      </t-button>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {
  AddIcon,
  ChevronRightIcon,
  ErrorCircleIcon,
  LoginIcon,
  PauseCircleIcon, PlayCircleIcon,
  UserAddIcon
} from "tdesign-icons-vue-next";
import type {Screenplay, SpScene} from "@/entity/screenplay";
import {openSpSceneAdd} from "@/pages/screenplay/func/SpSceneEdit.tsx";
import {openSpRoleAppearanceAdd} from "@/pages/screenplay/func/SpRoleAppearanceEdit.tsx";
import {openSpDialogualAddNarrator} from "@/pages/screenplay/func/SpDialogualEdit.tsx";

const props = defineProps({
  screenplay: {
    type: Object as PropType<Screenplay>,
    required: true
  },
  scenes: {
    type: Array as PropType<Array<SpScene>>,
    required: true
  },
  currentSceneId: {
    type: String,
  },
  pause: {
    type: Boolean,
    default: false
  }
});
const emit = defineEmits(['refreshScene', 'refreshRoleAppearance', 'refreshDialogue']);

const showRoleAdd = computed(() => {
  return props.currentSceneId &&
    props.scenes.length > 0 &&
    props.currentSceneId ===
    props.scenes[props.scenes.length - 1]?.id
})

const enterScene = () => {
  openSpSceneAdd(props.screenplay.id, () => {
    emit('refreshScene');
  })
}

const roleAdd = () => {
  openSpRoleAppearanceAdd(props.screenplay.id, props.currentSceneId!, 0, () => {
    emit('refreshRoleAppearance')
  })
}

const triggerEvent = () => {
  console.log('Trigger event')
}

const advanceStory = () => {
  openSpDialogualAddNarrator(
    props.screenplay.id,
    props.currentSceneId!,
    () => {
      emit('refreshDialogue')
    }
  )
}

const pauseStory = () => {
  console.log('Pause story')
}

const addScene = () => {
  console.log('Add scene')
}

</script>
<style scoped lang="less">
.control-panel {
  padding: 20px 24px;
  background: var(--fluent-acrylic-bg);
  backdrop-filter: var(--fluent-acrylic-blur);
  border-top: 1px solid var(--fluent-border-subtle);
  display: flex;
  gap: 8px;
}
</style>
