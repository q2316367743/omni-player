/**
 * 待办计划/清单
 */
export interface TodoPlan {
  id: string;
  createdAt: number;
  updatedAt: number;

  name: string;
  folder: boolean;
  parentId: string;
}