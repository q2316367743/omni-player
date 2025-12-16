<template>
  <div>
    <h1>钱不站点</h1>
    <t-list>
      <t-list-item v-for="server in servers" :key="server.id">
        <t-list-item-meta :title="server.name" :description="server.url"/>
      </t-list-item>
    </t-list>
    <t-button @click="openMediaServerEdit()">新增</t-button>
  </div>
</template>
<script lang="ts" setup>
import {useMediaServerStore} from "@/store";
import {openMediaServerEdit} from "@/pages/home/func/MediaServerEdit.tsx";

const servers = computed(() => useMediaServerStore().servers);
</script>
<style scoped lang="less">

</style>
