import type {CommonOption} from "@/global/CommonType.ts";

export interface NewItem {
  id: string;
  title: string;
  url: string;
  desc?: string;
  cover?: string;
  author?: string;
  timestamp?: number;
  hot?: number;
}

export interface INewsService {

  platforms: () => Promise<Array<CommonOption>>;

  getNews(platform: string): Promise<Array<NewItem>>;

}