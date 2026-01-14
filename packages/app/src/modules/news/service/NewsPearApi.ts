import type {INewsService, NewItem} from "@/modules/news/INewsService.ts";
import type {CommonOption} from "@/global/CommonType.ts";
import {getAction} from "@/lib/http.ts";

interface HotItem {
  id: number;
  title: string;
  desc?: string;
  cover?: string;
  hot?: string;
  timestamp?: string;
  url?: string;
  mobileUrl?: string;
}

interface ApiResponse {
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

interface PlatformListResponse {
  code: number;
  msg: string;
  data: {
    platforms: string[];
    total: number;
  };
  api_source: string;
}

const API_URL = 'https://api.pearktrue.cn/api/dailyhot/';

export class NewsPearApi implements INewsService {
  async platforms(): Promise<Array<CommonOption>> {
    const {data} = await getAction<PlatformListResponse>(API_URL);

    if (data.code === 200 && data.data?.platforms) {
      return data.data.platforms.map(p => ({label: p, value: p}));
    } else {
      return []
    }
  }

  async getNews(platform: string): Promise<Array<NewItem>> {
    const {data} = await getAction<ApiResponse>(API_URL, {title: platform});

    console.log(data)
    if (data.code === 200 && data.data) {
      return data.data.map(item => ({
        id: item.id + '',
        title: item.title,
        url: item.url || '',
        desc: item.desc,
        cover: item.cover,
        time: item.timestamp ? parseInt(item.timestamp) : undefined,
        hot: item.hot ? parseInt(item.hot) : undefined,
      })).filter(e => !!e.url);
    } else {
      return [];
    }
  }

}