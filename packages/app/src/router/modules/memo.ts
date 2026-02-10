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
      name: "MemoSummarySession",
      path: "summary/session/:id",
      component: () => import('@/pages/memo/summary/MemoSummarySession.vue')
    },
    {
      name: "MemoSummaryChat",
      path: "summary/chat/:id",
      component: () => import('@/pages/memo/summary/MemoSummaryChat.vue')
    },
  ]
}]