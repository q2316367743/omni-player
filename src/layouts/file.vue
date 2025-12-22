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

const value = ref(`/file/${route.params.id}/home`)

const home = computed(() => `/file/${route.params.id}/home`);

const menus = computed<Array<MenuItem>>(() => ([
  {
    label: '全部',
    path: home.value,
    value: home.value === value.value ? 'primary' : 'default'
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
