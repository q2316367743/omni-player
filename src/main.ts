import {createApp} from 'vue'
import App from './App.vue'
import 'tdesign-vue-next/es/style/index.css';
import {createPinia} from "pinia";

createApp(App)
  .use(createPinia())
  .mount('#app')
