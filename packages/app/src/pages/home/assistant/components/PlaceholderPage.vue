<template>
  <div class="placeholder-page">
    <div class="placeholder-content">
      <t-icon :name="icon" size="64px" />
      <h2 class="placeholder-title">{{ title }}</h2>
      <p class="placeholder-desc">{{ description }}</p>
      <div class="placeholder-decoration">
        <div class="cloud cloud-1"></div>
        <div class="cloud cloud-2"></div>
        <div class="cloud cloud-3"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

interface Props {
  type: string;
}

const props = defineProps<Props>();

const icon = computed(() => {
  const icons: Record<string, string> = {
    chat: 'chat-bubble',
    moments: 'image',
    memory: 'heart',
    toolbox: 'tool',
  };
  return icons[props.type] || 'info-circle';
});

const title = computed(() => {
  const titles: Record<string, string> = {
    chat: '聊天',
    moments: '朋友圈',
    memory: '记忆碎片',
    toolbox: '工具箱',
  };
  return titles[props.type] || '敬请期待';
});

const description = computed(() => {
  const descriptions: Record<string, string> = {
    chat: '与 AI 助手进行对话交流',
    moments: '分享你的生活瞬间',
    memory: '珍藏美好的回忆',
    toolbox: '实用工具集合',
  };
  return descriptions[props.type] || '功能开发中...';
});
</script>

<style scoped lang="less">
.placeholder-page {
  width: calc(100vw - 40px);
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 66px 20px 20px 20px;
  position: relative;
  overflow: hidden;
}

.placeholder-content {
  text-align: center;
  position: relative;
  z-index: 1;
  padding: 60px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  animation: fadeIn 0.6s ease-out;

  :deep(.t-icon) {
    color: var(--td-brand-color);
    margin-bottom: 24px;
    filter: drop-shadow(0 4px 8px rgba(0, 120, 212, 0.2));
  }
}

.placeholder-title {
  font-size: 32px;
  font-weight: 600;
  color: var(--td-text-color-primary);
  margin: 0 0 16px 0;
  font-family: 'LXGW WenKai', 'KaiTi', '楷体', serif;
}

.placeholder-desc {
  font-size: 16px;
  color: var(--td-text-color-secondary);
  margin: 0;
  line-height: 1.6;
}

.placeholder-decoration {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 0;
}

.cloud {
  position: absolute;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  animation: float 8s ease-in-out infinite;

  &::before,
  &::after {
    content: '';
    position: absolute;
    background: inherit;
    border-radius: 50%;
  }

  &.cloud-1 {
    width: 120px;
    height: 60px;
    top: 10%;
    left: 10%;
    animation-delay: 0s;

    &::before {
      width: 50px;
      height: 50px;
      top: -25px;
      left: 20px;
    }

    &::after {
      width: 70px;
      height: 70px;
      top: -35px;
      left: 50px;
    }
  }

  &.cloud-2 {
    width: 100px;
    height: 50px;
    top: 20%;
    right: 15%;
    animation-delay: 2s;

    &::before {
      width: 40px;
      height: 40px;
      top: -20px;
      left: 15px;
    }

    &::after {
      width: 60px;
      height: 60px;
      top: -30px;
      left: 40px;
    }
  }

  &.cloud-3 {
    width: 80px;
    height: 40px;
    bottom: 20%;
    left: 20%;
    animation-delay: 4s;

    &::before {
      width: 35px;
      height: 35px;
      top: -17px;
      left: 12px;
    }

    &::after {
      width: 50px;
      height: 50px;
      top: -25px;
      left: 30px;
    }
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) translateX(0);
  }
  25% {
    transform: translateY(-10px) translateX(5px);
  }
  50% {
    transform: translateY(-5px) translateX(-5px);
  }
  75% {
    transform: translateY(-15px) translateX(3px);
  }
}
</style>
