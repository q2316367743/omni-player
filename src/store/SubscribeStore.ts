import {defineStore} from "pinia";
import type {SubscribeItem} from "@/entity/subscribe";
import {listSubscribe} from "@/services";

export interface TreeNode {
  id: string;
  name: string;
  type: 'folder' | 'item';
  path: string;
  children?: TreeNode[];
  data?: SubscribeItem;
  expanded?: boolean;
  count?: number;
}

export const useSubscribeStore = defineStore('subscribe', () => {
  const subscribes = ref<Array<SubscribeItem>>([]);

  const refresh = () => {
    listSubscribe().then(res => {
      subscribes.value = res;
    });
  }
  refresh();

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
        expanded: true
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
            data: item
          });
        }
      } else {
        tree.push({
          id: item.id,
          name: item.name,
          type: 'item',
          path: '',
          data: item
        });
      }
    });

    tree.forEach(node => calculateCount(node));

    return tree;
  });

  return {
    subscribes,
    subscribeTree,
    refresh
  }

})