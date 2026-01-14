<template>
  <roundtable-home v-if="aiEnabled"/>
  <empty-result v-else title="请先启用 AI 助手" tip="请先启用 AI 助手">
    <t-button @click="setAiEnabled" class="btn">启用 AI 助手</t-button>
  </empty-result>
</template>
<script lang="ts" setup>
import RoundtableHome from "@/pages/app/ai/roundtable/roundtable-home.vue";
import {useSettingStore} from "@/store/GlobalSettingStore.ts";

const router = useRouter();

const aiEnabled = computed(() => useSettingStore().aiEnabled);

const setAiEnabled = () => {
  router.push("/admin/ai-setting");
}
</script>
<style scoped lang="less">

</style>
