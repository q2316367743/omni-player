import type {IFileServer} from "@/modules/file/IFileServer.ts";
import type {FileServerEntry, FileServerType} from "@/entity/FileServer.ts";
import {type FileItem, renderFileItemContent} from "@/modules/file/types/FileItem.ts";
import type {ListOptions} from "@/modules/file/types/ListOptions.ts";
import {requestAction, type RequestConfig} from "@/lib/http.ts";
import type {FsGetResponse, FsListResponse, OpenListResult} from "@/modules/file/services/open-list/types.ts";
import MessageUtil from "@/util/model/MessageUtil.ts";
import type {ListResult} from "@/modules/file/types/ListResult.ts";
import {SUPPORT_MOVIE} from "@/global/Constants.ts";


/**
 * OpenList客户端
 * 直接使用全局 token，并且支持没有 token 的
 */
export class OpenListClient implements IFileServer {

  private readonly props: FileServerEntry;
  readonly type: FileServerType;

  constructor(props: FileServerEntry) {
    this.props = props;
    this.type = props.type;
  }

  private async request<T>(config: RequestConfig) {
    const resp = await requestAction<OpenListResult<T>>({
      ...config,
      baseURL: this.props.url,
      headers: {
        ...config.headers,
        Authorization: `Bearer ${this.props.password}`,
        "Content-Type": "application/json"
      },
      responseType: 'json'
    });
    const {data} = resp;
    if (data.code !== 200) {
      MessageUtil.error("请求错误", data.message);
      return Promise.reject(new Error(data.message))
    }
    return data.data;
  }

  async connect(): Promise<void> {
  }

  async disconnect(): Promise<void> {
  }

  async list(path: string, options?: ListOptions): Promise<ListResult> {
    const resp = await this.request<FsListResponse>({
      url: "/api/fs/list",
      method: "POST",
      data: {
        path,
        ...options
      }
    });
    const {content, header, provider, readme, total, write} = resp
    if (!content) return {content: [], total: 0};
    // 处理子项：弹幕/nfo/poster/fanart/thumb
    const items = content.map(item => {
      const [basename, extname] = item.name?.split(".") || [];
      return {
        id: item.id,
        name: item.name,
        basename: basename || '',
        extname: extname || '',
        isDirectory: item.is_dir,
        size: item.size,
        modifiedAt: item.modified,
        path: item.path,
        extra: {
          mount_details: item.mount_details,
          sign: item.sign,
          thumb: item.thumb
        }
      } as FileItem
    });
    return {
      content: renderFileItemContent(items),
      total: total || 0,
      extra: {
        header,
        provider,
        readme,
        write
      }
    }

  }

  getMetadata(file: FileItem): Promise<Record<string, any>> {
    return this.request<FsGetResponse>({
      url: '/api/fs/get',
      method: 'POST',
      data: {
        path: file.path,
        password: ''
      }
    })
  }

  async getPlayableUrl(file: FileItem): Promise<string> {
    if (file.isDirectory) {
      throw new Error('Cannot play a directory');
    }

    // 如果 FileItem.extra.sign 不存在，主动获取一次
    const sign = file.extra?.sign || '';

    // 构造播放 URL（使用 /d/ 路径）
    const encodedPath = encodeURIComponent(file.path.startsWith('/') ? file.path.slice(1) : file.path);
    return `${this.props.url}/d/${encodedPath}?sign=${encodeURIComponent(sign)}`;
  }

  // 其实是获取播放链接
  isPlayable(file: FileItem): boolean {
    if (file.isDirectory) return false;
    return SUPPORT_MOVIE.test(file.extname);

  }
}