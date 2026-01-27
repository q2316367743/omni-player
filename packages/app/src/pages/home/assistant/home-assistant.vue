<template>
  <div class="home-assistant">
    <SideMenu @menu-change="handleMenuChange" />
    <div class="content-area">
      <MemoPage v-if="currentMenu === 'memo'" />
      <ToolboxPage v-else-if="currentMenu === 'toolbox'" />
      <PlaceholderPage v-else :type="currentMenu" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import SideMenu from './components/SideMenu.vue';
import MemoPage from './components/MemoPage.vue';
import ToolboxPage from './components/ToolboxPage.vue';
import PlaceholderPage from './components/PlaceholderPage.vue';

const currentMenu = ref('memo');

const handleMenuChange = (menu: string) => {
  currentMenu.value = menu;
};
</script>

<style scoped lang="less">
.home-assistant {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  position: relative;
}

.content-area {
  width: 100%;
  height: 100%;
}
</style>
