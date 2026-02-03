<template>
  <div class="p-8px">
    <t-card>
      <t-form>
        <t-form-item label="开发者模式" label-align="top">
          <t-switch v-model="devSetting.debug"/>
        </t-form-item>
      </t-form>
    </t-card>
  </div>

</template>
<script lang="ts" setup>
import {storeToRefs} from "pinia";
import {useSettingStore} from "@/store/GlobalSettingStore.ts";
import {colorMode} from "@/global/Constants.ts";

const {devSetting} = storeToRefs(useSettingStore());
</script>
<style scoped lang="less"></style>
