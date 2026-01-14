<template>
  <tauri-webview v-if="tauri" :url/>
  <utools-webview v-else :url/>
</template>
<script lang="ts" setup>
import {isTauri} from "@tauri-apps/api/core";

defineProps({
  url: {
    type: String,
    required: true
  }
});

const tauri = isTauri();
</script>
<style scoped lang="less">

</style>
