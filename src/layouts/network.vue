<template>
  <t-layout class="w-full h-full">
    <t-header>
      <t-head-menu v-model="value">
        <template #logo>
          <t-button theme="primary" shape="circle" @click="goHome">
            <template #icon>
              <home-icon />
            </template>
          </t-button>
        </template>
        <t-menu-item :value="home">首页</t-menu-item>
        <t-menu-item :value="video">分类</t-menu-item>
        <t-menu-item :value="search">搜索</t-menu-item>
      </t-head-menu>
    </t-header>
    <t-content class="h-full relative overflow-auto">
      <router-view v-slot="{ Component, route }">
        <keep-alive :include="['NetworkHome']">
          <component :is="Component" :key="route.fullPath"/>
        </keep-alive>
      </router-view>
    </t-content>
  </t-layout>
</template>
<script lang="ts" setup>
import {HomeIcon} from "tdesign-icons-vue-next";

const route = useRoute();
const router = useRouter();

const value = ref(`/network/${route.params.id}/home`)

const home = computed(() => `/network/${route.params.id}/home`);
const video = computed(() => `/network/${route.params.id}/video`);
const search = computed(() => `/network/${route.params.id}/search`);

watch(value, val => {
  router.push(val);
});
watch(() => route.path, val => {
  if (val !== value.value) {
    value.value = val;
  }
})

const goHome = () => {
  router.replace("/home")
}

</script>
<style scoped lang="less">
</style>
