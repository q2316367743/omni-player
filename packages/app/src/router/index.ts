import {createRouter, createWebHashHistory} from 'vue-router';
import {appRouters} from "@/router/modules/app.ts";
import {mediaRouters} from "@/router/modules/media.ts";
import {networkRouters} from "@/router/modules/network.ts";
import {mpRouters} from "@/router/modules/mp";
import {detailRouters} from "@/router/modules/detail.ts";
import {adminRouters} from "@/router/modules/admin.ts";
// 引入路由

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      name: "首页",
      path: '/',
      alias: '/home',
      component: () => import('@/pages/home/home-index.vue'),
    },
    ...appRouters, ...adminRouters,
    ...mpRouters, ...mediaRouters, ...networkRouters, ...detailRouters
  ]
});

