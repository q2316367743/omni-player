<template>
  <div class="p-8px">
    <t-card>
      <t-tabs v-model="active">
        <t-tab-panel label="基础" :value="0">
          <t-form>
            <t-form-item label="开发者模式" label-align="top">
              <t-switch v-model="devSetting.debug"/>
            </t-form-item>
          </t-form>
        </t-tab-panel>
        <t-tab-panel label="RAG" :value="1">
          <DebugRag />
        </t-tab-panel>
      </t-tabs>
    </t-card>
  </div>

</template>
<script lang="ts" setup>
import {storeToRefs} from "pinia";
import {useSettingStore} from "@/store/GlobalSettingStore.ts";
import DebugRag from "@/pages/admin/dev-setting/components/DebugRag.vue";

const {devSetting} = storeToRefs(useSettingStore());
const active = ref(0);
</script>
<style scoped lang="less"></style>
