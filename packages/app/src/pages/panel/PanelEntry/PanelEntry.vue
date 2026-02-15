<template>
  <div class="panel-entry-container">
    <!-- 可拖动标题栏 -->
    <div class="panel-header" data-tauri-drag-region>
      <div class="panel-title" data-tauri-drag-region>楼下小黑</div>
      <div class="panel-actions">
        <t-button theme="default" variant="text" size="small" class="action-btn">
          <setting-icon />
        </t-button>
        <t-button theme="default" variant="text" size="small" class="action-btn">
          <pin-icon />
        </t-button>
      </div>
    </div>

    <!-- 主分类网格 -->
    <div class="main-categories">
      <div v-for="category in mainCategories" :key="category.key" class="category-item"
        @click="handleCategoryClick(category)">
        <div class="category-icon">
          <component :is="category.icon" />
        </div>
        <div class="category-name">{{ category.name }}</div>
      </div>
    </div>


    <!-- 子分类区域 -->
    <div class="sub-section">
      <div class="sub-header">
        <span class="sub-title">热门-1</span>
        <div class="sub-actions">
          <t-button theme="default" variant="text" size="small" class="action-btn-small">
            <search-icon />
          </t-button>
          <t-button theme="default" variant="text" size="small" class="action-btn-small">
            <gesture-up-icon />
          </t-button>
        </div>
      </div>
      <div class="sub-grid">
        <div v-for="tool in subTools" :key="tool.key" class="sub-tool-item" @click="handleToolClick(tool)">
          <div class="sub-tool-icon">
            <component :is="tool.icon" />
          </div>
          <div class="sub-tool-name">{{ tool.name }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  SettingIcon,
  SearchIcon,
  GestureUpIcon,
  DesktopIcon,
  InternetIcon,
  TimeIcon,
  PercentIcon,
  FileIcon as FireIcon,
  StarIcon,
  SearchIcon as SearchToolIcon,
  FileIcon as NewIcon,
  FogIcon as FontIcon,
  UserIcon,
  FileIcon as ListIcon,
  ImageIcon,
  SwapIcon,
  ZoomInIcon,
  CloudIcon,
  EditIcon,
  MouseIcon,
  DownloadIcon,
  MailIcon,
  LocationIcon,
  FolderOpenIcon,
  WindowIcon,
  FileIcon,
  LogoAdobePhotoshopIcon,
  FolderIcon,
  SmileIcon,
  ArrowRightIcon, PinIcon
} from 'tdesign-icons-vue-next';
import { markRaw } from 'vue';

// 主分类数据
const mainCategories = [
  { key: 'launch', name: '启动', icon: markRaw(DesktopIcon), bgColor: '#e3f2fd' },
  { key: 'system', name: '系统', icon: markRaw(InternetIcon), bgColor: '#f3e5f5' },
  { key: 'website', name: '网站', icon: markRaw(InternetIcon), bgColor: '#fce4ec' },
  { key: 'time', name: '时间', icon: markRaw(TimeIcon), bgColor: '#e8f5e9' },
  { key: 'lab', name: '实验室', icon: markRaw(PercentIcon), bgColor: '#e0f7fa' },
  { key: 'hot', name: '热门', icon: markRaw(FireIcon), bgColor: '#fff3e0' },
  { key: 'featured', name: '精选', icon: markRaw(StarIcon), bgColor: '#e8eaf6' },
  { key: 'search', name: '搜索', icon: markRaw(SearchToolIcon), bgColor: '#f1f8e9' },
  { key: 'new', name: '最新', icon: markRaw(NewIcon), bgColor: '#ffebee' },
  { key: 'text', name: '文本类', icon: markRaw(FontIcon), bgColor: '#f3e5f5' },
  { key: 'guapi', name: '瓜皮', icon: markRaw(UserIcon), bgColor: '#fff8e1' },
  { key: 'catalog', name: '目录', icon: markRaw(ListIcon), bgColor: '#e0f2f1' },
];

// 子工具数据
const subTools = [
  { key: 'wallpaper', name: '壁纸方案', icon: markRaw(ImageIcon), bgColor: '#e3f2fd' },
  { key: 'transfer', name: '传输', icon: markRaw(SwapIcon), bgColor: '#e8f5e9' },
  { key: 'zoom', name: '缩放切换', icon: markRaw(ZoomInIcon), bgColor: '#fff3e0' },
  { key: 'cloud', name: '云板', icon: markRaw(CloudIcon), bgColor: '#f3e5f5' },
  { key: 'editor', name: '编辑器', icon: markRaw(EditIcon), bgColor: '#fce4ec' },
  { key: 'mouse', name: '鼠标设计', icon: markRaw(MouseIcon), bgColor: '#e0f7fa' },
  { key: 'download', name: '下载', icon: markRaw(DownloadIcon), bgColor: '#e8eaf6' },
  { key: 'mail', name: '简邮', icon: markRaw(MailIcon), bgColor: '#f1f8e9' },
  { key: 'path', name: '定位路径', icon: markRaw(LocationIcon), bgColor: '#ffebee' },
  { key: 'install', name: '安装目录', icon: markRaw(FolderOpenIcon), bgColor: '#fff8e1' },
  { key: 'window', name: '窗口调整', icon: markRaw(WindowIcon), bgColor: '#e0f2f1' },
  { key: 'action', name: '动作单', icon: markRaw(FileIcon), bgColor: '#e3f2fd' },
  { key: 'ps', name: '用PS打开', icon: markRaw(LogoAdobePhotoshopIcon), bgColor: '#e8f5e9' },
  { key: 'todir', name: '至目录', icon: markRaw(FolderIcon), bgColor: '#fff3e0' },
  { key: 'emoji', name: '表情控', icon: markRaw(SmileIcon), bgColor: '#fce4ec' },
  { key: 'next', name: '下一页', icon: markRaw(ArrowRightIcon), bgColor: '#f3e5f5' },
];

const handleCategoryClick = (category: any) => {
  console.log('Category clicked:', category.key);
};

const handleToolClick = (tool: any) => {
  console.log('Tool clicked:', tool.key);
};
</script>

<style scoped lang="less">
@import "PanelEntry.less";
</style>
