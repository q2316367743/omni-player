import {type RouteRecordRaw} from "vue-router";

export const adminRouters: Array<RouteRecordRaw> = [{
  name: "管理后台",
  path: "/admin",
  redirect: '/admin/global-setting',
  component: () => import('@/layouts/admin.vue'),
  children: [{
    name: '全局设置',
    path: 'global-setting',
    component: () => import('@/pages/admin/global-setting/index.vue')
  }, {
    name: 'AI 设置',
    path: 'ai-setting',
    component: () => import('@/pages/admin/ai-setting/ai-setting.vue')
  }]
}]