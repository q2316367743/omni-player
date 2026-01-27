<template>
  <div class="home-assistant">
    <SideMenu :active-menu="currentMenu" @menu-change="handleMenuChange" />
    <div class="content-area">
      <MemoPage v-if="currentMenu === 'memo'" />
      <ToolboxPage v-else-if="currentMenu === 'toolbox'" />
      <PlaceholderPage v-else :type="currentMenu" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import SideMenu from './components/SideMenu.vue';
import MemoPage from './components/MemoPage.vue';
import ToolboxPage from './components/ToolboxPage.vue';
import PlaceholderPage from './components/PlaceholderPage.vue';
import {LocalName} from "@/global/LocalName.ts";

const currentMenu = useSessionStorage(LocalName.PAGE_HOME_ASSISTANT_ACTIVE, 'memo');

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
