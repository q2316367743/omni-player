<template>
  <div class="note-editor-page">
    <div class="note-sidebar">
      <div class="sidebar-header">
        <t-button theme="primary" variant="text" shape="square" @click="goBack">
          <template #icon>
            <chevron-left-icon/>
          </template>
        </t-button>
        <span class="ml-2">笔记</span>
        <t-dropdown trigger="click">
          <t-button class="ml-auto" theme="primary" variant="text">
            <template #icon>
              <add-icon/>
            </template>
            新建
          </t-button>
          <t-dropdown-menu>
            <t-dropdown-item @click="handleNewArticle">新建笔记</t-dropdown-item>
            <t-dropdown-item @click="handleNewFolder">新建文件夹</t-dropdown-item>
          </t-dropdown-menu>
        </t-dropdown>
      </div>
      <div class="sidebar-content">
        <note-tree
          :nodes="treeNodes"
          :selected-path="selectedArticlePath"
          @select="handleSelectArticle"
          @contextmenu="handleContextMenu"
        />
      </div>
    </div>
    <div class="note-main">
      <div v-if="selectedArticlePath" class="editor-container">
        <div class="editor-header">
          <span class="article-title">{{ currentArticleTitle }}</span>
          <t-button theme="primary" size="small" @click="editorRef?.save()">
            <template #icon>
              <save-icon/>
            </template>
            保存
          </t-button>
        </div>
        <note-editor
          ref="editorRef"
          v-model:content="currentContent"
          :article-path="selectedArticlePath"
          :note-fs="noteFs!"
          @save="handleAutoSave"
          @manual-save="handleManualSave"
        />
      </div>
      <div v-else class="empty-state">
        <div class="empty-icon">
          <file-icon size="64px"/>
        </div>
        <div class="empty-text">选择或创建一个笔记开始编辑</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {onMounted, ref} from 'vue';
import {AddIcon, ChevronLeftIcon, FileIcon, SaveIcon} from 'tdesign-icons-vue-next';
import {APP_DATA_NOTE_PATH} from "@/global/Constants.ts";
import {NoteFs, type NoteNode} from "./func/noteFs.ts";
import NoteTree from "./components/NoteTree.vue";
import NoteEditor from "./components/NoteEditor.vue";
import {openNoteContextMenu} from "./func/NoteContextMenu.tsx";
import MessageUtil from "@/util/model/MessageUtil.ts";

const router = useRouter();

const treeNodes = ref<NoteNode[]>([]);
const selectedArticlePath = ref('');
const currentContent = ref('');
const currentArticleTitle = ref('');
const editorRef = ref<InstanceType<typeof NoteEditor> | null>(null);

let noteFs: NoteFs | null = null;

const goBack = () => router.back();

const loadRootNodes = async () => {
  if (!noteFs) return;
  try {
    treeNodes.value = await noteFs.readDirectory(await APP_DATA_NOTE_PATH());
  } catch (error) {
    console.error('Failed to load root nodes:', error);
    MessageUtil.error('加载目录失败');
  }
};

const handleSelectArticle = async (path: string) => {
  selectedArticlePath.value = path;
  if (!noteFs) return;

  try {
    currentContent.value = await noteFs.readArticleContent(path);
    currentArticleTitle.value = await noteFs.getArticleNameFromPath(path);
  } catch (error) {
    console.error('Failed to load article:', error);
    MessageUtil.error('加载笔记失败');
  }
};

const handleNewArticle = async () => {
  if (!noteFs) return;

  try {
    const name = `未命名笔记-${Date.now()}`;
    const newNode = await noteFs.createArticle(await APP_DATA_NOTE_PATH(), name);
    treeNodes.value.push(newNode);
    handleSelectArticle(newNode.path);
    MessageUtil.success('创建笔记成功');
  } catch (error) {
    console.error('Failed to create article:', error);
    MessageUtil.error('创建笔记失败');
  }
};

const handleNewFolder = async () => {
  if (!noteFs) return;

  try {
    const name = `新建文件夹-${Date.now()}`;
    const newNode = await noteFs.createFolder(await APP_DATA_NOTE_PATH(), name);
    treeNodes.value.push(newNode);
    MessageUtil.success('创建文件夹成功');
  } catch (error) {
    console.error('Failed to create folder:', error);
    MessageUtil.error('创建文件夹失败');
  }
};

const findNodeInTree = (nodes: NoteNode[], path: string): NoteNode | undefined => {
  for (const node of nodes) {
    if (node.path === path) {
      return node;
    }
    if (node.children) {
      const found = findNodeInTree(node.children, path);
      if (found) return found;
    }
  }
  return undefined;
};

const handleContextMenu = async (node: NoteNode, event: PointerEvent) => {
  if (!noteFs) return;

  const fs = noteFs;

  await openNoteContextMenu(node, event, {
    onDelete: async () => {
      try {
        await fs.deleteNode(node.path);
        if (selectedArticlePath.value === node.path) {
          selectedArticlePath.value = '';
          currentContent.value = '';
          currentArticleTitle.value = '';
        }
        await loadRootNodes();
        MessageUtil.success('删除成功');
      } catch (error) {
        console.error('Failed to delete node:', error);
        MessageUtil.error('删除失败');
      }
    },
    onRename: async (newName: string) => {
      try {
        await fs.renameNode(node.path, newName);
        const updatedNode = findNodeInTree(treeNodes.value, node.path);
        if (updatedNode) {
          updatedNode.name = newName;
          if (selectedArticlePath.value === node.path) {
            currentArticleTitle.value = newName;
          }
        }
        MessageUtil.success('重命名成功');
      } catch (error) {
        console.error('Failed to rename node:', error);
        MessageUtil.error('重命名失败');
      }
    },
    onNewArticle: async (parentPath: string, name: string) => {
      try {
        const newNode = await fs.createArticle(parentPath, name);
        const parentNode = findNodeInTree(treeNodes.value, parentPath);
        if (parentNode) {
          if (!parentNode.children) {
            parentNode.children = [];
          }
          parentNode.children.push(newNode);
          parentNode.expanded = true;
        }
        handleSelectArticle(newNode.path);
        MessageUtil.success('创建笔记成功');
      } catch (error) {
        console.error('Failed to create article:', error);
        MessageUtil.error('创建笔记失败');
      }
    },
    onNewFolder: async (parentPath: string, name: string) => {
      try {
        const newNode = await fs.createFolder(parentPath, name);
        const parentNode = findNodeInTree(treeNodes.value, parentPath);
        if (parentNode) {
          if (!parentNode.children) {
            parentNode.children = [];
          }
          parentNode.children.push(newNode);
          parentNode.expanded = true;
        }
        MessageUtil.success('创建文件夹成功');
      } catch (error) {
        console.error('Failed to create folder:', error);
        MessageUtil.error('创建文件夹失败');
      }
    }
  });
};

const handleAutoSave = () => {
};

const handleManualSave = () => {
  MessageUtil.success('保存成功');
};

onMounted(async () => {
  const basePath = await APP_DATA_NOTE_PATH();
  noteFs = new NoteFs(basePath);
  await noteFs.ensureBaseDir();
  await loadRootNodes();
});
</script>

<style scoped lang="less">
.note-editor-page {
  display: flex;
  height: 100%;
  width: 100%;
  overflow: hidden;

  .note-sidebar {
    width: 280px;
    min-width: 280px;
    border-right: 1px solid var(--td-border-level-1-color);
    display: flex;
    flex-direction: column;
    background: var(--td-bg-color-container);

    .sidebar-header {
      padding: 12px;
      border-bottom: 1px solid var(--td-border-level-1-color);
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .sidebar-content {
      flex: 1;
      overflow-y: auto;
      padding: 8px;
    }
  }

  .note-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .editor-container {
      display: flex;
      flex-direction: column;
      height: 100%;

      .editor-header {
        padding: 12px 16px;
        border-bottom: 1px solid var(--td-border-level-1-color);
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: var(--td-bg-color-container);

        .article-title {
          font-size: 16px;
          font-weight: 500;
          color: var(--td-text-color-primary);
        }
      }
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: var(--td-text-color-secondary);

      .empty-icon {
        margin-bottom: 16px;
        opacity: 0.5;
      }

      .empty-text {
        font-size: 14px;
      }
    }
  }
}
</style>
