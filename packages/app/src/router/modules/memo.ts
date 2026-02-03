import {type RouteRecordRaw} from "vue-router";

export const memoRouters: Array<RouteRecordRaw> = [{
  name: "Memo",
  path: "/memo",
  component: () => import('@/pages/memo/MemoLayout.vue'),
  children: [
    {
      name: "MemoChat",
      path: "chat/:id",
      component: () => import('@/pages/memo/chat/MemoChatWrap.vue')
    },
    {
      name: "MemoSummary",
      path: "summary/:id",
      component: () => import('@/pages/memo/summary/MemoSummary.vue')
    },
  ]
}]