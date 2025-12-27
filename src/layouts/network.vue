<template>
  <MainLayout>
    <template #header>
      <t-head-menu :value="value">
        <t-menu-item v-for="option in options" :key="option.value" :value="option.value" @click="to(option.value)">{{
            option.label
          }}
        </t-menu-item>
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

const value = computed(() => route.path)

const options = [{
  label: '全部',
  value: `/network/${route.params.id}/home`
},
  {
    label: '搜索',
    value: `/network/${route.params.id}/search`
  }]

const to = (path: string) => router.push(path);

</script>
<style scoped lang="less">
</style>
