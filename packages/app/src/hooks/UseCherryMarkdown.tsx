import {isDark} from "@/global/Constants.ts";
import {NoteFs} from "@/pages/app/editor/func/noteFs.ts";
import {useSnowflake} from "@/util";
import {debounce} from "es-toolkit";
import Cherry from "cherry-markdown";

interface UseCherryMarkdownProps {
  el: HTMLDivElement
  articlePath: string;
  noteFs: NoteFs;
}

export interface UseCherryMarkdownResult {
  cherry: Cherry;
  save: () => Promise<void>;
  destroy: () => void;
}

export async function useCherryMarkdown(props: UseCherryMarkdownProps): Promise<UseCherryMarkdownResult> {

  const onAfterChange = debounce(async (content: string) => {
    await props.noteFs.saveArticleContent(props.articlePath, content);
  }, 500);

  const content = await props.noteFs.readArticleContent(props.articlePath)


  const cherry = new Cherry({
    el: props.el,
    value: content,
    theme: isDark.value ? 'dark' : 'default',
    autoScroll: true,
    locale: 'zh_CN',
    nameSpace: 'cherry',
    themeSettings: {
      // 主题列表，用于切换主题
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
        urlProcessor(url: string) {
          if (url.startsWith('data:') || url.startsWith('http')) {
            return url;
          }
          return props.noteFs.renderAttachment(props.articlePath, url);
        }
      },
      syntax: {
        autoLink: {
          /** 生成的<a>标签追加target属性的默认值 空：在<a>标签里不会追加target属性， _blank：在<a>标签里追加target="_blank"属性 */
          target: '',
          /** 生成的<a>标签追加rel属性的默认值 空：在<a>标签里不会追加rel属性， nofollow：在<a>标签里追加rel="nofollow：在"属性*/
          rel: '',
          /** 是否开启短链接 */
          enableShortLink: true,
          /** 短链接长度 */
          shortLinkLength: 20,
        },
        codeBlock: {
          theme: 'twilight',
          lineNumber: true, // 默认显示行号
          expandCode: true,
          copyCode: true,
          editCode: true,
          changeLang: true,
        },
        table: {
          enableChart: true,
        },
        fontEmphasis: {
          allowWhitespace: false, // 是否允许首尾空格
        },
        strikethrough: {
          needWhitespace: false, // 是否必须有前后空格
        },
        mathBlock: {
          engine: 'MathJax', // katex或MathJax
          // engine: 'katex', // katex或MathJax
          src: 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js', // 如果使用MathJax plugins，则需要使用该url通过script标签引入
          // src: 'https://cdn.jsdelivr.net/npm/katex@0.12.0/dist/katex.min.js',
          // css: 'https://cdn.jsdelivr.net/npm/katex@0.12.0/dist/katex.min.css', // 如果使用katex，则还需要引入css（如果是MathJax，则不需要）
        },
        inlineMath: {
          engine: 'MathJax', // katex或MathJax
          // engine: 'katex', // katex或MathJax
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
        // 'header': {
        //   strict: false
        // }

        panel: {
          // 是否支持对齐语法
          enableJustify: true,
          // 是否支持信息面板语法
          enablePanel: true,
        },
      }
    },
    fileUpload: async (file: File, callback: (url: string, meta: { name: string }) => void) => {
      const ext = file.name.split('.').pop() || '';
      const newFileName = `${useSnowflake().nextId()}.${ext}`;
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      await props.noteFs.uploadAttachment(props.articlePath, newFileName, uint8Array);
      callback(`./${newFileName}`, {name: file.name});
      return `./${newFileName}`;
    },
    callback: {
      afterChange: (markdown: string) => {
        onAfterChange(markdown)
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
      theme:  isDark.value ? 'dark' : 'default',
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
      bubble: ['bold', 'italic', 'underline', 'strikethrough', 'sub', 'sup', 'quote', 'ruby', '|', 'size', 'color'], // array or false
      sidebar: ['fullScreen', 'togglePreview',  'search'],
      toc: {
        // updateLocationHash: false, // 要不要更新URL的hash
        defaultModel: 'full', // pure: 精简模式/缩略模式，只有一排小点； full: 完整模式，会展示所有标题
      },
      config: {
        // 地图表格配置 - 支持自定义地图数据源URL
        mapTable: {
          sourceUrl: [
            // 在线高质量地图数据源（优先，已验证可用）
            'https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json',
            // 本地备用地图数据（从examples目录的相对路径）
            // './assets/data/china.json',
          ],
        },
      },
    },
    previewer: {
      // 自定义markdown预览区域class
      // className: 'markdown'
      floatWhenClosePreviewer: true,
    },
    keydown: [],
    codemirror: {
      placeholder: '输入文本或「/」开始编辑',
    },

  });

  return {
    cherry,
    save: async () => {
      onAfterChange(cherry.getValue())
    },
    destroy: () => {
      cherry.destroy();
    }
  }
}