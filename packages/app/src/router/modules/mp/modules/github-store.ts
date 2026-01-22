import {type RouteRecordRaw} from "vue-router";

export const mpGithubStoreRouter: RouteRecordRaw = {
  name: 'MiniProgram',
  path: '/mp/github-store',
  redirect: '/mp/github-store/home',
  component: () => import('@/pages/mp/github-store/index.vue'),
  children: [{
    name: 'MpGsHome',
    path: 'home',
    component: () => import('@/pages/mp/github-store/home/index.vue')
  }, {
    name: 'MpGsSearch',
    path: 'search',
    component: () => import('@/pages/mp/github-store/search/index.vue')
  }, {
    name: 'MpGsCollect',
    path: 'collect',
    component: () => import('@/pages/mp/github-store/collect/index.vue')
  }, {
    name: 'MpGsDetail',
    path: 'detail/:id',
    component: () => import('@/pages/mp/github-store/detail/index.vue')
  }]
}