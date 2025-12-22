// 文件/目录的统一表示
import type {SubtitleItem} from "@/modules/file/types/SubtitleItem.ts";
import {group} from "@/util";
import {SUPPORT_MOVIE} from "@/global/Constants.ts";

export interface FileItem {
  id: string;               // 唯一标识（路径哈希或服务端ID）
  name: string;             // 文件/目录名
  /**
   * 基础名称
   */
  basename: string;
  /**
   * 拓展名
   */
  extname: string;
  isDirectory: boolean;     // 是否为目录
  size?: number;            // 文件大小（字节）
  modifiedAt?: string;        // 修改时间
  path: string;             // 完整路径（用于后续请求）
  subtitles?: SubtitleItem[]; // 关联子项（可选）
  extra?: Record<string, any>; // 协议特有字段（如 WebDAV 的 ETag、SMB 的权限位）
}

export function renderFileItemContent(items: Array<FileItem>): Array<FileItem> {

  // 根据基础名称分组
  const basenameMap = group(items, 'basename');
  // 获取视频列表
  const videoItems = items.filter(item => SUPPORT_MOVIE.test(item.extname));

  videoItems.forEach(e => {
    const subitems = basenameMap.get(e.basename);
    if (!subitems || subitems.length === 0)return;
    e.subtitles = [];
    for (const subitem of subitems) {
      switch (subitem.extname) {
        case 'nfo':
          e.subtitles.push({
            type: 'nfo',
            path: subitem.path,
            title: subitem.name
          });
          break;
        case 'jpg':
        case 'png':
          e.subtitles.push({
            type: 'poster',
            path: subitem.path,
          });
          break;
        case 'srt':
        case 'ass':
        case 'vtt':
          e.subtitles.push({
            type: 'danmu',
            path: subitem.path,
            format: subitem.extname
          });
          break;
      }
    }
    // 尝试两个特殊的
    const poster = basenameMap.get(e.basename+'-poster');
    const fanart = basenameMap.get(e.basename+'-fanart');
    const thumb = basenameMap.get(e.basename+'-thumb');
    if (poster && poster[0]) e.subtitles.push({
      type: 'poster',
      path: poster[0].path,
    });
    if (fanart && fanart[0]) e.subtitles.push({
      type: 'fanart',
      path: fanart[0].path,
    });
    if (thumb && thumb[0]) e.subtitles.push({
      type: 'thumb',
      path: thumb[0].path,
    });
  });

  return [
    // 目录
    ...items.filter(e => e.isDirectory),
    // 视频
    ...videoItems,
  ];
}