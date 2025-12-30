import {defineStore} from "pinia";
import type {SubscribeItem} from "@/entity/subscribe";
import {listSubscribe} from "@/services";
import {LocalName} from "@/global/LocalName.ts";
import {useSql} from "@/lib/sql.ts";
import {TableName} from "@/global/TableName.ts";

export interface TreeNode {
  id: string;
  name: string;
  icon: string;
  type: 'folder' | 'item';
  path: string;
  children?: TreeNode[];
  data?: SubscribeItem;
  expanded?: boolean;
  count?: number;
  unRead: boolean;
}

export const useSubscribeStore = defineStore('subscribe', () => {
  const subscribes = ref<Array<SubscribeItem>>([]);
  const folderExpandedMap = useLocalStorage<Record<string, boolean>>(LocalName.STORE_SUBSCRIBE_COLLAPSED, {});

  const refresh = () => {
    listSubscribe().then(res => {
      subscribes.value = res;
    });
  }
  refresh();

  const toggleFolderExpanded = (path: string) => {
    const current = folderExpandedMap.value[path] ?? true;
    folderExpandedMap.value[path] = !current;
  };

  const subscribeTree = computed(() => {
    const tree: TreeNode[] = [];
    const folderMap = new Map<string, TreeNode>();

    const calculateCount = (node: TreeNode): number => {
      if (node.type === 'item') {
        const count = node.data?.count || 0;
        node.count = count;
        return count;
      }
      if (node.type === 'folder' && node.children) {
        const count = node.children.reduce((sum, child) => sum + calculateCount(child), 0);
        node.count = count;
        return count;
      }
      return 0;
    };

    const getOrCreateFolder = (path: string): TreeNode | null => {
      if (!path) return null;

      const existing = folderMap.get(path);
      if (existing) {
        return existing;
      }

      const parts = path.split('/');
      const name = parts[parts.length - 1] || '';
      const parentPath = parts.slice(0, -1).join('/') || '';

      const node: TreeNode = {
        id: `folder-${path}`,
        name: name,
        type: 'folder',
        path: path,
        children: [],
        expanded: folderExpandedMap.value[path] ?? true,
        icon: '',
        unRead: false
      };

      folderMap.set(path, node);

      if (parentPath) {
        const parent = getOrCreateFolder(parentPath);
        if (parent) {
          if (parent.children) {
            parent.children.push(node);
          }
        } else {
          tree.push(node);
        }
      } else {
        tree.push(node);
      }

      return node;
    };

    subscribes.value.forEach(item => {
      if (item.folder) {
        const folder = getOrCreateFolder(item.folder);
        if (folder && folder.children) {
          folder.children.push({
            id: item.id,
            name: item.name,
            type: 'item',
            path: item.folder,
            data: item,
            icon: item.icon,
            unRead: item.un_read_count > 0
          });
        }
      } else {
        tree.push({
          id: item.id,
          name: item.name,
          type: 'item',
          path: '',
          data: item,
          icon: item.icon,
          unRead: item.un_read_count > 0
        });
      }
    });

    tree.forEach(node => calculateCount(node));

    return tree;
  });

  const read = async (id: string) => {
    const mapper = await useSql().mapper<SubscribeItem>(TableName.SUBSCRIBE_ITEM);
    await mapper.updateById(id, {
      un_read_count: 0
    });
    refresh();
  }

  return {
    subscribes,
    subscribeTree,
    refresh,
    toggleFolderExpanded,
    read
  }

})