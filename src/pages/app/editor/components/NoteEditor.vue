<template>
  <div class="note-editor-container">
    <div ref="vditorRef" class="vditor-container"></div>
  </div>
</template>

<script lang="ts" setup>
import {ref, onMounted, watch, onBeforeUnmount} from 'vue';
import Vditor from 'vditor';
import 'vditor/dist/index.css';
import {NoteFs} from "../func/noteFs.ts";
import {isDark} from "@/global/Constants.ts";

interface Props {
  content: string;
  articlePath: string;
  noteFs: NoteFs;
}

const props = defineProps<Props>();

const emit = defineEmits(['update:content', 'save', 'manualSave']);

const vditorRef = ref<HTMLElement | null>(null);
let vditor: Vditor | null = null;
let saveTimer: number | null = null;

const initVditor = () => {
  if (!vditorRef.value) return;

  vditor = new Vditor(vditorRef.value, {
    height: '100%',
    value: props.content,
    mode: 'wysiwyg',
    placeholder: '开始写作...',
    theme: isDark.value ? 'dark' : 'classic',
    icon: 'ant',
    cache: {
      enable: false,
    },
    upload: {
      handler: async (files: File[]) => {
        if (!files || files.length === 0) {
          return '';
        }
        const file = files[0]!;
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        try {
          const uploadedPath = await props.noteFs.uploadAttachment(
            props.articlePath,
            file.name,
            uint8Array
          );
          
          const fileName = uploadedPath.split('/').pop() || file.name;
          return `![](${fileName})`;
        } catch (error) {
          console.error('Upload failed:', error);
          throw error;
        }
      },
      filename: (name: string) => name
    },
    input: (value: string) => {
      emit('update:content', value);
      debouncedSave();
    },
    after: () => {
      vditor?.setValue(props.content);
    }
  });
};

const debouncedSave = () => {
  if (saveTimer) {
    clearTimeout(saveTimer);
  }
  saveTimer = window.setTimeout(() => {
    saveContent();
  }, 1000);
};

const saveContent = async () => {
  if (vditor && props.articlePath) {
    const content = vditor.getValue();
    try {
      await props.noteFs.saveArticleContent(props.articlePath, content);
      emit('save');
    } catch (error) {
      console.error('Save failed:', error);
    }
  }
};

const manualSave = () => {
  if (saveTimer) {
    clearTimeout(saveTimer);
  }
  saveContent();
  emit('manualSave');
};

watch(() => props.content, (newContent) => {
  if (vditor && vditor.getValue() !== newContent) {
    vditor.setValue(newContent);
  }
});

watch(() => props.articlePath, () => {
  if (vditor) {
    vditor.setValue(props.content);
  }
});

onMounted(() => {
  initVditor();
});

onBeforeUnmount(() => {
  if (saveTimer) {
    clearTimeout(saveTimer);
  }
  manualSave();
  vditor?.destroy();
  vditor = null;
});

defineExpose({
  save: manualSave
});
</script>

<style scoped lang="less">
.note-editor-container {
  height: 100%;
  width: 100%;
  overflow: hidden;

  .vditor-container {
    height: 100%;
    width: 100%;

    :deep(.vditor-reset) {
      color: var(--td-text-color-primary);
    }
  }
}
</style>
