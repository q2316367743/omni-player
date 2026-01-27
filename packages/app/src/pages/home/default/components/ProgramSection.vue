<template>
  <div class="program-section">
    <mini-program-card label="github 商店" value="github-store">
      <template #icon>
        <store-icon/>
      </template>
    </mini-program-card>
  </div>
</template>
<script lang="ts" setup>
import {StoreIcon} from "tdesign-icons-vue-next";
import MiniProgramCard from "@/pages/home/default/components/MiniProgramCard.vue";
</script>
<style scoped lang="less">
.program-section {
  margin-bottom: var(--td-size-6);
  margin-top: 16px;

  display: grid;
  padding-left: var(--td-size-4);
  padding-right: var(--td-size-4);
  width: calc(100% - var(--td-size-8));
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: var(--td-size-4);
}
</style>
