<template>
  <div class="markdown-editor-container">
    <div ref="cherryRef" class="cherry-container"></div>
  </div>
</template>

<script lang="ts" setup>
import Cherry from "cherry-markdown";
import {isDark} from "@/global/Constants.ts";

interface Props {
  modelValue?: string;
  placeholder?: string;
  readonly?: boolean;
  onFileUpload?: (file: File) => Promise<string>;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '输入文本或「/」开始编辑',
  readonly: false
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
  'change': [value: string];
}>();

const cherryRef = ref<HTMLDivElement>();
let cherry: Cherry | null = null;

const initCherry = () => {
  if (!cherryRef.value) return;

  cherry = new Cherry({
    el: cherryRef.value,
    value: props.modelValue,
    theme: isDark.value ? 'dark' : 'default',
    autoScroll: true,
    locale: 'zh_CN',
    nameSpace: 'cherry',
    themeSettings: {
      themeList: [
        { className: 'default', label: '默认' },
        { className: 'dark', label: '黑' },
        { className: 'light', label: '白' },
        { className: 'green', label: '绿' },
        { className: 'red', label: '粉' },
        { className: 'violet', label: '紫' },
        { className: 'blue', label: '蓝' },
      ],
      toolbarTheme: isDark.value ? 'dark' : 'light',
      codeBlockTheme: isDark.value ? 'material-ocean' : 'default',
      mainTheme: isDark.value ? 'dark' : 'light',
      inlineCodeTheme: isDark.value ? 'black' : 'red',
    },
    editor: {
      defaultModel: "edit&preview",
      codemirror: {
        theme: isDark.value ? 'material-ocean' : 'default',
      },
    },
    engine: {
      global: {
        htmlAttrWhiteList: 'part|slot',
        flowSessionContext: false,
      },
      syntax: {
        autoLink: {
          target: '',
          rel: '',
          enableShortLink: true,
          shortLinkLength: 20,
        },
        codeBlock: {
          theme: 'twilight',
          lineNumber: true,
          expandCode: true,
          copyCode: true,
          editCode: true,
          changeLang: true,
        },
        table: {
          enableChart: true,
        },
        fontEmphasis: {
          allowWhitespace: false,
        },
        strikethrough: {
          needWhitespace: false,
        },
        mathBlock: {
          engine: 'MathJax',
          src: 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js',
        },
        inlineMath: {
          engine: 'MathJax',
        },
        emoji: {
          useUnicode: true,
          customResourceURL: 'https://github.githubassets.com/images/icons/emoji/unicode/${code}.png?v8',
          upperCase: false,
        },
        htmlBlock: {
          removeTrailingNewline: false,
        },
        toc: {
          tocStyle: 'nested'
        },
        panel: {
          enableJustify: true,
          enablePanel: true,
        },
      }
    },
    fileUpload: props.onFileUpload ? async (file: File, callback: (url: string, meta: { name: string }) => void) => {
      const url = await props.onFileUpload!(file);
      callback(url, { name: file.name });
      return url;
    } : undefined,
    callback: {
      afterChange: (markdown: string) => {
        emit('update:modelValue', markdown);
        emit('change', markdown);
      },
    },
    multipleFileSelection: {
      video: true,
      audio: true,
      image: true,
      word: true,
      pdf: true,
      file: true,
    },
    toolbars: {
      theme: isDark.value ? 'dark' : 'default',
      toolbar: [
        'bold',
        'italic',
        {
          strikethrough: ['strikethrough', 'underline', 'sub', 'sup', 'ruby'],
        },
        'size',
        '|',
        'color',
        'header',
        '|',
        'ol',
        'ul',
        'checklist',
        'panel',
        'align',
        'detail',
        '|',
        'formula',
        {
          insert: [
            'image',
            'audio',
            'video',
            'link',
            'hr',
            'br',
            'code',
            'inlineCode',
            'formula',
            'toc',
            'table',
            'pdf',
            'word',
            'file',
          ],
        },
        'graph',
        'proTable',
        'codeTheme',
        'shortcutKey'
      ],
      bubble: ['bold', 'italic', 'underline', 'strikethrough', 'sub', 'sup', 'quote', 'ruby', '|', 'size', 'color'],
      sidebar: ['fullScreen', 'togglePreview', 'search'],
      toc: {
        defaultModel: 'full',
      },
      config: {
        mapTable: {
          sourceUrl: [
            'https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json',
          ],
        },
      },
    },
    previewer: {
      floatWhenClosePreviewer: true,
    },
    keydown: [],
    codemirror: {
      placeholder: props.placeholder,
    },
  });
};

watch(() => props.modelValue, (newValue) => {
  if (cherry && cherry.getValue() !== newValue) {
    cherry.setValue(newValue);
  }
});

onMounted(() => {
  initCherry();
});

onBeforeUnmount(() => {
  cherry?.destroy();
  cherry = null;
});

defineExpose({
  getValue: () => cherry?.getValue(),
  setValue: (value: string) => cherry?.setValue(value),
  getHtml: () => cherry?.getHtml(),
  destroy: () => {
    cherry?.destroy();
    cherry = null;
  }
});
</script>

<style scoped lang="less">
.markdown-editor-container {
  height: 100%;
  width: 100%;
  overflow: hidden;

  .cherry-container {
    height: 100%;
    width: 100%;
  }
}
</style>
