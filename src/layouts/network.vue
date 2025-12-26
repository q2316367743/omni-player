<template>
  <MainLayout>
    <template #header>
      <t-head-menu v-model="value">
        <t-menu-item :value="home">首页</t-menu-item>
        <t-menu-item :value="search">搜索</t-menu-item>
      </t-head-menu>
    </template>
    <template #content>
      <router-view v-slot="{ Component, route }">
        <keep-alive :include="['NetworkHome', 'NetworkSearch']">
          <component :is="Component" :key="route.fullPath"/>
        </keep-alive>
      </router-view>
    </template>
  </MainLayout>
</template>
<script lang="ts" setup>
const route = useRoute();
const router = useRouter();

const value = ref(`/network/${route.params.id}/home`)

const home = computed(() => `/network/${route.params.id}/home`);
const search = computed(() => `/network/${route.params.id}/search`);

watch(value, val => {
  router.push(val);
});
watch(() => route.path, val => {
  if (val !== value.value) {
    value.value = val;
  }
})

</script>
<style scoped lang="less">
</style>
