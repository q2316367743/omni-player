import {map} from "@/util";
import type {RouteRecordRaw} from "vue-router";
import {homeRouters} from "@/router/modules/home.ts";
import {memoRouters} from "@/router/modules/memo.ts";
import {subscribeRouters} from "@/router/modules/subscribe.ts";
import type {PluginDefine} from "@/global/PluginDefine.ts";
import {useAiRtSql, useMpSql} from "@/lib/sql.ts";
import type {CommonOption} from "@/global/CommonType.ts";

// - inner：内置工具
export type ToolItemTypeInner = 'inner';

/**
 * 类型
 * - plugin：第三方插件
 * - link: 网页链接
 * - exe：可执行文件
 * - script：脚本
 * - folder：文件夹
 * - file： 使用指定程序打开文件
 * - command：制定命令
 * - keyboard：模拟按键
 * -
 */
export type ToolItemTypeOuter = 'plugin' | 'link' | 'exe' | 'script' | 'folder' | 'file' | 'command' | 'keyboard';

export type ToolItemType = ToolItemTypeInner | ToolItemTypeOuter;

export type ToolItemPlatform =
  | 'linux'
  | 'macos'
  | 'ios'
  | 'freebsd'
  | 'dragonfly'
  | 'netbsd'
  | 'openbsd'
  | 'solaris'
  | 'android'
  | 'windows';

export const ToolItemPlatformLabels: Record<ToolItemPlatform, string> = {
  windows: 'Windows',
  macos: 'Mac OS',
  linux: 'Linux',
  freebsd: 'FreeBSD',
  dragonfly: 'Dragonfly',
  netbsd: 'NetBSD',
  openbsd: 'OpenBSD',
  solaris: 'Solaris',
  android: 'Android',
  ios: 'iOS',
};

export const ToolItemTypeOptions: Array<CommonOption<ToolItemTypeOuter>> = [
  {label: '第三方插件', value: 'plugin'},

  {label: '启动软件', value: 'exe'},
  {label: '打开文件', value: 'file'},
  {label: '打开文件夹', value: 'folder'},
  {label: '执行命令', value: 'command'},

  {label: '打开网址', value: 'link'},
  {label: '执行脚本', value: 'script'},
  {label: '模拟按键', value: 'keyboard'},
];

/**
 * 面板信息
 */
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
  // 创建时间
  createdAt?: number;
  desc?: string;
  platform?: Array<ToolItemPlatform>;
}

export interface ToolItemInner {
  disabled?: boolean;
  entry: () => Promise<{ default: Component }>;
  // 加载前完成
  onBeforeLoad?: () => Promise<void>;
  // 挂载前完成
  onBeforeMount?: () => Promise<void>;
  router?: Array<RouteRecordRaw>;
  param?: {
    [key: string]: any;
  };
}

export type ToolItemPlugin = PluginDefine;

export type ToolItemLinkOpenWith =
  | 'default'
  | 'edge'
  | 'chrome'
  | 'firefox'
  | 'safari'
  | 'tauri'
  | 'customer';

export interface ToolItemLink {
  url: string;
  openWith: ToolItemLinkOpenWith;
  program: string
}

export interface ToolItemExe {
  // 执行文件
  path: string;
}

export interface ToolItemScript {
  // 脚本所在位置
  path: string;
  // 使用的脚本解释器
  interpreter: string;
  // 执行的所在目录
  cwd: string;
}

export interface ToolItemFolder {
  // 文件夹路径
  path: string;
}

export interface ToolItemFile {
  // 文件路径
  path: string;
  // 使用的软件
  openWith: string;
}

export interface ToolItemCommand {
  // 命令
  command: string;
  // 执行命令的软件
  openWith: string;
  // 执行的所在目录
  cwd: string;
}

export interface ToolItemKeyboard {
  // 按键
  key: string
}

export interface ToolItemMap {
  inner: ToolItemInner;
  plugin: ToolItemPlugin;
  link: ToolItemLink;
  exe: ToolItemExe;
  script: ToolItemScript;
  folder: ToolItemFolder;
  file: ToolItemFile;
  command: ToolItemCommand;
  keyboard: ToolItemKeyboard;
}

export interface ToolItem<T extends ToolItemType = ToolItemType> extends ToolItemBase {
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

// 内置工具
export const DEFAULT_TOOLS: Array<ToolItem<ToolItemTypeInner>> = [
  {
    id: 'todo', label: '待办', icon: 'CheckRectangleIcon', desc: '井井有条',
    type: 'inner',
    payload: {
      entry: () => import("@/pages/app/todo/app-todo.vue"),
      onBeforeLoad: () => useMpSql().migrate()
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
      entry: () => import("@/pages/app/bookkeeping/app-bookkeeping.vue"),
      onBeforeLoad: () => useMpSql().migrate()
    }
  },
  {
    id: 'subscribe', label: '订阅', icon: 'MoneyIcon', desc: '',
    type: 'inner',
    payload: {
      entry: () => import("@/pages/subscribe/subscribe-home.vue"),
      router: subscribeRouters,
      onBeforeLoad: () => useMpSql().migrate()
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
      ],
    }
  },

  // AI 工具
  {
    id: 'ai/chat', label: '聊天', icon: 'ChatIcon',
    type: 'inner',
    payload: {
      entry: () => import("@/pages/app/ai/chat/ai-chat.vue"),
      onBeforeLoad: () => useAiRtSql().migrate(),
    }
  },
  {
    id: 'ai/roundtable', label: '圆桌会', icon: 'UsergroupIcon',
    type: 'inner',
    payload: {
      entry: () => import("@/pages/app/ai/roundtable/app-ai-roundtable.vue"),
      onBeforeLoad: () => useAiRtSql().migrate(),
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
      entry: () => import("@/pages/app/programmer/release/app-release.vue"),
      onBeforeLoad: () => useMpSql().migrate()
    }
  },
  {
    id: 'programmer/snippet', label: '代码片段', icon: 'Code1Icon',
    type: 'inner',
    payload: {
      entry: () => import("@/pages/app/programmer/snippet/app-snippet.vue"),
      onBeforeLoad: () => useMpSql().migrate()
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
