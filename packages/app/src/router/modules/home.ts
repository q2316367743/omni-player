import {type RouteRecordRaw} from "vue-router";

export const homeRouters: Array<RouteRecordRaw> = [{
  name: "主页",
  path: "/home",
  redirect: '/home/chat',
  component: () => import('@/pages/home/index.vue'),
  children: [{
    name: 'HomeChat',
    path: 'chat',
    component: () => import('@/pages/home/chat/ChatPage.vue')
  },{
    name: 'HomeMemo',
    path: 'memo',
    component: () => import('@/pages/home/memo/MemoHome.vue')
  },{
    name: 'HomeFriend',
    path: 'friend',
    component: () => import('@/pages/home/friend/FriendPage.vue')
  },{
    name: 'HomeMemory',
    path: 'memory',
    component: () => import('@/pages/home/memory/MemoryPage.vue')
  },{
    name: 'HomeMoment',
    path: 'moment',
    component: () => import('@/pages/home/moment/MomentsPage.vue')
  },{
    name: 'MemoDiary',
    path: 'diary',
    component: () => import('@/pages/home/diary/DiaryPage.vue')
  },{
    name: 'MemoTool',
    path: 'tool',
    component: () => import('@/pages/home/tool/ToolsPage.vue')
  }]
}]