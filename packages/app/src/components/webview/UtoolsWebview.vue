<template>
  <webview :url="url" class="w-full h-full"/>
</template>
<script lang="ts" setup>
defineProps({
  url: {
    type: String,
    required: true
  }
});

</script>
<style scoped lang="less">

</style>
