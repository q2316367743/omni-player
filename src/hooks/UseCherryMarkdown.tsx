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
    }
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