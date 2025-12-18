export type NetworkServerType = "mc10"

export const NetworkServerTypeOptions = [{
  label: "苹果CMS10",
  value: "mc10"
}]

export const NetworkServerTypeLabel = {
  mc10: "苹果CMS10"
}

export interface NetworkServerEdit {


  group: string;
  // 顺序
  sequence: number;

  name: string;
  type: NetworkServerType;
  format: "json" | "xml"
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
    type: "mc10",
    format: "json",
    url: "",
    m3u8Parse: ""
  }
}