import {buildJava} from "./java";
import type {ParserEngine} from "./types";
import type {RequestConfig} from "../shard/RequestConfig";

export function buildJsText(url: string, engines: Array<ParserEngine>, key: string, page = 1): string {
  return url.replaceAll(/\{\{(.*)}}/gm, (_substring, item) => {
    try {
      const match = item as string;
      const java = buildJava(engines)
      return eval(match) || ''
    } catch (e) {
      console.error(e);
      return '';
    }
  });
}

export function buildSearchUrlFromString(url: string, key = '', page = 1): RequestConfig {
  let template = url;
  // 上来就处理一下
  template = buildJsText(template, [], key, page);
  const java = buildJava([])
  if (url.startsWith("@js:")) {
    // js
    try {
      template = `${eval(url.substring(4))}`;
    } catch (e) {
      console.error(e);
    }
  } else if (!url.startsWith('http')) {
    try {
      template = `${eval(url)}`;
    } catch (e) {
      console.error(e);
    }
  }
  let strings = template.split(",");
  let config: Record<string, any> = {};
  if (strings[1]) {
    try {
      let jsonString = strings.slice(1).join(",");
      jsonString = jsonString.replaceAll("'", '"');
      config = JSON.parse(jsonString);
    } catch (e) {
      console.error(e);
      // 链接里面不会存在逗号，所以存在逗号，后面的都不要了
    }
  }
  return {
    url: strings[0]!,
    charset: config['charset'],
    headers: config['headers'],
    method: config['method'],
    webview: config['webview'],
    data: config['body']
  }
}

export function buildBookContentUrl(toc: string, link: string): string {
  // 最后使用
  return [toc, link].join('/');
}

