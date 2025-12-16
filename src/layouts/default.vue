<template>
  <t-layout class="h-full w-full">
    <t-header>
      <router-link to="/">
        <t-button>管理</t-button>
      </router-link>
    </t-header>
    <t-content>
      <router-view/>
    </t-content>
  </t-layout>
</template>
<script lang="ts" setup>
</script>
<style scoped lang="less">

</style>
