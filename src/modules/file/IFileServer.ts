import type {ListOptions} from "@/modules/file/types/ListOptions.ts";
import type {FileItem} from "@/modules/file/types/FileItem.ts";
import type {FileServerType} from "@/entity/FileServer.ts";
import type {ListResult} from "@/modules/file/types/ListResult.ts";

export interface IFileServer {
  /**
   * 初始化连接（如认证、建立会话）
   * @returns 是否成功
   */
  connect(): Promise<boolean>;

  /**
   * 列出指定路径下的文件和目录
   * @param path 路径，根目录通常为 "/"
   * @param options 分页/排序选项（可选）
   * @returns 文件项列表
   */
  list(path: string, options?: ListOptions): Promise<ListResult>;

  /**
   * 获取文件的可播放流 URL（或本地路径）
   * 播放器将用此 URL 传给 MPV
   * @param file 文件项
   * @returns 可直接用于播放的 URL 或本地路径
   */
  getPlayableUrl(file: FileItem): Promise<string>;

  /**
   * （可选）预检文件是否可播放
   * 可用于提前过滤非视频文件
   */
  isPlayable(file: FileItem): boolean;

  /**
   * （可选）获取额外元数据（如封面、时长）
   * 可延迟加载，避免 list 时性能下降
   */
  getMetadata?(file: FileItem): Promise<Record<string, any>>;

  /**
   * 断开连接（清理资源）
   */
  disconnect?(): Promise<void>;

  /**
   * 服务类型标识（用于 UI 显示或调试）
   */
  readonly type: FileServerType;
}