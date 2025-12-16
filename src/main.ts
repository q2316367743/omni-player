import {createApp} from 'vue'
import App from './App.vue'
import 'tdesign-vue-next/es/style/index.css';
import 'virtual:uno.css'
import {createPinia} from "pinia";
import {router} from "@/lib/router.ts";

createApp(App)
  .use(createPinia())
  .use(router)
  .mount('#app')
