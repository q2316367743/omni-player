import {type RouteRecordRaw} from "vue-router";

export const appRouters: Array<RouteRecordRaw> = [{
  name: "app",
  path: "/app",
  redirect: '/app/home',
  component: () => import('@/pages/app/index.vue'),
  children: [{
    name: 'AppProgrammer',
    path: 'programmer',
    component: () => import('@/pages/app/programmer/index.vue'),
    children: [{
      name: 'AppProgrammerRegex',
      path: 'regex',
      component: () => import('@/pages/app/programmer/regex/app-regex.vue')
    }, {
      name: 'AppProgrammerHttp',
      path: 'http',
      component: () => import('@/pages/app/programmer/http/app-http.vue')
    }, {
      name: 'AppProgrammerNginx',
      path: 'nginx',
      component: () => import('@/pages/app/programmer/nginx/app-nginx.vue')
    }, {
      name: 'AppProgrammerSnippet',
      path: 'snippet',
      component: () => import('@/pages/app/programmer/snippet/app-snippet.vue')
    }, {
      name: 'AppProgrammerRelease',
      path: 'release',
      component: () => import('@/pages/app/programmer/release/app-release.vue')
    }, {
      name: 'AppProgrammerCommand',
      path: 'command',
      component: () => import('@/pages/app/programmer/command/app-command.vue')
    }]
  }, {
    name: 'AppFanyi',
    path: 'fanyi',
    component: () => import('@/pages/app/fanyi/app-fanyi.vue')
  }, {
    name: 'AppQushuiyin',
    path: 'qushuiyin',
    component: () => import('@/pages/app/qushuiyin/app-qushuiyin.vue')
  }, {
    name: 'AppDailyHot',
    path: 'dailyhot',
    component: () => import('@/pages/app/dailyhot/app-dailyhot.vue')
  }, {
    name: "AppTodo",
    path: "todo",
    component: () => import('@/pages/app/todo/app-todo.vue')
  }, {
    name: "AppEditor",
    path: "editor",
    component: () => import('@/pages/app/editor/app-editor.vue')
  }, {
    name: "AppBookkeeping",
    path: "bookkeeping",
    component: () => import('@/pages/app/bookkeeping/app-bookkeeping.vue')
  }, {
    name: "AppSystem",
    path: "system",
    component: () => import('@/pages/app/system/index.vue'),
    children: [{
      name: "AppSystemPort",
      path: "port",
      component: () => import('@/pages/app/system/port/app-system-port.vue')
    }, {
      name: "AppSystemHomebrew",
      path: "homebrew",
      component: () => import("@/pages/app/system/homebrew/app-system-homebrew.vue")
    }]
  }, {
    name: "AppOnline",
    path: "online",
    component: () => import('@/pages/app/online/index.vue'),
    children: [{
      name: "AppOnlineImage",
      path: "image",
      component: () => import('@/pages/app/online/image/app-online-image.vue')
    }]
  }, {
    name: "AppAi",
    path: "ai",
    component: () => import('@/pages/app/ai/index.vue'),
    children: [{
      name: "AppAiChat",
      path: "chat",
      component: () => import('@/pages/app/ai/chat/ai-chat.vue')
    }, {
      name: "AppAiRoundtable",
      path: "roundtable",
      component: () => import('@/pages/app/ai/roundtable/app-ai-roundtable.vue')
    }]
  }]
}]