// 分页参数（可选，用于大目录优化）
export interface ListOptions {
  page?: number;
  pageSize?: number;
  sortBy?: 'name' | 'size' | 'modifiedAt';
  order?: 'asc' | 'desc';
}