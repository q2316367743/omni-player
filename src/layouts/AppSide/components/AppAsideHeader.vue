<template>
  <div class="aside-header">
    <div class="header-left">
      <t-button theme="primary" size="small" variant="text" shape="square" @click="toggleCollapsed()">
        <template #icon>
          <menu-fold-icon/>
        </template>
      </t-button>
      <span class="header-title">亦无悔</span>
    </div>
    <div class="header-actions">
      <t-button theme="primary" size="small" variant="text" shape="square" :disabled="disableBack" @click="goBack">
        <template #icon>
          <chevron-left-icon/>
        </template>
      </t-button>
      <t-button theme="primary" size="small" variant="text" shape="square" :disabled="disableHome" @click="goHome">
        <template #icon>
          <home-icon/>
        </template>
      </t-button>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {toggleCollapsed} from "@/global/Constants.ts";
import {ChevronLeftIcon, HomeIcon, MenuFoldIcon} from "tdesign-icons-vue-next";

const router = useRouter();
const route = useRoute();

const disableBack = computed(() => false);
const disableHome = computed(() => route.path === '/home');


const goBack = () => router.back();
const goHome = () => router.replace('/home');
</script>
<style scoped lang="less">

</style>
