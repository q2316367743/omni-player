export interface RssContent {
  id: string;

  // 外链
  itemLink: string;
  // 原始 HTML（可选，用于调试或重解析）
  htmlContent: string;
  // 从 HTML 中提取的更准确的标题（可覆盖 RSS 标题）
  parsedTitle: string;
  // 清洗后的正文（纯文本或简化 HTML）
  parsedContent: string;
  // 获取时间
  fetchTime: string;
  // 是否会成功
  parseSuccess: boolean;
}