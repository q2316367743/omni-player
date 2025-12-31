import {readDir, readTextFile, writeTextFile, mkdir, exists, remove, writeFile, rename} from "@tauri-apps/plugin-fs";
import {join, basename} from "@tauri-apps/api/path";
import {convertFileSrc} from "@tauri-apps/api/core"

export interface NoteNode {
  id: string;
  name: string;
  path: string;
  type: 'folder' | 'article';
  expanded?: boolean;
  children?: NoteNode[];
  loaded?: boolean;
}

export interface ArticleInfo {
  path: string;
  content: string;
  attachments: string[];
}

const ARTICLE_SUFFIX = '.md';

export class NoteFs {
  private readonly basePath: string;

  constructor(basePath: string) {
    this.basePath = basePath;
  }

  async ensureBaseDir(): Promise<void> {
    if (!(await exists(this.basePath))) {
      await mkdir(this.basePath, {recursive: true});
    }
  }

  async readDirectory(path: string): Promise<NoteNode[]> {
    const entries = await readDir(path);
    const nodes: NoteNode[] = [];

    for (const entry of entries) {
      const entryPath = await join(path, entry.name);
      const isArticle = entry.name.endsWith(ARTICLE_SUFFIX);

      if (entry.isDirectory) {
        if (isArticle) {
          nodes.push({
            id: entryPath,
            name: entry.name.slice(0, -ARTICLE_SUFFIX.length),
            path: entryPath,
            type: 'article',
            expanded: false,
            loaded: true
          });
        } else {
          nodes.push({
            id: entryPath,
            name: entry.name,
            path: entryPath,
            type: 'folder',
            expanded: false,
            loaded: false
          });
        }
      } else if (entry.isFile && entry.name.endsWith('.md')) {
        if (entry.name === 'index.md') {
          continue;
        }
        nodes.push({
          id: entryPath,
          name: entry.name.slice(0, -3),
          path: entryPath,
          type: 'article',
          expanded: false,
          loaded: true
        });
      }
    }

    return nodes;
  }

  async loadChildren(node: NoteNode): Promise<NoteNode[]> {
    if (node.type === 'article') {
      return [];
    }

    if (node.loaded) {
      return node.children || [];
    }

    const children = await this.readDirectory(node.path);
    node.children = children;
    node.loaded = true;
    return children;
  }

  async createArticle(parentPath: string, name: string): Promise<NoteNode> {
    const articleDirName = name + ARTICLE_SUFFIX;
    const articleDirPath = await join(parentPath, articleDirName);
    const indexPath = await join(articleDirPath, 'index.md');

    await mkdir(articleDirPath, {recursive: true});
    await writeTextFile(indexPath, '');

    return {
      id: articleDirPath,
      name: name,
      path: articleDirPath,
      type: 'article',
      expanded: false,
      loaded: true
    };
  }

  async createFolder(parentPath: string, name: string): Promise<NoteNode> {
    const folderPath = await join(parentPath, name);
    await mkdir(folderPath, {recursive: true});

    return {
      id: folderPath,
      name: name,
      path: folderPath,
      type: 'folder',
      expanded: false,
      loaded: false
    };
  }

  async readArticleContent(articlePath: string): Promise<string> {
    const indexPath = await join(articlePath, 'index.md');
    return await readTextFile(indexPath);
  }

  async saveArticleContent(articlePath: string, content: string): Promise<void> {
    const indexPath = await join(articlePath, 'index.md');
    await writeTextFile(indexPath, content);
  }

  async uploadAttachment(articlePath: string, fileName: string, data: Uint8Array): Promise<string> {
    const attachmentPath = await join(articlePath, fileName);
    await writeFile(attachmentPath, data);
    return attachmentPath;
  }

  renderAttachment(articlePath: string, fileName: string) {
    const path = articlePath + fileName.substring(1);
    return convertFileSrc(path)
  }

  async getAttachments(articlePath: string): Promise<string[]> {
    const entries = await readDir(articlePath);
    const attachments: string[] = [];

    for (const entry of entries) {
      if (entry.isFile && entry.name !== 'index.md') {
        const attachmentPath = await join(articlePath, entry.name);
        attachments.push(attachmentPath);
      }
    }

    return attachments;
  }

  async deleteNode(path: string): Promise<void> {
    await remove(path, {recursive: true});
  }

  async renameNode(path: string, newName: string): Promise<void> {
    const parentPath = path.substring(0, path.lastIndexOf('/'));
    const isArticle = this.isArticlePath(path);
    const finalName = isArticle ? newName + ARTICLE_SUFFIX : newName;
    const newPath = await join(parentPath, finalName);
    await rename(path, newPath);
  }

  isArticlePath(path: string): boolean {
    return path.endsWith(ARTICLE_SUFFIX);
  }

  getArticleDirName(name: string): string {
    return name + ARTICLE_SUFFIX;
  }

  async getArticleNameFromPath(path: string): Promise<string> {
    const dirName = await basename(path);
    return dirName.slice(0, -ARTICLE_SUFFIX.length);
  }
}
