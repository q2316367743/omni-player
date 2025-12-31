<template>
  <div class="note-editor-container">
    <div ref="cherryRef" class="cherry-container"></div>
  </div>
</template>

<script lang="ts" setup>
import Cherry from 'cherry-markdown';
import 'cherry-markdown/dist/cherry-markdown.css';
import {NoteFs} from "../func/noteFs.ts";
import {isDark} from "@/global/Constants.ts";
import {useSnowflake} from "@/util/lang/Snowflake.ts";

interface Props {
  content: string;
  articlePath: string;
  noteFs: NoteFs;
}

const props = defineProps<Props>();

const emit = defineEmits(['update:content', 'save', 'manualSave']);

const cherryRef = ref<HTMLElement | null>(null);
let cherry: Cherry | null = null;
let saveTimer: number | null = null;
const snowflake = useSnowflake();

const initCherry = () => {
  if (!cherryRef.value) return;

  cherry = new Cherry({
    el: cherryRef.value,
    value: props.content,
    theme: isDark.value ? 'dark' : 'default',
    autoScroll: true,
    toolbars: {
      theme: 'dark',
    },
    engine: {
      global: {
        urlProcessor(url: string) {
          if (url.startsWith('data:') || url.startsWith('http')) {
            return url;
          }
          return props.noteFs.renderAttachment(props.articlePath, url);
        }
      }
    },
    fileUpload: async (file: File, callback: (url: string, meta: { name: string }) => void) => {
      const ext = file.name.split('.').pop() || '';
      const newFileName = `${snowflake.nextId()}.${ext}`;
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      await props.noteFs.uploadAttachment(props.articlePath, newFileName, uint8Array);
      callback(`./${newFileName}`, { name: file.name });
      return `./${newFileName}`;
    },
    callback: {
      afterChange: (markdown: string) => {
        emit('update:content', markdown);
        debouncedSave();
      },
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
  if (cherry && props.articlePath) {
    const content = cherry.getMarkdown();
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
  if (cherry && cherry.getMarkdown() !== newContent) {
    cherry.setMarkdown(newContent);
  }
});

watch(() => props.articlePath, () => {
  if (cherry) {
    cherry.setMarkdown(props.content);
  }
});

onMounted(() => {
  initCherry();
});

onBeforeUnmount(() => {
  if (saveTimer) {
    clearTimeout(saveTimer);
  }
  manualSave();
  cherry?.destroy();
  cherry = null;
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

  .cherry-container {
    height: 100%;
    width: 100%;
  }
}
</style>
