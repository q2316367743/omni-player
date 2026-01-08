import {createRouter, createWebHashHistory} from 'vue-router';
// 引入路由

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [{
    name: "首页",
    path: '/',
    alias: '/home',
    component: () => import('@/pages/home/home-index.vue'),
  }, {
    name: 'NetworkAggregation',
    path: '/network/aggregation',
    component: () => import('@/pages/network/aggregation/NetworkAggregation.vue')
  }, {
    name: '网络服务 - 影视详情',
    path: '/network/:id/detail/:mediaId',
    component: () => import('@/pages/network/detail/index.vue')
  }, {
    name: "管理后台",
    path: "/admin",
    redirect: '/admin/global-setting',
    component: () => import('@/layouts/admin.vue'),
    children: [{
      name: '管理后台-全局设置',
      path: 'global-setting',
      component: () => import('@/pages/admin/global-setting/index.vue')
    }]
  }, {
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
  }, {
    name: "订阅列表",
    path: "/subscribe/:subscribeId",
    component: () => import('@/pages/subscribe/subscribe-home.vue'),
    children: [{
      name: '订阅内容',
      path: ':feedId',
      component: () => import('@/pages/subscribe/subscribe-info.vue')
    }]
  }, {
    name: "app",
    path: "/app/tool",
    redirect: '/app/tool/home',
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
      },{
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
    }]
  }]
});

