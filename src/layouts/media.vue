<template>
  <MainLayout>
    <template #header>
      <t-button v-for="menu in menus" :key="menu.path" :theme="menu.value" size="small" @click="jumpTo(menu)">
        {{ menu.label }}
      </t-button>
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
  path: string;
  value: 'primary' | 'default'
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
    path: home.value,
    value: home.value === value.value ? 'primary' : 'default'
  },
  {
    label: '电影',
    path: movie.value,
    value: movie.value === value.value ? 'primary' : 'default'
  },
  {
    label: '剧集',
    path: series.value,
    value: series.value === value.value ? 'primary' : 'default'
  },
  {
    label: '已收藏',
    path: collection.value,
    value: collection.value === value.value ? 'primary' : 'default'
  }
]))

watch(() => route.path, val => {
  if (val !== value.value) {
    value.value = val;
  }
})
const jumpTo = (item: MenuItem) => {
  router.push(item.path);
}
</script>
<style scoped lang="less">
</style>
