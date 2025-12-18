<template>
  <div class="p-8px">
    <t-form>
      <t-form-item label="播放器类型" label-align="top">
        <t-radio-group v-model="globalSetting.playerModeType">
          <t-radio value="mpv">MPV（内置）</t-radio>
          <t-radio value="h5">H5（浏览器）</t-radio>
          <t-radio value="potplayer">PotPlayer</t-radio>
          <t-radio value="vlc">VLC</t-radio>
          <t-radio value="other">自定义命令</t-radio>
        </t-radio-group>
      </t-form-item>
      <t-form-item label="播放器值" label-align="top">
        <t-input v-model="globalSetting.playerModeValue" placeholder="请输入播放器值"/>
      </t-form-item>
    </t-form>
  </div>
</template>
<script lang="ts" setup>
import {storeToRefs} from "pinia";
import {useGlobalSettingStore} from "@/store/GlobalSettingStore.ts";

const {globalSetting} = storeToRefs(useGlobalSettingStore());
</script>
<style scoped lang="less"></style>
