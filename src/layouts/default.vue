<template>
  <t-layout class="h-full w-full">
    <t-header>
      <router-link to="/admin/global-setting">
        <t-button>全局设置</t-button>
      </router-link>
    </t-header>
    <t-content>
      <router-view/>
    </t-content>
  </t-layout>
</template>
<script lang="ts" setup>
</script>
