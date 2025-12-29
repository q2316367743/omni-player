<template>
  <app-tool-layout title="在线翻译">
    <div class="fanyi">
      <t-tabs v-model="active">
        <t-tab-panel v-for="f in fanyi" :key="f.value" :value="f.value" :label="f.label"/>
      </t-tabs>

      <div class="fanyi-container">
        <fanyi-u-api-pat v-if="active === 'uapis-post-ai-translate'"/>
        <fanyi-u-api-pts v-else-if="active === 'uapis-post-translate-stream'"/>
        <fanyi-pear-api13 v-else-if="active === 'pear-api-13'"/>
        <fanyi-pear-api303 v-else-if="active === 'pear-api-303'"/>
      </div>
    </div>
  </app-tool-layout>
</template>
<script lang="ts" setup>
import {LocalName} from "@/global/LocalName.ts";
import FanyiUApiPat from "@/pages/app/fanyi/components/fanyi-u-api-pat.vue";
import FanyiUApiPts from "@/pages/app/fanyi/components/fanyi-u-api-pts.vue";
import FanyiPearApi13 from "@/pages/app/fanyi/components/fanyi-pear-api-13.vue";
import FanyiPearApi303 from "@/pages/app/fanyi/components/fanyi-pear-api-303.vue";

const active = useLocalStorage(LocalName.PAGE_APP_FAN_YI_INDEX_ACTIVE, "uapis-post-ai-translate");
const fanyi = [{
  label: "UApiPro | AI 智能翻译",
  value: "uapis-post-ai-translate"
}, {
  label: "UApiPro | 流式翻译",
  value: "uapis-post-translate-stream"
}, {
  label: "PearAPI | 万能翻译",
  value: "pear-api-13"
}, {
  label: "PearAPI | AI万能翻译",
  value: "pear-api-303"
}]
</script>
<style scoped lang="less">
.fanyi {
  position: relative;
  width: 100%;
  height: 100%;

  .fanyi-container {
    position: absolute;
    top: 44px;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: auto;
  }
}
</style>
