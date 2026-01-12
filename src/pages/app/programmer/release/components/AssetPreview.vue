<template>
  <div class="asset-preview-container">
    <div v-if="selectedAsset" class="asset-content">
      <div class="asset-header">
        <div class="header-left">
          <t-icon v-if="selectedAsset.file_type === 'document'" name="file-word" size="20px"/>
          <t-icon v-else-if="selectedAsset.file_type === 'sql'" name="file-code" size="20px"/>
          <t-icon v-else name="file" size="20px"/>
          <span class="file-name">{{ selectedAsset.file_name }}</span>
          <span v-if="selectedAsset.relative_path" class="file-path">{{ selectedAsset.relative_path }}</span>
        </div>
      </div>
      <div class="asset-editor">
        <markdown-preview
          v-if="selectedAsset.file_type === 'document'"
          :content="editorContent"
        />
        <monaco-editor
          v-else
          v-model="editorContent"
          :language="editorLanguage"
          :readonly="true"
          height="100%"
        />
      </div>
    </div>
    <div v-else class="empty-state">
      <t-icon name="file" size="48px"/>
      <p>选择一个文件查看内容</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type {ReleaseAssetMeta} from "@/entity/release/ReleaseAssetMeta.ts";
import {getReleaseAssetContent} from "@/services/release/ReleaseAssetService.ts";
import MessageUtil from "@/util/model/MessageUtil.ts";
import MonacoEditor from "@/components/common/MonacoEditor.vue";
import MarkdownPreview from "@/components/common/MarkdownPreview.vue";
import {inferMonacoLanguageByFilename} from "@/modules/monaco";

interface Props {
  assets: Array<ReleaseAssetMeta>;
  selectedId: string;
}

const props = defineProps<Props>();

const selectedAsset = computed(() => props.assets.find(a => a.id === props.selectedId));
const editorContent = ref('');
const editorLanguage = ref('plaintext');

watch(() => props.selectedId, async (newId) => {
  const asset = props.assets.find(a => a.id === newId);
  if (asset) {
    try {
      const content = await getReleaseAssetContent(asset.id);
      if (content) {
        editorContent.value = content.content;
        if (asset.file_type === 'other') {
          editorLanguage.value = content.language || inferMonacoLanguageByFilename(asset.file_name);
        } else if (asset.file_type === 'sql') {
          editorLanguage.value = 'sql';
        }
      }
    } catch (error) {
      MessageUtil.error("加载附件内容失败", error);
    }
  }
}, { immediate: true });
</script>

<style scoped lang="less">
.asset-preview-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .asset-content {
    display: flex;
    flex-direction: column;
    height: 100%;

    .asset-header {
      padding: 12px 16px;
      border-bottom: 1px solid var(--td-border-level-1-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: var(--td-bg-color-container);
      backdrop-filter: var(--fluent-acrylic-blur);

      .header-left {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 1;

        .file-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--td-text-color-primary);
        }

        .file-path {
          font-size: 12px;
          color: var(--td-text-color-secondary);
        }
      }
    }

    .asset-editor {
      flex: 1;
      overflow: hidden;
    }
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--td-text-color-secondary);
    gap: 16px;

    p {
      margin: 0;
      font-size: 14px;
    }
  }
}
</style>
