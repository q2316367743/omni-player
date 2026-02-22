import {createPinia} from 'pinia';

import 'virtual:uno.css'
import '@/assets/style/global.less';
import {TOOL_MAP} from "@/global/PluginList.ts";
import {registerMonacoLanguages} from '@/modules/monaco';
import {createRouter, createWebHashHistory} from "vue-router";

registerMonacoLanguages();


// 👇 必须在 import monaco 之前设置！
self.MonacoEnvironment = {
  getWorker(_moduleId, label) {
    switch (label) {
      case 'json':
        return new Worker(new URL('monaco-editor/esm/vs/language/json/json.worker.js', import.meta.url), {
          type: 'module',
        });
      case 'css':
      case 'scss':
      case 'less':
        return new Worker(new URL('monaco-editor/esm/vs/language/css/css.worker.js', import.meta.url), {
          type: 'module',
        });
      case 'typescript':
      case 'javascript':
        return new Worker(new URL('monaco-editor/esm/vs/language/typescript/ts.worker.js', import.meta.url), {
          type: 'module',
        });
      default:
        return new Worker(new URL('monaco-editor/esm/vs/editor/editor.worker.js', import.meta.url), {
          type: 'module',
        });
    }
  },
};

// 从连接中获取
const usp = new URLSearchParams(location.search);
const id = usp.get('id');
if (id) {
  const tool = TOOL_MAP.get(id);
  if (tool) {
    // 额外引入图标库
    tool.payload.entry().then(async comp => {
      // 初始化sql
      await tool.payload.onBeforeLoad?.();
      // 删除 loading
      document.getElementById("init")?.remove();
      // 创建组件
      const app = createApp(comp.default);
      if (tool.payload.router) {
        // 如果存在路由
        app.use(createRouter({
          history: createWebHashHistory(),
          routes: tool.payload.router
        }));
      }
      await tool.payload.onBeforeMount?.();
      app.use(createPinia());
      app.mount('#app');
    })
  }
}

