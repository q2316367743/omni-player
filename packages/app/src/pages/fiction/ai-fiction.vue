<template>
  <router-view v-slot="{ Component, route }">
    <keep-alive :include="['FictionHome']">
      <component :is="Component" :key="route.fullPath"/>
    </keep-alive>
  </router-view>
</template>
<script lang="ts" setup>
</script>
<style scoped lang="less">

</style>
