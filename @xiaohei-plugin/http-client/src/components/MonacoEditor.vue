<template>
  <div ref="containerRef" class="monaco-editor-container"></div>
</template>

<script setup lang="ts">
import {onMounted, onUnmounted, watch, ref} from 'vue';
import * as monaco from 'monaco-editor';

interface Props {
  modelValue: string;
  language: string;
  readonly?: boolean;
  height?: string;
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false,
  height: '100%',
});

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>();

const containerRef = ref<HTMLElement>();
let editor: monaco.editor.IStandaloneCodeEditor | null = null;


const initEditor = async () => {
  if (!containerRef.value) return;

  editor = monaco.editor.create(containerRef.value, {
    value: props.modelValue,
    language: props.language,
    readOnly: props.readonly,
    theme: 'vs',
    automaticLayout: true,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    fontSize: 14,
    lineNumbers: 'on',
    wordWrap: 'on',
    padding: { top: 10, bottom: 10 }
  });

  editor.onDidChangeModelContent(() => {
    const value = editor?.getValue() ?? '';
    emit('update:modelValue', value);
  });


};

onMounted(() => {
  initEditor();
});

onUnmounted(() => {
  editor?.dispose();
});

watch(
  () => props.modelValue,
  (newValue) => {
    if (editor && newValue !== editor.getValue()) {
      editor.setValue(newValue);
    }
  }
);

watch(
  () => props.language,
  (newLanguage) => {
    if (editor) {
      const model = editor.getModel();
      if (model) {
        monaco.editor.setModelLanguage(model, newLanguage);
      }
    }
  }
);
</script>

<style scoped lang="less">
.monaco-editor-container {
  width: 100%;
  height: v-bind(height);
  overflow: hidden;
}
</style>
