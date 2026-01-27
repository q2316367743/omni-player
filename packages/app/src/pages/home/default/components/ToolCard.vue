<template>
  <div class="tool-card" @click="jumpTool()">
    <div :class="['tool-icon', tone]">
      <slot name="icon"/>
    </div>
    <div class="tool-info">
      <div class="tool-name">{{ label }}</div>
      <div class="tool-desc">{{ desc }}</div>
    </div>
  </div>
</template>
<script lang="ts" setup>
type ToolCardTone = 'todo' | 'editor' | 'regex' | 'http' | 'online' | 'media';

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
.tool-card {
  background: var(--td-bg-color-container);
  border-radius: var(--td-radius-medium);
  padding: var(--td-size-5) var(--td-size-6);
  display: flex;
  align-items: center;
  gap: var(--td-size-5);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--fluent-elevation-1);
  border: 1px solid var(--fluent-border-subtle);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--fluent-reveal-bg);
    opacity: 0;
    transition: opacity 0.25s ease;
  }

  &:hover {
    transform: translateY(-3px);
    box-shadow: var(--fluent-elevation-2);
    border-color: var(--td-brand-color);

    &::before {
      opacity: 1;
    }

    .tool-icon {
      transform: scale(1.1);
    }
  }

  &:active {
    transform: translateY(-1px);
    box-shadow: var(--fluent-elevation-1);
  }

  &:focus-visible {
    outline: none;
    box-shadow: var(--fluent-focus-ring);
  }

  .tool-icon {
    width: 52px;
    height: 52px;
    border-radius: var(--td-radius-medium);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26px;
    flex-shrink: 0;
    transition: transform 0.25s ease;
    position: relative;
    z-index: 1;

    &.todo {
      background: linear-gradient(135deg, var(--td-brand-color-5) 0%, var(--td-brand-color-7) 100%);
      color: var(--td-text-color-anti);
      box-shadow: var(--fluent-elevation-1);
    }

    &.editor {
      background: linear-gradient(135deg, var(--td-brand-color-5) 0%, var(--td-brand-color-7) 100%);
      color: var(--td-text-color-anti);
      box-shadow: var(--fluent-elevation-1);
    }

    &.regex {
      background: linear-gradient(135deg, var(--td-brand-color-5) 0%, var(--td-brand-color-7) 100%);
      color: var(--td-text-color-anti);
      box-shadow: var(--fluent-elevation-1);
    }

    &.http {
      background: linear-gradient(135deg, var(--td-error-color-4) 0%, var(--td-error-color-5) 100%);
      color: var(--td-text-color-anti);
      box-shadow: var(--fluent-elevation-1);
    }

    &.online {
      background: linear-gradient(135deg, var(--td-brand-color-4) 0%, var(--td-brand-color-5) 100%);
      color: var(--td-text-color-anti);
      box-shadow: var(--fluent-elevation-1);
    }

    &.media {
      background: linear-gradient(135deg, var(--td-warning-color-4) 0%, var(--td-warning-color-5) 100%);
      color: var(--td-text-color-anti);
      box-shadow: var(--fluent-elevation-1);
    }
  }

  .tool-info {
    flex: 1;
    min-width: 0;
    position: relative;
    z-index: 1;

    .tool-name {
      font-size: 16px;
      font-weight: 600;
      color: var(--td-text-color-primary);
      margin-bottom: var(--td-size-1);
      letter-spacing: -0.2px;
    }

    .tool-desc {
      font-size: 13px;
      color: var(--td-text-color-secondary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1.4;
    }
  }
}
</style>
