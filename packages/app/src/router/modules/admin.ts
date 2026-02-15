import {type RouteRecordRaw} from "vue-router";

export const adminRouters: Array<RouteRecordRaw> = [{
  name: "管理后台",
  path: "/admin",
  redirect: '/admin/global-setting',
  component: () => import('@/layouts/LayoutAdmin.vue'),
  children: [{
    name: '全局设置',
    path: 'global-setting',
    component: () => import('@/pages/admin/global-setting/index.vue')
  }, {
    name: 'AI 设置',
    path: 'ai-setting',
    component: () => import('@/pages/admin/ai-setting/ai-setting.vue')
  }, {
    name: '用户设置',
    path: 'user-setting',
    component: () => import('@/pages/admin/user-setting/UserSetting.vue')
  }, {
    name: '开发者设置',
    path: 'dev-setting',
    component: () => import('@/pages/admin/dev-setting/dev-setting.vue')
  }, {
    name: 'MCP 设置',
    path: 'mcp-setting',
    component: () => import('@/pages/admin/mcp-setting/McpSetting.vue')
  }, {
    name: '面板设置',
    path: 'panel-setting',
    component: () => import('@/pages/admin/panel-setting/panel-setting.vue')
  }]
}]