<template>
  <MainLayout>
    <template #header>
      <t-head-menu v-model="value">
        <t-menu-item :value="home">全部视频</t-menu-item>
        <t-menu-item :value="category">已收藏</t-menu-item>
        <t-menu-item :value="person">演员列表</t-menu-item>
      </t-head-menu>
    </template>
    <template #content>
      <router-view v-slot="{ Component, route }">
        <keep-alive :include="['MediaHome']">
          <component :is="Component" :key="route.fullPath"/>
        </keep-alive>
      </router-view>
    </template>
  </MainLayout>
</template>
<script lang="ts" setup>

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

</script>
<style scoped lang="less">
</style>
