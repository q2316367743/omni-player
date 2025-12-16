<template>
  <div>
    <h1>钱不站点</h1>
    <t-list>
      <t-list-item v-for="server in servers" :key="server.id">
        <t-link theme="primary" @click="jump(server.id)">{{ server.name }}</t-link>
        <template #action>
          <t-button theme="primary" variant="text" @click="openMediaServerEdit(server)">编辑</t-button>
          <t-button theme="danger" variant="text" @click="openMediaServerRemove(server)">删除</t-button>
        </template>
      </t-list-item>
    </t-list>
    <t-button @click="openMediaServerEdit()">新增</t-button>
  </div>
</template>
<script lang="ts" setup>
import {useMediaServerStore} from "@/store";
import {openMediaServerEdit} from "@/pages/home/func/MediaServerEdit.tsx";
import type {MediaServer} from "@/entity/MediaServer.ts";
import MessageBoxUtil from "@/util/model/MessageBoxUtil.tsx";
import MessageUtil from "@/util/model/MessageUtil.ts";

const router = useRouter();

const servers = computed(() => useMediaServerStore().servers);

const jump = (id: string) => {
  router.push(`/media/${id}/home`)
}
const openMediaServerRemove = (server: MediaServer) => {
  MessageBoxUtil.confirm("确定要删除吗？", "提示", {
    confirmButtonText: "确定",
  }).then(() => {
    useMediaServerStore().removeServer(server)
      .then(() => MessageUtil.success("删除成功"))
      .catch((e) => MessageUtil.error("删除失败", e))
  })
}
</script>
<style scoped lang="less">

</style>
