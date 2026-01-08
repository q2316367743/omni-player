<template>
  <t-content class="snippet-content">
    <div v-if="snippet" class="content-wrapper">
      <div class="content-header">
        <div class="header-left">
          <t-input
            v-model="snippet.name"
            size="small"
            :borderless="true"
            @blur="handleRenameSnippet"
          />
        </div>
        <div class="header-right">
          <t-select
            v-model="snippet.language"
            size="small"
            :options="languageOptions"
            @change="handleLanguageChange"
          />
          <t-dropdown trigger="click">
            <t-button size="small" variant="text">
              <template #icon>
                <more-icon />
              </template>
            </t-button>
            <t-dropdown-menu>
              <t-dropdown-item @click="handleEditTags">
                <template #prefix-icon>
                  <tag-icon />
                </template>
                编辑标签
              </t-dropdown-item>
              <t-dropdown-item @click="handleDeleteSnippet">
                <template #prefix-icon>
                  <delete-icon />
                </template>
                删除
              </t-dropdown-item>
            </t-dropdown-menu>
          </t-dropdown>
        </div>
      </div>
      
      <div class="editor-wrapper">
        <monaco-editor
          v-model="snippet.content"
          :language="snippet.language"
          height="100%"
        />
      </div>
    </div>
    
    <div v-else class="empty-content">
      <empty-result title="未选择代码片段" tip="请选择或创建代码片段" />
    </div>
  </t-content>
</template>

<script setup lang="ts">
import {ref, watch} from 'vue';
import {DeleteIcon, MoreIcon, TagIcon} from 'tdesign-icons-vue-next';
import type {Snippet} from '@/services/SnippetService';
import {
  deleteSnippet,
  getSnippetContent,
  renameSnippetContent,
  updateSnippetContent
} from '@/services/SnippetService';
import MessageUtil from '@/util/model/MessageUtil';
import MessageBoxUtil from '@/util/model/MessageBoxUtil';
import {debounce} from 'es-toolkit';
import {openTagEdit} from '@/pages/app/programmer/snippet/func/SnippetEdit';
import {MONACO_LANGUAGES} from '@/util/monaco-languages.ts';

const LANGUAGE_OPTIONS = MONACO_LANGUAGES.map(lang => ({
  label: lang.charAt(0).toUpperCase() + lang.slice(1).replace(/([A-Z])/g, ' $1').trim(),
  value: lang
}));

const languageOptions = LANGUAGE_OPTIONS;

const snippet = ref<Snippet>();

const emit = defineEmits<{
  deleted: []
  renamed: [name: string]
}>();

const loadSnippet = async (id: string | undefined) => {
  if (!id) {
    snippet.value = undefined;
    return;
  }
  try {
    snippet.value = await getSnippetContent(id);
  } catch {
    MessageUtil.error('加载代码片段内容失败');
  }
};

const handleRenameSnippet = async () => {
  if (!snippet.value) return;
  
  try {
    await renameSnippetContent(snippet.value.id, snippet.value.name);
    emit('renamed', snippet.value.name);
    MessageUtil.success('重命名成功');
  } catch {
    MessageUtil.error('重命名失败');
  }
};

const handleLanguageChange = async () => {
  if (!snippet.value) return;
  MessageUtil.success('语言切换成功');
};

const handleEditTags = () => {
  if (!snippet.value) return;

  openTagEdit(snippet.value, async () => {
    snippet.value = await getSnippetContent(snippet.value!.id);
  });
};

const handleDeleteSnippet = async () => {
  if (!snippet.value) return;
  
  try {
    await MessageBoxUtil.confirm(
      '确定要删除该代码片段吗？删除后无法恢复。',
      '删除确认'
    );
  } catch {
    return;
  }
  
  try {
    await deleteSnippet(snippet.value.id);
    MessageUtil.success('删除成功');
    snippet.value = undefined;
    emit('deleted');
  } catch {
    MessageUtil.error('删除失败');
  }
};

const saveSnippetContent = debounce(async (data: Snippet) => {
  try {
    await updateSnippetContent(data.id, data.content, data.language);
  } catch {
    MessageUtil.error('保存失败');
  }
}, 1000);

watch(
  () => snippet.value,
  (data) => {
    if (data) {
      saveSnippetContent(data);
    }
  },
  { deep: true }
);

defineExpose({
  loadSnippet
});
</script>

<style scoped lang="less">
.snippet-content {
  background: var(--td-bg-color-container);
  overflow: hidden;
}

.content-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.content-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
  border-bottom: 1px solid var(--fluent-border-subtle);
  background: var(--fluent-card-bg);
}

.header-left {
  flex: 1;
  margin-right: 16px;
  
  :deep(.t-input) {
    font-size: 16px;
    font-weight: 500;
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.editor-wrapper {
  flex: 1;
  overflow: hidden;
}

.empty-content {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
