// ============================================
// 类型定义
// ============================================

import {map} from "@/util";
import type {RouteRecordRaw} from "vue-router";
import {homeRouters} from "@/router/modules/home.ts";
import {memoRouters} from "@/router/modules/memo.ts";
import {subscribeRouters} from "@/router/modules/subscribe.ts";
import type {PluginDefine} from "@/global/PluginDefine.ts";
import type {PluginEntityView} from "@/entity/PluginEntity.ts";

export interface PanelConfig {
  id: string;
  label: string;
  order: number;
  visible: boolean;
}

interface ToolItemBase {
  id: string;
  label: string;
  icon: string;
  desc?: string;
  platform?: string[];
  type: 'inner' | 'outer'
}

export interface ToolItemInner extends ToolItemBase{
  type: 'inner'
  disabled?: boolean;
  platform?: string[];
  entry: () => Promise<{ default: Component }>;
  router?: Array<RouteRecordRaw>;
  param?: {
    [key: string]: any;
  };
}

export interface ToolItemOuter extends ToolItemBase{
  type: 'outer';
  url: string;
  define: PluginDefine;
}

export type ToolItem = ToolItemInner | ToolItemOuter;

export type ToolGrid = (string | null)[][];

// ============================================
// 默认数据
// ============================================

export const DEFAULT_PANELS: PanelConfig[] = [
  {id: 'ai', label: 'AI 工具', order: 0, visible: true},
  {id: 'programmer', label: '程序员套件', order: 1, visible: true},
  {id: 'online', label: '在线工具', order: 2, visible: true},
  {id: 'system', label: '系统工具', order: 3, visible: true},
];

export const DEFAULT_TOOLS: ToolItem[] = [
  {
    id: 'todo', label: '待办', icon: 'CheckRectangleIcon', desc: '井井有条',
    type: 'inner',
    entry: () => import("@/pages/app/todo/app-todo.vue")
  },
  {
    id: 'editor', label: '笔记', icon: 'Edit1Icon', desc: '妙笔生花',
    type: 'inner',
    entry: () => import("@/pages/app/editor/app-editor.vue")
  },
  {
    id: 'bookkeeping', label: '记账', icon: 'MoneyIcon', desc: '精打细算',
    type: 'inner',
    entry: () => import("@/pages/app/bookkeeping/app-bookkeeping.vue")
  },
  {
    id: 'subscribe', label: '订阅', icon: 'MoneyIcon', desc: '',
    type: 'inner',
    entry: () => import("@/pages/subscribe/subscribe-home.vue"),
    router: subscribeRouters
  },
  {
    id: 'memo', label: '聊愈室', icon: 'MoneyIcon', desc: '',
    type: 'inner',
    entry: () => import("@/pages/home/HomeIndex.vue"),
    router: [
      {
        name: "首页",
        path: '/',
        redirect: '/home/chat',
      },
      ...homeRouters,
      ...memoRouters
    ]
  },

  // AI 工具
  {
    id: 'ai/chat', label: '聊天', icon: 'ChatIcon',
    type: 'inner',
    entry: () => import("@/pages/app/ai/chat/ai-chat.vue")
  },
  {
    id: 'ai/roundtable', label: '圆桌会', icon: 'UsergroupIcon',
    type: 'inner',
    entry: () => import("@/pages/app/ai/roundtable/app-ai-roundtable.vue")
  },

  // 程序员套件
  {
    id: 'programmer/regex', label: '正则表达式', icon: 'CodeIcon',
    type: 'inner',
    entry: () => import("@/pages/app/programmer/regex/app-regex.vue")
  },
  {
    id: 'programmer/http', label: '简单请求', icon: 'InternetIcon',
    type: 'inner',
    entry: () => import("@/pages/app/programmer/http/app-http.vue")
  },
  {
    id: 'programmer/nginx', label: 'nginx', icon: 'InternetIcon',
    type: 'inner',
    entry: () => import("@/pages/app/programmer/nginx/app-nginx.vue")
  },
  {
    id: 'programmer/release', label: '发版助手', icon: 'GitMergeIcon',
    type: 'inner',
    entry: () => import("@/pages/app/programmer/release/app-release.vue")
  },
  {
    id: 'programmer/snippet', label: '代码片段', icon: 'Code1Icon',
    type: 'inner',
    entry: () => import("@/pages/app/programmer/snippet/app-snippet.vue")
  },
  {
    id: 'programmer/command',
    label: '命令助手',
    icon: 'CommandIcon',
    disabled: true,
    type: 'inner',
    entry: () => import("@/pages/app/programmer/command/app-command.vue")
  },

  // 在线工具
  {
    id: 'fanyi', label: '在线翻译', icon: 'TranslateIcon', desc: '在线双向翻译',
    type: 'inner',
    entry: () => import("@/pages/app/fanyi/app-fanyi.vue")
  },
  {
    id: 'dailyhot',
    label: '今日热搜',
    icon: 'ArticleIcon',
    desc: '查看各大榜单的今日热榜排行',
    type: 'inner',
    entry: () => import("@/pages/app/dailyhot/app-dailyhot.vue")
  },
  {
    id: 'qushuiyin',
    label: '去水印',
    icon: 'VideoIcon',
    disabled: true,
    desc: '视频图片水印去除',
    type: 'inner',
    entry: () => import("@/pages/app/qushuiyin/app-qushuiyin.vue")
  },
  {
    id: 'online/image',
    label: '随机图片',
    icon: 'ImageIcon',
    disabled: true,
    desc: '随机图片',
    type: 'inner',
    entry: () => import("@/pages/app/online/image/app-online-image.vue")
  },

  // 系统工具
  {
    id: 'system/port', label: '端口扫描', icon: 'PortraitIcon',
    type: 'inner',
    entry: () => import("@/pages/app/system/port/app-system-port.vue")
  },
  {
    id: 'system/homebrew',
    label: 'Homebrew',
    icon: 'HomebrewIcon',
    platform: ['macos', 'linux'],
    type: 'inner',
    entry: () => import("@/pages/app/system/homebrew/app-system-homebrew.vue")
  },
];

export const TOOL_MAP = map(DEFAULT_TOOLS, 'id');

export function pluginEntityToOuter(plugin: PluginEntityView): ToolItemOuter {
  return {
    id: plugin.identifier,
    label: plugin.name,
    icon: plugin.define.window?.icon || '',
    desc: plugin.define.description || '',
    type: 'outer',
    define: plugin.define,
    url: plugin.main
  }
}
