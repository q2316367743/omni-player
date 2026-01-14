<template>
  <t-button :theme :variant :size shape="square"
            @click="goBack()">
    <template #icon>
      <chevron-left-icon/>
    </template>
  </t-button>
</template>
<script lang="ts" setup>
import {ChevronLeftIcon} from "tdesign-icons-vue-next";
import {type TdButtonProps} from "tdesign-vue-next";

defineProps({
  theme: {
    type: String as PropType<TdButtonProps["theme"]>,
    default: "primary"
  },
  variant: {
    type: String as PropType<TdButtonProps["variant"]>,
    default: "text"
  },
  size: {
    type: String as PropType<TdButtonProps["size"]>,
    default: "medium"
  }
});

const router = useRouter();
const goBack = () => router.back();
</script>
<style scoped lang="less">

</style>
