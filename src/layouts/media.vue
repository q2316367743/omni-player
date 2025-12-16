<template>
  <t-layout class="w-full h-full">
    <t-header>
      <t-head-menu>
        <t-menu-item :value="home">全部视频</t-menu-item>
        <t-menu-item :value="category">分类查询</t-menu-item>
        <t-menu-item :value="person">演员列表</t-menu-item>
      </t-head-menu>
    </t-header>
    <t-content class="h-full relative">
      <router-view />
    </t-content>
  </t-layout>
</template>
<script lang="ts" setup>
const route = useRoute();

const home = computed(() => `/media/${route.params.id}/home`);
const category = computed(() => `/media/${route.params.id}/category`);
const person = computed(() => `/media/${route.params.id}/person`);
</script>
<style scoped lang="less">
</style>
