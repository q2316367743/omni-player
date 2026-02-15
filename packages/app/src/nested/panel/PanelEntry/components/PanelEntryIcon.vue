<template>
  <component :is="getIconComponent(name)" />
</template>
<script lang="ts" setup>
import {
  CheckRectangleIcon,
  Edit1Icon,
  MoneyIcon,
  ChatIcon,
  UsergroupIcon,
  CodeIcon,
  InternetIcon,
  GitMergeIcon,
  Code1Icon,
  CommandIcon,
  TranslateIcon,
  ArticleIcon,
  VideoIcon,
  ImageIcon,
  PortraitIcon,
} from 'tdesign-icons-vue-next';

defineProps({
  name: String
});

// 图标组件映射表
const iconComponentMap: Record<string, any> = {
  CheckRectangleIcon,
  Edit1Icon,
  MoneyIcon,
  ChatIcon,
  UsergroupIcon,
  CodeIcon,
  InternetIcon,
  GitMergeIcon,
  Code1Icon,
  CommandIcon,
  TranslateIcon,
  ArticleIcon,
  VideoIcon,
  ImageIcon,
  PortraitIcon,
};

// 获取图标组件
function getIconComponent(iconName?: string) {
  return iconName ? iconComponentMap[iconName] || CodeIcon : CodeIcon;
}
</script>
<style scoped lang="less">

</style>
