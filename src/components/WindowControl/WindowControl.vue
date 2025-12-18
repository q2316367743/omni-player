<template>
  <div class="flex">
    <t-button theme="primary" variant="text" shape="square" @click="minimize()">
      <template #icon>
        <minus-icon/>
      </template>
    </t-button>
    <t-button theme="primary" variant="text" shape="square" @click="toggleMaximize()">
      <template #icon>
        <fullscreen-exit-icon v-if="isMax"/>
        <fullscreen-icon v-else/>
      </template>
    </t-button>
    <t-button theme="primary" variant="text" shape="square" @click="hide()">
      <template #icon>
        <close-icon/>
      </template>
    </t-button>
  </div>
</template>
<script lang="ts" setup>
import {CloseIcon, FullscreenExitIcon, FullscreenIcon, MinusIcon} from "tdesign-icons-vue-next";
import {getCurrentWindow} from "@tauri-apps/api/window";
import {debounce} from "es-toolkit";

const win = getCurrentWindow();

const isMax = ref(false);

const func = debounce(() => {
  win.isMaximized().then((res) => {
    isMax.value = res;
  })
}, 1000)

win.listen("tauri://resize", func);

const minimize = () => {
  win.minimize();
}

const toggleMaximize = () => {
  win.toggleMaximize();
}
const hide = () => {
  win.hide();
}
</script>
<style scoped lang="less">

</style>
