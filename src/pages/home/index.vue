<template>
  <div>
    <h1>钱不站点</h1>
    <t-list>
      <t-list-item v-for="server in servers" :key="server.id">
        <t-link theme="primary" @click="jump(server.id)">{{ server.name }}</t-link>
        <template #action>
          <t-button theme="primary" variant="text" @click="openMediaServerEdit(server)">编辑</t-button>
        </template>
      </t-list-item>
    </t-list>
    <t-button @click="openMediaServerEdit()">新增</t-button>
  </div>
</template>
<script lang="ts" setup>
import {useMediaServerStore} from "@/store";
import {openMediaServerEdit} from "@/pages/home/func/MediaServerEdit.tsx";

const router = useRouter();

const servers = computed(() => useMediaServerStore().servers);

const jump = (id: string) => {
  router.push(`/media/${id}/home`)
}
</script>
<style scoped lang="less">

</style>
