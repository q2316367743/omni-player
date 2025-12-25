<template>
  <div class="p-8px">
    <t-form>
      <t-form-item label="颜色模式" label-align="top">
        <t-radio-group v-model="colorMode">
          <t-radio value="light">浅色模式</t-radio>
          <t-radio value="dark">深色模式</t-radio>
          <t-radio value="auto">跟随系统</t-radio>
        </t-radio-group>
      </t-form-item>
      <t-form-item label="播放器类型" label-align="top">
        <t-radio-group v-model="globalSetting.playerModeType" :options="getPlayerModeType()" />
      </t-form-item>
      <t-form-item label="播放器值" label-align="top" v-if="globalSetting.playerModeType !== 'h5'">
        <t-input v-model="globalSetting.playerModeValue" placeholder="请输入播放器值"/>
      </t-form-item>
    </t-form>
  </div>
</template>
<script lang="ts" setup>
import {storeToRefs} from "pinia";
import {useGlobalSettingStore} from "@/store/GlobalSettingStore.ts";
import {getPlayerModeType} from "@/entity/GlobalSetting.ts";
import {colorMode} from "@/global/Constants.ts";

const {globalSetting} = storeToRefs(useGlobalSettingStore());
</script>
<style scoped lang="less"></style>
