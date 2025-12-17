<template>
  <div>常规视频</div>
</template>
<script lang="ts" setup>
import type {NetworkListItem} from "@/modules/network/types/NetworkListItem.ts";

defineProps({
  item: {
    type: Object as PropType<NetworkListItem>,
    required: true
  }
})
</script>
<style scoped lang="less">

</style>
