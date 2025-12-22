export type SubtitleItemType =
  // 弹幕
  'danmu' |
  // 视频信息
  'nfo' |
  // 封面
  'poster' |
  // 手绘/场景
  'fanart' |
  // 快照
  'thumb'

interface SubtitleItemBase {
  // 子项类型
  type: SubtitleItemType;
  // 路径
  path: string;
}

// 弹幕
interface SubtitleItemDanMu  extends SubtitleItemBase {
  type: 'danmu';
  language?: string;         // 如 "zh", "en"
  format: 'srt' | 'ass' | 'vtt';
}

interface SubtitleItemNfo extends SubtitleItemBase {
  type: 'nfo';
  // 视频名
  title: string;
}
interface SubtitleItemPoster extends SubtitleItemBase {
  type: 'poster';
}
interface SubtitleItemFanart extends SubtitleItemBase {
  type: 'fanart';
}
interface SubtitleItemThumb extends SubtitleItemBase {
  type: 'thumb';
}

export type SubtitleItem = SubtitleItemDanMu |
  SubtitleItemNfo |
  SubtitleItemPoster |
  SubtitleItemFanart |
  SubtitleItemThumb;