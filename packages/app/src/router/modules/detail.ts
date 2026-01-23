import {type RouteRecordRaw} from "vue-router";

// 直接只有详情页
export const detailRouters: Array<RouteRecordRaw> = [{
  name: "订阅列表",
  path: "/subscribe/:subscribeId",
  component: () => import('@/pages/subscribe/subscribe-home.vue'),
  children: [{
    name: '订阅内容',
    path: ':feedId',
    component: () => import('@/pages/subscribe/subscribe-info.vue')
  }]
}, {
  name: "Fiction",
  path: "/fiction",
  component: () => import('@/pages/fiction/ai-fiction.vue'),
  children: [{
    name: "FictionHome",
    path: "home/:id",
    component: () => import('@/pages/fiction/home/index.vue')
  }]
}, {
  name: "Screenplay",
  path: "/screenplay/:id",
  component: () => import("@/pages/mp/screenplay/chapter/screenplay-index.vue")
}]