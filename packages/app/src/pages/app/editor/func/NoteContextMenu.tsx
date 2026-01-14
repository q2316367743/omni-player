import {DialogPlugin} from "tdesign-vue-next";
import {EditIcon, DeleteIcon, InfoCircleIcon, FolderAddIcon} from "tdesign-icons-vue-next";
import {isDark} from "@/global/Constants.ts";
import type {NoteNode} from "./noteFs.ts";
import MessageBoxUtil from "@/util/model/MessageBoxUtil.tsx";
import Cxt from '@imengyu/vue3-context-menu';

export async function openNoteContextMenu(node: NoteNode, event: PointerEvent, callbacks: {
  onDelete?: () => void;
  onRename?: (newName: string) => void;
  onRefresh?: () => void;
  onNewArticle?: (path: string, name: string) => void;
  onNewFolder?: (path: string, name: string) => void;
  onSelect?: (path: string) => void;
}) {
  event.preventDefault();
  event.stopPropagation();


  const menuItems: any[] = [];

  if (node.type === 'folder') {
    menuItems.push({
      label: '新建笔记',
      icon: () => <EditIcon/>,
      onClick: async () => {
        MessageBoxUtil.prompt('请输入笔记名称', '新建笔记').then(name => {
          if (name && name.trim()) {
            callbacks.onNewArticle?.(node.path, name.trim());
          }
        })
      }
    });

    menuItems.push({
      label: '新建文件夹',
      icon: () => <FolderAddIcon/>,
      onClick: async () => {
        MessageBoxUtil.prompt('请输入文件夹名称', '新建文件夹').then(name => {
          if (name && name.trim()) {
            callbacks.onNewFolder?.(node.path, name.trim());
          }
        })
      }
    });
  }

  menuItems.push({
    label: '重命名',
    icon: () => <EditIcon/>,
    onClick: async () => {
      MessageBoxUtil.prompt('请输入新名称', '重命名', {
        inputValue: node.name
      }).then(newName => {
        if (newName && newName.trim() && newName.trim() !== node.name) {
          callbacks.onRename?.(newName.trim());
        }
      })
    }
  });

  menuItems.push({
    label: () => <span style={{color: 'var(--td-error-color)'}} class={'label'}>删除</span>,
    icon: () => <DeleteIcon style={{color: 'var(--td-error-color)'}}/>,
    onClick: async () => {
      MessageBoxUtil.confirm(`确定要删除"${node.name}"吗？此操作不可恢复。`, '确认删除').then(() => {
        callbacks.onDelete?.()
      });
    }
  });

  menuItems.push({
    label: '属性',
    icon: () => <InfoCircleIcon/>,
    onClick: async () => {
      const info = node.type === 'article'
        ? `类型: 笔记\n名称: ${node.name}\n路径: ${node.path}`
        : `类型: 文件夹\n名称: ${node.name}\n路径: ${node.path}`;

      const dp = DialogPlugin({
        header: '属性',
        body: () => <div style={{whiteSpace: 'pre-wrap', lineHeight: '1.8'}}>{info}</div>,
        confirmBtn: '关闭',
        width: '500px',
        onConfirm: () => {
          dp.destroy?.();
        }
      });
    }
  });

  Cxt.showContextMenu({
    x: event.x,
    y: event.y,
    theme: isDark.value ? 'mac dark' : 'mac',
    items: menuItems
  });
}
