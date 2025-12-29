// 待办优先级：1-高，2-中，3-低，4-无
export type TodoItemPriority = 1 | 2 | 3 | 4;
// 待办状态：0-待办，1-已完成，2-已取消/放弃
export type TodoItemStatus = 0 | 1 | 2 | 3;

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
  // 状态
  status: TodoItemStatus

  // 描述
  desc: string

}