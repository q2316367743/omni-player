import {WebviewWindow} from "@tauri-apps/api/webviewWindow";
import {useToolVisibleStore} from "@/store/ToolVisibleStore.ts";

export const openPopupPlugin = async (toolId: string) => {
  const tool = useToolVisibleStore().getToolInfo(toolId);
  if (tool) {
    // 创建


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


export const openPopupSetting = async () => {
  // 创建

  const ww = new WebviewWindow(`plugin-setting`, {
    url: import.meta.env.DEV ? `http://localhost:5123/popup-setting.html` : `./popup-setting.html`,
    title: '设置',
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