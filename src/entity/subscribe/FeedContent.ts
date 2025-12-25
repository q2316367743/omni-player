export interface FeedContentCore {


  // 外链
  item_link: string;
  // 原始 HTML（可选，用于调试或重解析）
  html_content: string;
  // 从 HTML 中提取的更准确的标题（可覆盖 RSS 标题）
  parsed_title: string;
  // 清洗后的正文（简化 HTML，只保留基础标签）
  parsed_content: string;
  // 获取时间
  fetch_time: string;
  // 是否会成功
  parse_success: boolean;
}

export interface FeedContent extends FeedContentCore{
  id: string;


  subscribe_id: string;
  feed_id: string;
}