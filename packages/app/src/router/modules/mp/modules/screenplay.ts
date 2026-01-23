import {type RouteRecordRaw} from "vue-router";

export const mpScreenplayRouter: RouteRecordRaw = {
  name: 'MpSp',
  path: '/mp/screenplay/:id',
  redirect: '/mp/screenplay/chapter',
  component: () => import('@/pages/mp/screenplay/MpScreenplay.vue'),
  children: [{
    name: 'MpSpChapter',
    path: 'chapter',
    component: () => import('@/pages/mp/screenplay/chapter/index.vue')
  }, {
    name: 'MpSpRole',
    path: 'role',
    component: () => import('@/pages/mp/screenplay/role/index.vue')
  }]
}