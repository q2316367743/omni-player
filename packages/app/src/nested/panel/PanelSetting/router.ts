import {createRouter, createWebHashHistory} from "vue-router";
import {adminRouters} from "@/router/modules/admin.ts";

// 创建路由实例
export const settingMainRouter = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      redirect: '/admin/global-setting'
    },
    ...adminRouters
  ],
});

export const settingAddRouter = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      component: () => import("@/nested/panel/PanelSetting/PanelAdd/PanelAdd.vue")
    },
  ],
});