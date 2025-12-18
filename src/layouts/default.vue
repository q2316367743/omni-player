<template>
  <MainLayout>
    <template #header>
      <router-link to="/admin/global-setting">
        <t-button size="small">全局设置</t-button>
      </router-link>
    </template>
    <template #content>
      <router-view/>
    </template>
  </MainLayout>
</template>
<script lang="ts" setup>
</script>
<style scoped lang="less">
</style>
