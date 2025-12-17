<template>
  <div>推荐视频</div>
</template>
<script lang="ts" setup>
import type {NetworkRecommend} from "@/modules/network/types/NetworkRecommend.ts";

defineProps({
  item: {
    type: Object as PropType<NetworkRecommend>,
    required: true
  }
})
</script>
<style scoped lang="less">

</style>
