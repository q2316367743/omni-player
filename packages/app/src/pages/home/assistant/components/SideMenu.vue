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
  background: 'rgba(255, 255, 255, 0.95)',
  color: '#4a4a4a',
  padding: '8px 16px',
  borderRadius: '12px',
  fontSize: '14px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(0, 0, 0, 0.06)',
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
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 0, 0, 0.06);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    background: rgba(255, 255, 255, 0.95);
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
