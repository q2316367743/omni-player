import * as cheerio from 'cheerio';
import {getTextAction} from "@/lib/http.ts";

/**
 * 获取网站的 favicon 地址（完整 URL）
 * @param siteUrl 要查询的网站地址（必须包含协议，如 https://example.com）
 * @returns Promise<string> favicon 的完整 URL
 */
export async function getFaviconUrl(siteUrl: string): Promise<string> {
  // 确保 siteUrl 是合法的 URL
  let baseUrl: URL;
  try {
    baseUrl = new URL(siteUrl);
  } catch (err) {
    console.error(err);
    throw new Error(`Invalid URL: ${siteUrl}`);
  }

  // 默认 favicon 路径
  const defaultFavicon = new URL('/favicon.ico', baseUrl).href;

  try {
    // 获取网页 HTML
    const html = await getTextAction(siteUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; FaviconFetcher/1.0)',
      },
    });

    const $ = cheerio.load(html);

    // 查找所有可能的 favicon 链接
    const linkSelectors = [
      'link[rel="icon"]',
      'link[rel="shortcut icon"]',
      'link[rel="apple-touch-icon"]',
      'link[rel="mask-icon"]',
      'link[rel*="icon"]', // 包含 icon 的 rel（如 "shortcut icon"）
    ];

    for (const selector of linkSelectors) {
      const element = $(selector).first();
      if (element.length > 0) {
        const href = element.attr('href');
        if (href) {
          // 处理相对路径
          try {
            return new URL(href, baseUrl).href;
          } catch {
            // 如果解析失败，跳过

          }
        }
      }
    }

    // 如果都没找到，返回默认 favicon
    return defaultFavicon;
  } catch (error) {
    // 如果请求失败，也返回默认 favicon（可选：也可抛出错误）
    console.error(error);
    console.warn(`Failed to fetch HTML from ${siteUrl}:`, (error as Error).message);
    return defaultFavicon;
  }
}