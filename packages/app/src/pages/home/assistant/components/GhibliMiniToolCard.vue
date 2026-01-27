<template>
  <div class="ghibli-mini-tool-card" @click="jumpTool()">
    <div :class="['app-icon', tone]">
      <slot name="icon"/>
    </div>
    <div :class="{'tool-title': true, 'disabled' : tone === 'disabled'}">{{ label }}</div>
  </div>
</template>

<script lang="ts" setup>

const props = defineProps<{
  label: string;
  value: string;
  tone: string;
}>();

const router = useRouter();

const jumpTool = () => router.push(`/app/${props.value}`);
</script>

<style scoped lang="less">
.ghibli-mini-tool-card {
  background: var(--td-bg-color-container);
  border-radius: 16px;
  padding: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid var(--td-border-level-1-color);
  backdrop-filter: blur(10px);
  box-shadow: var(--td-shadow-1);

  &:hover {
    transform: translateY(-3px);
    border-color: var(--td-brand-color);
    box-shadow: var(--td-shadow-2);

    .app-icon {
      transform: scale(1.1) rotate(3deg);
    }
  }

  &:active {
    transform: translateY(-1px);
  }

  .app-icon {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    flex-shrink: 0;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: var(--td-shadow-1);

    &::after {
      content: '';
      position: absolute;
      top: 2px;
      left: 2px;
      right: 2px;
      bottom: 2px;
      border-radius: 10px;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.3), transparent);
      pointer-events: none;
    }

    &.todo,
    &.editor,
    &.regex {
      background: linear-gradient(135deg, #a8d8ea 0%, #aa96da 100%);
      color: white;
    }

    &.http {
      background: linear-gradient(135deg, #ffaaa5 0%, #ff8b94 100%);
      color: white;
    }

    &.online {
      background: linear-gradient(135deg, #dcedc1 0%, #a8e6cf 100%);
      color: var(--td-text-color-primary);
    }

    &.disabled {
      background: linear-gradient(135deg, #e8e4d9 0%, #d4c4b0 100%);
      color: var(--td-text-color-secondary);
      box-shadow: none;
    }

    &.media {
      background: linear-gradient(135deg, #ffd3b6 0%, #ffaaa5 100%);
      color: white;
    }

    &.ai {
      background: linear-gradient(135deg, #b5e7a0 0%, #95e1d3 100%);
      color: var(--td-text-color-primary);
    }
  }

  .tool-title {
    font-size: 15px;
    font-weight: 500;
    color: var(--td-text-color-primary);
    font-family: 'LXGW WenKai', 'KaiTi', '楷体', serif;
    letter-spacing: 0.3px;

    &.disabled {
      color: var(--td-text-color-placeholder);
    }
  }
}
</style>
