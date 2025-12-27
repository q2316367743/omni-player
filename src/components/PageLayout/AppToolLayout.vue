<template>
  <div class="app-layout">
    <div class="app-layout-header">
      <t-button theme="primary" variant="text" shape="square"
                @click="goBack()">
        <template #icon>
          <chevron-left-icon/>
        </template>
      </t-button>
      <div>{{ title }}</div>
    </div>
    <div class="app-layout-content">
      <slot/>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {ChevronLeftIcon} from "tdesign-icons-vue-next";

defineProps({
  title: String
})

const router = useRouter();
const goBack = () => router.back();
</script>
<style scoped lang="less">
.app-layout {
  position: relative;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  user-select: none;
  background-color: var(--td-bg-color-container);

  .app-layout-header {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 56px;
    border-bottom: 1px solid var(--td-border-level-1-color);
    display: flex;
    align-items: center;
    padding-left: 16px;
    gap: 8px;
  }

  .app-layout-content {
    position: absolute;
    top: 57px;
    left: 0;
    width: 100%;
    height: calc(100vh - 33px);
    transform: scale(1);
    overflow: auto;
  }
}
</style>
