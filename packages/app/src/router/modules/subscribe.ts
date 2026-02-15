import {type RouteRecordRaw} from "vue-router";

// 直接只有详情页
export const subscribeRouters: Array<RouteRecordRaw> = [{
  name: "订阅列表",
  path: "/subscribe/:subscribeId",
  component: () => import('@/pages/subscribe/subscribe-home.vue'),
  children: [{
    name: '订阅内容',
    path: ':feedId',
    component: () => import('@/pages/subscribe/subscribe-info.vue')
  }]
}]