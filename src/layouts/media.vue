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
        <t-menu-item :value="home">全部视频</t-menu-item>
        <t-menu-item :value="category">分类查询</t-menu-item>
        <t-menu-item :value="person">演员列表</t-menu-item>
      </t-head-menu>
    </t-header>
    <t-content class="h-full relative overflow-auto">
      <router-view v-slot="{ Component, route }">
        <keep-alive :include="['MediaHome']">
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

const value = ref(`/media/${route.params.id}/home`)

const home = computed(() => `/media/${route.params.id}/home`);
const category = computed(() => `/media/${route.params.id}/category`);
const person = computed(() => `/media/${route.params.id}/person`);

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
