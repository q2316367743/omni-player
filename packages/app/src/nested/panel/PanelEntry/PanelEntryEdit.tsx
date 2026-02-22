import Ctx from "@imengyu/vue3-context-menu";
import {isDark} from "@/global/Constants.ts";
import {
  AddIcon,
  AppIcon, CodeIcon,
  CommandIcon,
  DeleteIcon, EditIcon,
  FileIcon,
  FolderIcon,
  InternetIcon, KeyboardIcon,
  Share1Icon, TextboxIcon
} from "tdesign-icons-vue-next";
import {useToolVisibleStore} from "@/store/ToolVisibleStore.ts";
import {openPopupAdd, openPopupEdit} from "@/lib/windows.ts";
import type {ToolItem} from "@/global/PluginList.ts";

export const openMainContext = async (tool: ToolItem | undefined | null, row: number, col: number, e: PointerEvent) => {
  e.preventDefault();
  e.stopPropagation();

  if (!tool) return;

  Ctx.showContextMenu({
    x: e.x,
    y: e.y,
    theme: isDark.value ? 'mac dark' : 'mac',
    items: [
      ...(tool.type === 'inner' ? [] : [{
        label: '编辑',
        icon: () => <EditIcon />,
        onClick: () => openPopupEdit(tool.id, '', row, col)
      }]),
      {
      label: () => <span class={'label color-red'}>删除</span>,
      icon: () => <DeleteIcon class={'color-red'}/>,
      onClick: () => {
        const toolStore = useToolVisibleStore();
        toolStore.setMainGridTool(row, col, null);
      }
    }]
  })
}

/**
 * 打开插件新增上下文菜单
 * @param e 鼠标事件
 * @param panel 所选面板
 * @param x 所选位置横坐标
 * @param y 所选位置纵坐标
 */
export const openPluginAdd = async (
  e: PointerEvent, panel: '', x: number, y: number) => {
  e.preventDefault();
  e.stopPropagation();
  Ctx.showContextMenu({
    x: e.x,
    y: e.y,
    theme: isDark.value ? 'mac dark' : 'mac',
    items: [
      {
        label: '新增内置插件',
        icon: () => <AddIcon/>,
        onClick: () => openPopupAdd('inner', panel, x, y)
      },
      {
        label: '新增第三方插件',
        icon: () => <Share1Icon/>,
        divided: 'down',
        onClick: () => openPopupAdd('plugin', panel, x, y)
      },
      {
        label: '启动软件',
        icon: () => <AppIcon/>,
        onClick: () => openPopupAdd('exe', panel, x, y)
      },
      {
        label: '打开文件',
        icon: () => <FileIcon/>,
        onClick: () => openPopupAdd('file', panel, x, y)
      },
      {
        label: '打开文件夹',
        icon: () => <FolderIcon/>,
        onClick: () => openPopupAdd('folder', panel, x, y)
      },
      {
        label: '运行命令',
        icon: () => <CommandIcon/>,
        divided: 'down',
        onClick: () => openPopupAdd('command', panel, x, y)
      },
      {
        label: '打开网址',
        icon: () => <InternetIcon/>,
        onClick: () => openPopupAdd('link', panel, x, y)
      },
      {
        label: '模拟按键',
        icon: () => <KeyboardIcon/>,
        onClick: () => openPopupAdd('keyboard', panel, x, y)
      },
      {
        label: '发送文本',
        icon: () => <TextboxIcon/>
      },
      {
        label: '执行脚本',
        icon: () => <CodeIcon/>,
        onClick: () => openPopupAdd('script', panel, x, y)
      },
    ]
  })
}