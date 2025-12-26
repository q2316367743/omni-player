<template>
  <div class="app-aside">
    <!-- Header -->
    <AppAsideHeader/>

    <!-- Scrollable Content -->
    <div class="aside-content">

      <!-- 媒体库 -->
      <AppAsideMedia :active-key="activeKey"/>

      <!-- 网络库 -->
      <AppAsideNetwork :active-key="activeKey"/>

      <!-- 订阅 -->
      <AppAsideSubscribe :active-key="activeKey"/>

      <AppAsideApp :active-key="activeKey"/>

      <!-- Notes Section -->
      <div class="nav-group">
        <div class="group-title">笔记</div>
        <div class="nav-item">
          <div class="nav-item-content">
            <file-icon class="nav-icon"/>
            <span class="nav-text">全部笔记</span>
          </div>
          <span class="count-badge">3</span>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="aside-footer">
      <div class="nav-item" @click="$router.push('/admin/global-setting')">
        <div class="nav-item-content">
          <setting-icon class="nav-icon"/>
          <span class="nav-text">偏好设置</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  FileIcon,
  SettingIcon
} from 'tdesign-icons-vue-next';
import AppAsideMedia from "@/layouts/AppSide/components/AppAsideMedia.vue";
import AppAsideNetwork from "@/layouts/AppSide/components/AppAsideNetwork.vue";
import AppAsideSubscribe from "@/layouts/AppSide/components/AppAsideSubscribe.vue";
import AppAsideHeader from "@/layouts/AppSide/components/AppAsideHeader.vue";
import AppAsideApp from "@/layouts/AppSide/components/AppAsideApp.vue";

const route = useRoute();

const activeKey = computed(() => {
  const [_empty, prefix, id] = route.path.split("/");
  return `${_empty}/${prefix}/${id}`;
})


</script>

<style lang="less">
@import "AppAside.less";
</style>
