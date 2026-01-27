<template>
  <div class="ghibli-tool-card" @click="jumpTool()">
    <div :class="['app-icon', tone]">
      <slot name="icon"/>
    </div>
    <div class="tool-info">
      <div class="tool-name">{{ label }}</div>
      <div class="tool-desc">{{ desc }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
type ToolCardTone = 'todo' | 'editor' | 'regex' | 'http' | 'online' | 'media' | 'ai';

const props = defineProps<{
  label: string;
  value: string;
  desc: string;
  tone: ToolCardTone;
}>();

const router = useRouter();

const jumpTool = () => router.push(`/app/${props.value}`);
</script>

<style scoped lang="less">
.ghibli-tool-card {
  background: var(--td-bg-color-container);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--td-shadow-2);
  border: 2px solid var(--td-border-level-1-color);
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.4), transparent);
    opacity: 0;
    transition: opacity 0.4s ease;
  }

  &:hover {
    transform: translateY(-4px) scale(1.02);
    box-shadow: var(--td-shadow-3);
    border-color: var(--td-brand-color);

    &::before {
      opacity: 1;
    }

    .app-icon {
      transform: scale(1.1) rotate(5deg);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
    }
  }

  &:active {
    transform: translateY(-2px) scale(1.01);
  }

  .app-icon {
    width: 64px;
    height: 64px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    flex-shrink: 0;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    z-index: 1;
    box-shadow: var(--td-shadow-2);

    &::after {
      content: '';
      position: absolute;
      top: 3px;
      left: 3px;
      right: 3px;
      bottom: 3px;
      border-radius: 13px;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.3), transparent);
      pointer-events: none;
    }

    &.todo {
      background: linear-gradient(135deg, #a8d8ea 0%, #aa96da 100%);
      color: white;
    }

    &.editor {
      background: linear-gradient(135deg, #fcbad3 0%, #aa96da 100%);
      color: white;
    }

    &.regex {
      background: linear-gradient(135deg, #ffffd2 0%, #a8e6cf 100%);
      color: var(--td-text-color-primary);
    }

    &.http {
      background: linear-gradient(135deg, #ffaaa5 0%, #ff8b94 100%);
      color: white;
    }

    &.online {
      background: linear-gradient(135deg, #dcedc1 0%, #a8e6cf 100%);
      color: var(--td-text-color-primary);
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

  .tool-info {
    flex: 1;
    min-width: 0;
    position: relative;
    z-index: 1;

    .tool-name {
      font-size: 18px;
      font-weight: 600;
      color: var(--td-text-color-primary);
      margin-bottom: 6px;
      font-family: 'LXGW WenKai', 'KaiTi', '楷体', serif;
      letter-spacing: 0.5px;
    }

    .tool-desc {
      font-size: 14px;
      color: var(--td-text-color-secondary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1.5;
      font-family: 'LXGW WenKai', 'KaiTi', '楷体', serif;
    }
  }
}
</style>
