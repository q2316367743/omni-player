<template>
  <div class="abs-0 onmi-player">
    <router-view/>
  </div>
</template>
<script lang="ts" setup>
</script>
<style lang="less">
#app {
  background-color: var(--td-bg-color-container);
  color: var(--td-text-color-primary);
}

.onmi-player {
  border-radius: var(--td-radius-medium);
  overflow: hidden;
}
</style>
