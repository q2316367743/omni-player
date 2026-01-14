<template>
  <MainLayout>
    <template #header>
      <t-head-menu :value="value">
        <t-menu-item v-for="menu in menus" :key="menu.value" :value="menu.value" @click="to(menu.value)">{{
            menu.label
          }}
        </t-menu-item>
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

const value = computed(() => route.path)

const menus = computed<Array<MenuItem>>(() => ([
  {
    label: '全部',
    value: `/media/${route.params.id}/home`
  },
  {
    label: '电影',
    value: `/media/${route.params.id}/movie`
  },
  {
    label: '剧集',
    value: `/media/${route.params.id}/series`
  },
  {
    label: '已收藏',
    value: `/media/${route.params.id}/collection`
  }
]))

const to = (path: string) => router.push(path);

onUnmounted(() => {
  console.log("销毁组件")
})
</script>
<style scoped lang="less">
</style>
