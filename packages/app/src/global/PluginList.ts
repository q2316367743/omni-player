// ============================================
// 类型定义
// ============================================

import {map} from "@/util";
import type {RouteRecordRaw} from "vue-router";
import {homeRouters} from "@/router/modules/home.ts";
import {memoRouters} from "@/router/modules/memo.ts";
import {subscribeRouters} from "@/router/modules/subscribe.ts";

export type ToolCategory = 'productivity' | 'ai' | 'programmer' | 'online' | 'system';

export interface CategoryConfig {
  id: ToolCategory;
  label: string;
  order: number;
  visible: boolean;
}

export interface ToolItem {
  id: string;
  label: string;
  category: ToolCategory;
  icon: string;
  tone: string;
  desc?: string;
  disabled?: boolean;
  platform?: string[];
  entry: () => Promise<{ default: Component }>;
  router?: Array<RouteRecordRaw>;
  // 参数
  param?: {
    [key: string]: any;
  };
}

export type ToolGrid = (string | null)[][];

export interface ToolPanelConfig {
  categories: CategoryConfig[];
  mainGrid: ToolGrid;
  subGrids: Record<ToolCategory, ToolGrid>;
  version: number;
}

// ============================================
// 默认数据
// ============================================

export const DEFAULT_CATEGORIES: CategoryConfig[] = [
  {id: 'productivity', label: '程序员三件套', order: 0, visible: true},
  {id: 'ai', label: 'AI 工具', order: 1, visible: true},
  {id: 'programmer', label: '程序员套件', order: 2, visible: true},
  {id: 'online', label: '在线工具', order: 3, visible: true},
  {id: 'system', label: '系统工具', order: 4, visible: true},
];

export const DEFAULT_TOOLS: ToolItem[] = [
  // 全局
  {
    id: 'todo', label: '待办', category: 'productivity', icon: 'CheckRectangleIcon', tone: 'media', desc: '井井有条',
    entry: () => import("@/pages/app/todo/app-todo.vue")
  },
  {
    id: 'editor', label: '笔记', category: 'productivity', icon: 'Edit1Icon', tone: 'media', desc: '妙笔生花',
    entry: () => import("@/pages/app/editor/app-editor.vue")
  },
  {
    id: 'bookkeeping', label: '记账', category: 'productivity', icon: 'MoneyIcon', tone: 'media', desc: '精打细算',
    entry: () => import("@/pages/app/bookkeeping/app-bookkeeping.vue")
  },
  {
    id: 'subscribe', label: ' 订阅', category: 'productivity', icon: 'MoneyIcon', tone: 'media', desc: '',
    entry: () => import("@/pages/subscribe/subscribe-home.vue"),
    router: subscribeRouters
  },
  {
    id: 'memo', label: '聊愈室', category: 'productivity', icon: 'MoneyIcon', tone: 'media', desc: '',
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
    id: 'ai/chat', label: '聊天', category: 'ai', icon: 'ChatIcon', tone: 'ai',
    entry: () => import("@/pages/app/ai/chat/ai-chat.vue")
  },
  {
    id: 'ai/roundtable', label: '圆桌会', category: 'ai', icon: 'UsergroupIcon', tone: 'ai',
    entry: () => import("@/pages/app/ai/roundtable/app-ai-roundtable.vue")
  },

  // 程序员套件
  {
    id: 'programmer/regex', label: '正则表达式', category: 'programmer', icon: 'CodeIcon', tone: 'regex',
    entry: () => import("@/pages/app/programmer/regex/app-regex.vue")
  },
  {
    id: 'programmer/http', label: '简单请求', category: 'programmer', icon: 'InternetIcon', tone: 'regex',
    entry: () => import("@/pages/app/programmer/http/app-http.vue")
  },
  {
    id: 'programmer/nginx', label: 'nginx', category: 'programmer', icon: 'InternetIcon', tone: 'regex',
    entry: () => import("@/pages/app/programmer/nginx/app-nginx.vue")
  },
  {
    id: 'programmer/release', label: '发版助手', category: 'programmer', icon: 'GitMergeIcon', tone: 'regex',
    entry: () => import("@/pages/app/programmer/release/app-release.vue")
  },
  {
    id: 'programmer/snippet', label: '代码片段', category: 'programmer', icon: 'Code1Icon', tone: 'regex',
    entry: () => import("@/pages/app/programmer/snippet/app-snippet.vue")
  },
  {
    id: 'programmer/command',
    label: '命令助手',
    category: 'programmer',
    icon: 'CommandIcon',
    tone: 'disabled',
    disabled: true,
    entry: () => import("@/pages/app/programmer/command/app-command.vue")
  },

  // 在线工具
  {
    id: 'fanyi', label: '在线翻译', category: 'online', icon: 'TranslateIcon', tone: 'online', desc: '在线双向翻译',
    entry: () => import("@/pages/app/fanyi/app-fanyi.vue")
  },
  {
    id: 'dailyhot',
    label: '今日热搜',
    category: 'online',
    icon: 'ArticleIcon',
    tone: 'online',
    desc: '查看各大榜单的今日热榜排行',
    entry: () => import("@/pages/app/dailyhot/app-dailyhot.vue")
  },
  {
    id: 'qushuiyin',
    label: '去水印',
    category: 'online',
    icon: 'VideoIcon',
    tone: 'disabled',
    disabled: true,
    desc: '视频图片水印去除',
    entry: () => import("@/pages/app/qushuiyin/app-qushuiyin.vue")
  },
  {
    id: 'online/image',
    label: '随机图片',
    category: 'online',
    icon: 'ImageIcon',
    tone: 'disabled',
    disabled: true,
    desc: '随机图片',
    entry: () => import("@/pages/app/online/image/app-online-image.vue")
  },

  // 系统工具
  {
    id: 'system/port', label: '端口扫描', category: 'system', icon: 'PortraitIcon', tone: 'todo',
    entry: () => import("@/pages/app/system/port/app-system-port.vue")
  },
  {
    id: 'system/homebrew',
    label: 'Homebrew',
    category: 'system',
    icon: 'HomebrewIcon',
    tone: 'todo',
    platform: ['macos', 'linux'],
    entry: () => import("@/pages/app/system/homebrew/app-system-homebrew.vue")
  },
];

export const TOOL_MAP= map(DEFAULT_TOOLS, 'id');