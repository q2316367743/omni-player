<template>
  <div class="nav-group">
    <div class="group-title">
      <span> APP</span>
    </div>
    <div :class="{'nav-item': true, active: activeKey === '/app/news'}">
      <div class="nav-item-content">
        <article-icon class="nav-icon"/>
        <span class="nav-text">新闻</span>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {ArticleIcon} from "tdesign-icons-vue-next";

defineProps({
  activeKey: String
});

</script>
<style scoped lang="less">

</style>
