export interface TodoContent {

  id: string;
  createdAt: number;
  updatedAt: number;

  // 所属清单
  planId: string;
  // 所属分组
  groupId: string;

  // 内容
  content: string;
}