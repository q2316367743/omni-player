<template>
  <div class="mini-tool-card" @click="jumpTool()">
    <div class="mini-tool-icon">
      <slot name="icon"/>
    </div>
    <div :class="{'mini-tool-title': true}">{{ label }}</div>
  </div>
</template>
<script lang="ts" setup>

const props = defineProps<{
  label: string;
  value: string;
}>();

const router = useRouter();

const jumpTool = () => router.push(`/mp/${props.value}`);
</script>
<style scoped lang="less">
.mini-tool-card {
  background: var(--td-bg-color-container);
  border-radius: var(--td-radius-medium);
  padding: var(--td-size-3) var(--td-size-4);
  display: flex;
  align-items: center;
  gap: var(--td-size-3);
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid var(--fluent-border-subtle);

  &:hover {
    transform: translateY(-2px);
    border-color: var(--td-brand-color);
    box-shadow: var(--fluent-elevation-1);
  }
}

.mini-tool-icon {
  width: 32px;
  height: 32px;
  border-radius: var(--td-radius-medium);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;

  background: linear-gradient(135deg, var(--td-brand-color-5) 0%, var(--td-brand-color-7) 100%);
  color: var(--td-text-color-anti);
  box-shadow: var(--fluent-elevation-1);
}

.mini-tool-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--td-text-color-primary);

  &.disabled {
    color: var(--td-text-color-placeholder);
  }
}
</style>

