export type NetworkServerType = "CMS:JSON" | "CMS:XML"

export interface NetworkServerEdit {


  group: string;
  // 顺序
  sequence: number;

  name: string;
  type: NetworkServerType;
  url: string;
  /**
   * m3u8解析地址
   * @example https://xxx.com/?url=
   */
  m3u8Parse: string;
}

export interface NetworkServer extends NetworkServerEdit{
  id: string;
  created_at: number;
  updated_at: number;
}

export function buildNetworkServerEdit(): NetworkServerEdit {
  return {
    group: "默认",
    sequence: 0,
    name: "",
    type: "CMS:JSON",
    url: "",
    m3u8Parse: ""
  }
}