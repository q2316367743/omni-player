import {createApp} from 'vue'
import App from '@/nested/panel/PanelEntry/PanelEntry.vue'
import "@/assets/style/global.less"

import 'virtual:uno.css'
import {createPinia} from "pinia";
import {router} from "@/router";
import {useMpSql, useSql} from "@/lib/sql.ts";
import {logError, logInfo} from "@/lib/log.ts";
import {registerMonacoLanguages} from '@/modules/monaco';
import {initPath} from "@/global/Constants.ts";

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

initPath().catch(e => {
  logError("初始化目录失败", e);
  console.error(e);
}).finally(() => {
  logInfo("初始化目录完成")
  // 只需要初始主要数据库
  Promise.all([
    useSql().migrate(),
    useMpSql().migrate()
  ])
    .then(() => {
      logInfo("数据库合并成功")
    })
    .catch(e => {
      logError("数据库合并失败", e);
      console.error(e);
    })
    .finally(() => {
      document.getElementById("init")?.remove();
      createApp(App)
        .use(createPinia())
        .use(router)
        .mount('#app')
    })

})
