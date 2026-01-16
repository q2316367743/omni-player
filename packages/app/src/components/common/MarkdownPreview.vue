<template>
  <div ref="cherryRef" class="cherry-preview-container"></div>
</template>

<script lang="ts" setup>
import {openUrl} from '@tauri-apps/plugin-opener';
import Cherry from "cherry-markdown";
import {isDark} from "@/global/Constants.ts";

interface Props {
  content: string;
  stream?: boolean;
}

const props = defineProps<Props>();

const cherryRef = ref<HTMLDivElement>();
let cherry: Cherry | null = null;

const initCherry = () => {
  if (!cherryRef.value) return;

  cherry = new Cherry({
    el: cherryRef.value,
    value: props.content,
    theme: isDark.value ? 'dark' : 'default',
    autoScroll: true,
    locale: 'zh_CN',
    nameSpace: 'markdown-preview',
    themeSettings: {
      themeList: [
        {className: 'default', label: '默认'},
        {className: 'dark', label: '黑'},
        {className: 'light', label: '白'},
        {className: 'green', label: '绿'},
        {className: 'red', label: '粉'},
        {className: 'violet', label: '紫'},
        {className: 'blue', label: '蓝'},
      ],
      toolbarTheme: isDark.value ? 'dark' : 'light',
      codeBlockTheme: isDark.value ? 'material-ocean' : 'default',
      mainTheme: isDark.value ? 'dark' : 'violet',
      inlineCodeTheme: isDark.value ? 'black' : 'red',
    },
    editor: {
      defaultModel: "previewOnly",
    },
    engine: {
      global: {
        htmlAttrWhiteList: 'part|slot',
        flowSessionContext: props.stream,
        flowSessionCursor: ''
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
          editCode: false,
          changeLang: false,
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
    toolbars: {
      theme: isDark.value ? 'dark' : 'default',
      toolbar: [],
      bubble: [],
      sidebar: [],
    },
    previewer: {
      floatWhenClosePreviewer: false,
      enablePreviewerBubble: false
    },
    callback: {
      onClickPreview(event: PointerEvent) {
        const target = event.target as HTMLElement;
        const anchor = target.closest('a');
        
        if (anchor && anchor.href) {
          event.stopPropagation();
          event.preventDefault();
          openUrl(anchor.href);
        }
      }
    }
  });
};

watch(() => props.content, (newValue) => {
  if (cherry && cherry.getValue() !== newValue) {
    cherry.setValue(newValue);
  }
});

watch(isDark, () => {
  cherry?.setTheme(isDark.value ? 'dark' : 'default');
});

onMounted(() => {
  initCherry();
});

onBeforeUnmount(() => {
  cherry?.destroy();
  cherry = null;
});
</script>

<style scoped lang="less">
.cherry-preview-container {
  height: 100%;
  width: 100%;
  overflow: auto;

  :deep(.cherry) {
    --base-font-color: var(--td-text-color-primary);
    --md-paragraph-color: var(--td-text-color-primary);
    background-color: transparent !important;

    .cherry-toolbar {
      display: none;
    }

    p:last-child {
      margin-bottom: 0 !important;
    }
  }

  :deep(.cherry-previewer) {
    border: none !important;
    background-color: transparent !important;
  }
}
</style>
