export interface FeedItem {
  id: string;
  created_at: number;
  updated_at: number;

  // 唯一项
  signal: string;
  // 文章标题
  title: string;
  // 原文链接
  link: string;
  // 发布时间（ISO08601 格式）
  pubDate: string;
  // 作者
  author: string;
  //  摘要
  summary: string;
  // 是否已读
  isRead: boolean;
  // 是否已获取内容
  contentFetched: boolean;
}