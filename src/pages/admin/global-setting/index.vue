<template>
  <div class="p-8px">
    <t-card>
      <t-form>
        <t-form-item label="颜色模式" label-align="top">
          <t-radio-group v-model="colorMode">
            <t-radio value="light">浅色模式</t-radio>
            <t-radio value="dark">深色模式</t-radio>
            <t-radio value="auto">跟随系统</t-radio>
          </t-radio-group>
        </t-form-item>
        <t-form-item label="RSS刷新间隔" label-align="top">
          <t-input-number v-model="globalSetting.rssRefreshInterval" suffix="分钟" auto-width :min="2" :step="1"/>
        </t-form-item>
      </t-form>
    </t-card>
  </div>

</template>
<script lang="ts" setup>
import {storeToRefs} from "pinia";
import {useGlobalSettingStore} from "@/store/GlobalSettingStore.ts";
import {colorMode} from "@/global/Constants.ts";

const {globalSetting} = storeToRefs(useGlobalSettingStore());
</script>
<style scoped lang="less"></style>
