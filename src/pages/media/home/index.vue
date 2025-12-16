<template>
  <div>影视</div>
</template>
<script lang="ts" setup>
import {useMediaServerStore} from "@/store";

const route = useRoute();

onMounted(async () => {
  const client = await useMediaServerStore().getServerClient(route.params.id as string);
  client.getLibraries()
})
</script>
<style scoped lang="less">

</style>
