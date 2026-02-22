import {createPinia} from 'pinia';
import App from './App.vue'

import 'virtual:uno.css'
import '@/assets/style/global.less';
import {useSql} from "@/lib/sql.ts";
import {settingAddRouter, settingMainRouter} from "@/nested/panel/PanelSetting/router.ts";


const usp = new URLSearchParams(location.search);
const type = usp.get('type');


document.getElementById("init")?.remove();
useSql().getDb().then(() => {
  createApp(App)
    .use(createPinia())
    .use(
      type ? settingAddRouter : settingMainRouter)
    .mount('#app');
})
