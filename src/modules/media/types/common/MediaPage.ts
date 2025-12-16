export interface PaginationOptions {
  page?: number;        // 页码（从 1 开始）
  pageSize?: number;    // 每页数量（默认 20~50）
  startIndex?: number;  // 起始索引（可选，用于无限滚动）
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;        // 总数（用于分页器）
  hasNext: boolean;     // 是否还有下一页（用于“加载更多”）
}