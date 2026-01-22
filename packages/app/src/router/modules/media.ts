import {type RouteRecordRaw} from "vue-router";

export const mediaRouters: Array<RouteRecordRaw> = [{
  name: "媒体中心",
  path: "/media",
  component: () => import('@/layouts/media.vue'),
  children: [{
    name: 'MediaHome',
    path: ':id/home',
    component: () => import('@/pages/media/home/index.vue')
  }, {
    name: 'MediaMovie',
    path: ':id/movie',
    component: () => import('@/pages/media/movie/index.vue')
  }, {
    name: 'MediaSeries',
    path: ':id/series',
    component: () => import('@/pages/media/series/index.vue')
  }, {
    name: 'MediaCollection',
    path: ':id/collection',
    component: () => import('@/pages/media/collection/index.vue')
  }, {
    name: '媒体中心 - 影视详情',
    path: ':id/detail/:mediaId',
    component: () => import('@/pages/media/detail/index.vue')
  }, {
    name: '媒体中心 - 演员',
    path: ':id/person/:personId',
    component: () => import('@/pages/media/person/index.vue')
  }]
}]