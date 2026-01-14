<template>
  <t-card class="config-card" bordered>
    <div class="preview-header">
      <h3>生成的 nginx.conf 配置</h3>
      <t-space>
        <t-button theme="default" variant="outline" @click="copyConfig">
          <template #icon><t-icon name="file-copy" /></template>
          复制
        </t-button>
        <t-button theme="primary" @click="exportConfig">
          <template #icon><t-icon name="download" /></template>
          导出
        </t-button>
      </t-space>
    </div>
    <div class="config-preview">
      <MonacoEditor
        :model-value="config"
        language="nginx"
        :readonly="true"
        height="calc(100vh - 256px)"
      />
    </div>
  </t-card>
</template>

<script lang="ts" setup>
import { exportNginxConfig } from '../func/file-handler'
import MessageUtil from "@/util/model/MessageUtil.ts";
import MonacoEditor from '@/components/common/MonacoEditor.vue';

const props = defineProps<{
  config: string
}>()

async function copyConfig() {
  try {
    await navigator.clipboard.writeText(props.config)
    MessageUtil.success('配置已复制到剪贴板')
  } catch {
    MessageUtil.error('复制失败')
  }
}

async function exportConfig() {
  await exportNginxConfig(props.config)
}
</script>

<style scoped lang="less">
.config-card {
  background: var(--fluent-card-bg);
  backdrop-filter: var(--fluent-acrylic-blur);
  border: 1px solid var(--fluent-card-border);
  box-shadow: var(--fluent-card-shadow);
  border-radius: var(--fluent-radius-card);
  transition: all var(--fluent-transition-normal);

  &:hover {
    box-shadow: var(--fluent-card-shadow-hover);
  }
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--td-size-6);

  h3 {
    margin: 0;
    font: var(--td-font-title-medium);
    color: var(--td-text-color-primary);
  }
}

.config-preview {
  padding: var(--td-size-6);
  background: var(--td-bg-color-page);
  border-radius: var(--td-radius-medium);
  border: 1px solid var(--td-border-level-1-color);
}
</style>
