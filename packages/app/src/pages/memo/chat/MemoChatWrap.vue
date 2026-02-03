<template>
  <memo-chat v-if="res" :context="res" />
  <loading-result v-else title="正在加载中"/>
</template>
<script lang="ts" setup>
import {memoChatFunc, type MemoChatFuncResult} from "@/pages/memo/chat/MemoChatFunc.ts";
import MemoChat from "@/pages/memo/chat/MemoChat.vue";
import MessageUtil from "@/util/model/MessageUtil.ts";

const route = useRoute();
const router = useRouter();

const res = shallowRef<MemoChatFuncResult>();

onMounted(() => {
  memoChatFunc(route.params.id as string)
    .then((result) => {
      res.value = result;
    })
    .catch(e => {
      MessageUtil.error("初始化聊天失败", e);
      router.back();
    })
})
</script>
<style scoped lang="less">

</style>
