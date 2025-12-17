import {createRouter, createWebHashHistory} from 'vue-router';
// 引入路由

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [{
    name: "首页",
    path: '/',
    redirect: '/home',
    component: () => import('@/layouts/default.vue'),
    children: [
      {
        name: '主页',
        path: '/home',
        component: () => import('@/pages/home/index.vue')
      }
    ]
  }, {
    name: "管理后台",
    path: "/admin",
    redirect: '/admin/server',
    component: () => import('@/layouts/admin.vue'),
    children: [{
      name: '服务器管理',
      path: 'server',
      component: () => import('@/pages/admin/server/index.vue')
    }]
  }, {
    name: "媒体中心",
    path: "/media",
    component: () => import('@/layouts/media.vue'),
    children: [{
      name: 'MediaHome',
      path: ':id/home',
      component: () => import('@/pages/media/home/index.vue')
    },{
      name: '媒体中心 - 影视详情',
      path: ':id/detail/:mediaId',
      component: () => import('@/pages/media/detail/index.vue')
    },{
      name: '媒体中心 - 分类',
      path: ':id/category',
      component: () => import('@/pages/media/category/index.vue')
    },{
      name: '媒体中心 - 演员',
      path: ':id/person',
      component: () => import('@/pages/media/person/index.vue')
    }]
  }, {
    name: "网络服务",
    path: "/network",
    component: () => import('@/layouts/network.vue'),
    children: [{
      name: 'NetworkHome',
      path: ':id/home',
      component: () => import('@/pages/network/home/NetworkHome.vue')
    },{
      name: '网络服务 - 影视详情',
      path: ':id/detail/:mediaId',
      component: () => import('@/pages/network/detail/index.vue')
    },{
      name: '网络服务 - 分类',
      path: ':id/video',
      component: () => import('@/pages/network/video/index.vue')
    },{
      name: '网络服务 - 搜索',
      path: ':id/search',
      component: () => import('@/pages/network/search/index.vue')
    }]
  }]
});

