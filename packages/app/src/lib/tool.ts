import {openUrl} from '@tauri-apps/plugin-opener';
import type {ToolItem} from "@/global/PluginList.ts";
import {WebviewWindow} from "@tauri-apps/api/webviewWindow";


const openPopupPluginInner = async (tool: ToolItem<'inner'>) => {
  const toolId = tool.id;
  if (tool) {
    const ww = new WebviewWindow(`plugin-inner-${toolId}-${Date.now()}`, {
      url: import.meta.env.DEV ? `http://localhost:5123/popup-plugin.html?id=${toolId}` : `./popup-plugin.html?id=${toolId}`,
      title: tool.label,
      width: 1200,
      height: 800,
      minWidth: 1200,
      minHeight: 800,
      resizable: true,
      fullscreen: false,
      transparent: true
    })


    await ww.once('tauri://created', async () => {
      // webview successfully created
      console.log('webview successfully created')
    });
    await ww.once('tauri://error', function (e) {
      // an error happened creating the webview
      console.error('an error happened creating the webview');
      console.error(e);
    });

    await ww.show();
    await ww.setFocus();

  }
}

const openPopupLink = async (tool: ToolItem<'link'>) => {
  const {url, openWith, program} = tool.payload;
  if (openWith === 'default') {
    await openUrl(url);
  } else if (openWith === 'customer') {
    await openUrl(url, program);
  } else if (openWith === 'tauri') {
    const ww = new WebviewWindow(`plugin-link`, {
      url: url,
      title: tool.label,
      width: 1200,
      height: 800,
    });
    await ww.show();
  } else {
    await openUrl(url, openWith);
  }
}

export const handlePopupToolClick = async (tool: ToolItem) => {
  if (tool.type === 'inner') {
    await openPopupPluginInner(tool as ToolItem<'inner'>)
  } else if (tool.type === 'link') {
    await openPopupLink(tool as ToolItem<'link'>);
  }
}
