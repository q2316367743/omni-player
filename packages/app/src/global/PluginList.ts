import {map} from "@/util";
import type {RouteRecordRaw} from "vue-router";
import {homeRouters} from "@/router/modules/home.ts";
import {memoRouters} from "@/router/modules/memo.ts";
import {subscribeRouters} from "@/router/modules/subscribe.ts";
import type {PluginDefine} from "@/global/PluginDefine.ts";
import type {PluginEntity} from "@/entity/PluginEntity.ts";

export type ToolItemTypeInner = 'inner';

export type ToolItemTypeOuter = 'plugin' | 'link' | 'exe' | 'script' | 'folder' | 'file';

/**
 * 类型
 * - inner：内置工具
 * - plugin：第三方插件
 * - link: 网页链接
 * - exe：可执行文件
 * - script：脚本
 * - folder：文件夹
 * - file： 使用指定程序打开文件
 */
export type ToolItemType = ToolItemTypeInner | ToolItemTypeOuter;

export type ToolItemPlatform = 'win32' | 'macos' | 'linux';

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
  platform?: Array<ToolItemPlatform>;
}

export interface ToolItemInner {
  disabled?: boolean;
  entry: () => Promise<{ default: Component }>;
  router?: Array<RouteRecordRaw>;
  param?: {
    [key: string]: any;
  };
}

export type ToolItemPlugin = PluginDefine;

export interface ToolItemLink {
  url: string;
  openWith: string;
}

export interface ToolItemExe {
  path: string;
}

export interface ToolItemScript {
  path: string;
}

export interface ToolItemFolder {
  path: string;
}

export interface ToolItemFile {
  path: string;
  openWith: string;
}

export interface ToolItemMap {
  inner: ToolItemInner;
  plugin: ToolItemPlugin;
  link: ToolItemLink;
  exe: ToolItemExe;
  script: ToolItemScript;
  folder: ToolItemFolder;
  file: ToolItemFile
}

export interface ToolItem<T extends ToolItemType> extends ToolItemBase {
  type: T;
  payload: ToolItemMap[T];
}


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

export const DEFAULT_TOOLS: Array<ToolItem<ToolItemTypeInner>> = [
  {
    id: 'todo', label: '待办', icon: 'CheckRectangleIcon', desc: '井井有条',
    type: 'inner',
    payload: {
      entry: () => import("@/pages/app/todo/app-todo.vue")
    }
  },
  {
    id: 'editor', label: '笔记', icon: 'Edit1Icon', desc: '妙笔生花',
    type: 'inner',
    payload: {
      entry: () => import("@/pages/app/editor/app-editor.vue")
    }
  },
  {
    id: 'bookkeeping', label: '记账', icon: 'MoneyIcon', desc: '精打细算',
    type: 'inner',
    payload: {
      entry: () => import("@/pages/app/bookkeeping/app-bookkeeping.vue")
    }
  },
  {
    id: 'subscribe', label: '订阅', icon: 'MoneyIcon', desc: '',
    type: 'inner',
    payload: {
      entry: () => import("@/pages/subscribe/subscribe-home.vue"),
      router: subscribeRouters,
    }
  },
  {
    id: 'memo', label: '聊愈室', icon: 'MoneyIcon', desc: '',
    type: 'inner',
    payload: {
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
    }
  },

  // AI 工具
  {
    id: 'ai/chat', label: '聊天', icon: 'ChatIcon',
    type: 'inner',
    payload: {
      entry: () => import("@/pages/app/ai/chat/ai-chat.vue")
    }
  },
  {
    id: 'ai/roundtable', label: '圆桌会', icon: 'UsergroupIcon',
    type: 'inner',
    payload: {
      entry: () => import("@/pages/app/ai/roundtable/app-ai-roundtable.vue")
    }
  },

  // 程序员套件
  {
    id: 'programmer/regex', label: '正则表达式', icon: 'CodeIcon',
    type: 'inner',
    payload: {
      entry: () => import("@/pages/app/programmer/regex/app-regex.vue")
    }
  },
  {
    id: 'programmer/http', label: '简单请求', icon: 'InternetIcon',
    type: 'inner',
    payload: {
      entry: () => import("@/pages/app/programmer/http/app-http.vue")
    }
  },
  {
    id: 'programmer/nginx', label: 'nginx', icon: 'InternetIcon',
    type: 'inner',
    payload: {
      entry: () => import("@/pages/app/programmer/nginx/app-nginx.vue")
    }
  },
  {
    id: 'programmer/release', label: '发版助手', icon: 'GitMergeIcon',
    type: 'inner',
    payload: {
      entry: () => import("@/pages/app/programmer/release/app-release.vue")
    }
  },
  {
    id: 'programmer/snippet', label: '代码片段', icon: 'Code1Icon',
    type: 'inner',
    payload: {
      entry: () => import("@/pages/app/programmer/snippet/app-snippet.vue")
    }
  },
  {
    id: 'programmer/command',
    label: '命令助手',
    icon: 'CommandIcon',
    type: 'inner',
    payload: {
      disabled: true,
      entry: () => import("@/pages/app/programmer/command/app-command.vue")
    }
  },

  // 在线工具
  {
    id: 'fanyi', label: '在线翻译', icon: 'TranslateIcon', desc: '在线双向翻译',
    type: 'inner',
    payload: {
      entry: () => import("@/pages/app/fanyi/app-fanyi.vue")
    }
  },
  {
    id: 'dailyhot',
    label: '今日热搜',
    icon: 'ArticleIcon',
    desc: '查看各大榜单的今日热榜排行',
    type: 'inner',
    payload: {
      entry: () => import("@/pages/app/dailyhot/app-dailyhot.vue")
    }
  },
  {
    id: 'qushuiyin',
    label: '去水印',
    icon: 'VideoIcon',
    desc: '视频图片水印去除',
    type: 'inner',
    payload: {
      disabled: true,
      entry: () => import("@/pages/app/qushuiyin/app-qushuiyin.vue")
    }
  },
  {
    id: 'online/image',
    label: '随机图片',
    icon: 'ImageIcon',
    desc: '随机图片',
    type: 'inner',
    payload: {
      disabled: true,
      entry: () => import("@/pages/app/online/image/app-online-image.vue")
    }
  },

  // 系统工具
  {
    id: 'system/port', label: '端口扫描', icon: 'PortraitIcon',
    type: 'inner',
    payload: {
      entry: () => import("@/pages/app/system/port/app-system-port.vue")
    }
  },
  {
    id: 'system/homebrew',
    label: 'Homebrew',
    icon: 'HomebrewIcon',
    platform: ['macos', 'linux'],
    type: 'inner',
    payload: {
      entry: () => import("@/pages/app/system/homebrew/app-system-homebrew.vue")
    }
  },
];

export const TOOL_MAP = map(DEFAULT_TOOLS, 'id');

export function pluginEntityToOuter(plugin: PluginEntity): ToolItem<ToolItemTypeOuter> {
  return {
    ...plugin,
    platform: plugin.platform.split(",") as Array<ToolItemPlatform>,
    payload: JSON.parse(plugin.payload),
    type: plugin.type as ToolItemTypeOuter
  }
}
