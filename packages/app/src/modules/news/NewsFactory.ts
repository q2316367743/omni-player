import type {INewsService} from "@/modules/news/INewsService.ts";
import {NewsPearApi} from "@/modules/news/service/NewsPearApi.ts";

export function createNewsService(type: string): INewsService {
  if (type === 'pearapi') return new NewsPearApi();

  throw new Error(`不支持的新闻服务类型: ${type}`);
}

export const useNewsService = () => createNewsService('pearapi');