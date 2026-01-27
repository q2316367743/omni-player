<template>
  <div class="side-menu">
    <t-tooltip
      v-for="item in menuItems"
      :key="item.key"
      :content="item.label"
      placement="bottom"
      :show-arrow="false"
      :overlay-inner-style="tooltipStyle"
    >
      <div
        class="menu-item"
        :class="{ active: activeMenu === item.key }"
        @click="handleMenuClick(item.key)"
      >
        <t-icon :name="item.icon" size="16px" />
      </div>
    </t-tooltip>
  </div>
</template>

<script lang="ts" setup>

defineProps({
  activeMenu: String
});

interface MenuItem {
  key: string;
  label: string;
  icon: string;
}

const emit = defineEmits<{
  menuChange: [key: string];
}>();

const menuItems: MenuItem[] = [
  { key: 'memo', label: '碎念', icon: 'chat' },
  { key: 'chat', label: '聊天', icon: 'chat-bubble' },
  { key: 'moments', label: '朋友圈', icon: 'image' },
  { key: 'memory', label: '记忆碎片', icon: 'heart' },
  { key: 'toolbox', label: '工具箱', icon: 'app' },
];

const tooltipStyle = {
  background: 'var(--td-bg-color-container)',
  color: 'var(--td-text-color-primary)',
  padding: '8px 16px',
  borderRadius: '12px',
  fontSize: '14px',
  boxShadow: 'var(--td-shadow-2)',
  backdropFilter: 'blur(10px)',
  border: '1px solid var(--td-border-level-1-color)',
};

const handleMenuClick = (key: string) => {
  emit('menuChange', key);
};
</script>

<style scoped lang="less">
.side-menu {
  position: fixed;
  top: 12px;
  left: 12px;
  display: flex;
  gap: 12px;
  z-index: 100;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  width: 24px;
  height: 24px;
  background: var(--td-bg-color-container);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: var(--td-shadow-1);
  backdrop-filter: blur(10px);
  border: 1px solid var(--td-border-level-1-color);

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--td-shadow-2);
    background: var(--td-bg-color-container-hover);
  }

  &.active {
    background: var(--td-brand-color);
    color: white;
    border-color: var(--td-brand-color);

    :deep(.t-icon) {
      color: white;
    }
  }
}
</style>
