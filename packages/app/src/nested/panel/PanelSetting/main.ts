import { createPinia } from 'pinia';
import App from './App.vue'

import 'virtual:uno.css'
import '@/assets/style/global.less';
import {createRouter, createWebHashHistory} from "vue-router";
import {adminRouters} from "@/router/modules/admin.ts";
import {useSql} from "@/lib/sql.ts";

document.getElementById("init")?.remove();
useSql().getDb().then(() => {
  createApp(App)
    .use(createPinia())
    .use(createRouter({
      history: createWebHashHistory(),
      routes: [
        {
          path: '/',
          redirect: '/admin/global-setting'
        },
        ...adminRouters
      ],
    }))
    .mount('#app');
})
