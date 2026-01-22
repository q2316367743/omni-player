import {type RouteRecordRaw} from "vue-router";

export const networkRouters: Array<RouteRecordRaw> = [{
  name: 'NetworkAggregation',
  path: '/network/aggregation',
  component: () => import('@/pages/network/aggregation/NetworkAggregation.vue')
}, {
  name: "网络服务",
  path: "/network",
  component: () => import('@/layouts/network.vue'),
  children: [{
    name: 'NetworkHome',
    path: ':id/home',
    component: () => import('@/pages/network/home/NetworkHome.vue')
  }, {
    name: 'NetworkSearch',
    path: ':id/search',
    component: () => import('@/pages/network/search/index.vue')
  }]
}]