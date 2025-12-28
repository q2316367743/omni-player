import type {SelectOption} from "@/global/CommonType.ts";

export interface NewItem {
  id: string;
  title: string;
  url: string;
  desc?: string;
  cover?: string;
  author?: string;
  time?: number;
  hot?: number;
}

export interface INewsService {

  platforms: () => Promise<Array<SelectOption>>;

  getNews(platform: string): Promise<Array<NewItem>>;

}