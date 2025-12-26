<template>
  <MainLayout>
    <template #header>
      <t-head-menu v-model="value">
        <t-menu-item v-for="menu in menus" :key="menu.value" :value="menu.value">{{ menu.label }}</t-menu-item>
      </t-head-menu>
    </template>
    <template #content>
      <router-view v-slot="{ Component, route }">
        <keep-alive :include="['MediaHome', 'MediaMovie', 'MediaSeries', 'MediaCollection']">
          <component :is="Component" :key="route.fullPath"/>
        </keep-alive>
      </router-view>
    </template>
  </MainLayout>
</template>
<script lang="ts" setup>

interface MenuItem {
  label: string;
  value: string;
}

const route = useRoute();
const router = useRouter();

const value = ref(`/media/${route.params.id}/home`)

const home = computed(() => `/media/${route.params.id}/home`);
const movie = computed(() => `/media/${route.params.id}/movie`);
const series = computed(() => `/media/${route.params.id}/series`);
const collection = computed(() => `/media/${route.params.id}/collection`);

const menus = computed<Array<MenuItem>>(() => ([
  {
    label: '全部',
    value: home.value
  },
  {
    label: '电影',
    value: movie.value
  },
  {
    label: '剧集',
    value: series.value
  },
  {
    label: '已收藏',
    value: collection.value
  }
]))

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
