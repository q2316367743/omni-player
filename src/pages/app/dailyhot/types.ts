export interface HotItem {
  id: number;
  title: string;
  desc?: string;
  cover?: string;
  hot?: string;
  timestamp?: string;
  url?: string;
  mobileUrl?: string;
}

export interface ApiResponse {
  code: number;
  name: string;
  title: string;
  type: string;
  description: string;
  link: string;
  total: number;
  updateTime: string;
  formCache: string;
  data: HotItem[];
}

export interface PlatformListResponse {
  code: number;
  msg: string;
  data: {
    platforms: string[];
    total: number;
  };
  api_source: string;
}