export interface SubscribeItemEdit {

  // 订阅地址
  url: string;
  // 名称
  name: string;
  // 所属文件夹
  folder: string;
  // 排序
  sequence: number;

}

export interface SubscribeItem  extends SubscribeItemEdit{

  id: string;
  created_at: number;
  updated_at: number;

  // 图标
  icon: string;
  /**
   * 资讯数量
   */
  count: number;

  /**
   * 未读数量
   */
  un_read_count: number;

}

export function buildSubscribeItemEdit(): SubscribeItemEdit {
  return {
    url: "",
    name: "",
    folder: "",
    sequence: 0
  }
}