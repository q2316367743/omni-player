<template>
  <div class="app-layout">
    <div class="app-layout-header" data-tauri-drag-region>
      <div class="ml-4px flex gap-4px items-center shrink-0">
        <div class="w-24px">
          <t-button theme="primary" size="small" variant="text" shape="square" :disabled="disbaleBack" @click="goBack">
            <template #icon>
              <chevron-left-icon/>
            </template>
          </t-button>
        </div>
        <div class="w-24px">
          <t-button theme="primary" size="small" variant="text" shape="square">
            <template #icon>
              <refresh-icon/>
            </template>
          </t-button>
        </div>
        <div class="w-24px">
          <t-button theme="primary" size="small" variant="text" shape="square" :disabled="disableHome" @click="goHome">
            <template #icon>
              <home-icon/>
            </template>
          </t-button>
        </div>
        <slot name="header"/>
      </div>
      <WindowControl/>
    </div>
    <div class="app-layout-content">
      <slot name="content"/>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {ChevronLeftIcon, HomeIcon, RefreshIcon} from "tdesign-icons-vue-next";

const router = useRouter();
const route = useRoute();

const disbaleBack = computed(() => false);
const disableHome = computed(() => route.path === '/home');

const goBack = () => router.back();
const goHome = () => router.replace('/home');
</script>
<style scoped lang="less">
.app-layout {
  position: relative;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  user-select: none;

  .app-layout-header {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 32px;
    border-bottom: 1px solid var(--td-border-level-1-color);
    display: flex;
    justify-content: space-between;
  }

  .app-layout-content {
    position: absolute;
    top: 33px;
    left: 0;
    width: 100vw;
    height: calc(100vh - 33px);
  }
}
</style>
