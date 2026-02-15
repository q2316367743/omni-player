<template>
  <t-button theme="default" variant="text" size="small" shape="square" @click="togglePin()">
    <template #icon>
      <pin-filled-icon v-if="pin"/>
      <pin-icon v-else/>
    </template>
  </t-button>
</template>
<script lang="ts" setup>
import {PinFilledIcon, PinIcon} from "tdesign-icons-vue-next";
import {getCurrentWindow} from "@tauri-apps/api/window";

const pin = ref(false);

const togglePin = async () => {
  const win = getCurrentWindow();
  await win.setAlwaysOnTop(!pin.value);
  pin.value = await win.isAlwaysOnTop();
}

</script>
<style scoped lang="less">

</style>
