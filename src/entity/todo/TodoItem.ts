// 待办优先级：1-高，2-中，3-低，4-无
export type TodoItemPriority = 1 | 2 | 3 | 4;

/**
 * 待办项
 */
export interface TodoItem {

  id: string;
  createdAt: number;
  updatedAt: number;

  // 所属清单
  planId: string;
  // 所属分组
  groupId: string;
  // 优先级
  priority: TodoItemPriority;
  // 标题
  title: string;
  // 标签
  tags: string;


}