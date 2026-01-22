<template>
  <t-select v-model="activeKey" :options="serviceOptions" :auto-width="true" :filterable="true"
            placeholder="请选择 AI 服务" class="home-assistant-select"/>
</template>
<script lang="ts" setup>
import {type SelectOption} from "tdesign-vue-next";
import {useSettingStore} from "@/store/GlobalSettingStore.ts";

const activeKey = defineModel<string>({
  default: ''
})

const serviceOptions = computed<Array<SelectOption>>(() => {
  const {modelOptions} = useSettingStore();
  return modelOptions
});

</script>
<style scoped lang="less">
.home-assistant-select {
  :deep(.t-select) {
    height: var(--td-comp-size-m);
    margin-right: var(--td-comp-margin-s);

    .t-input {
      border-radius: 32px;
      padding: 0 15px;
    }

    .t-input.t-is-focused {
      box-shadow: none;
    }
  }
}
</style>
