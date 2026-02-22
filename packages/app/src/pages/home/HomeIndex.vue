<template>
  <router-view />
</template>
<script lang="ts" setup>
import {useMemoSql} from "@/lib/sql.ts";
import {useMemoFriendStore} from "@/store";
import {setupChatL1Summary} from "@/modules/ai/memo";

onMounted(async () => {
  // 初始化 sql
  await useMemoSql().migrate()
  // 获取全部 memo 好友
  await useMemoFriendStore().loadFriends().then(async () => {
    // 好友初始化完毕
    await Promise.all([
      setupChatL1Summary(),
    ])
  });
  await useMemoFriendStore().loadChatSession();
})
</script>
<style scoped lang="less">

</style>
