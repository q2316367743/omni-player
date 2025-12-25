import type {FeedContent, FeedItem} from "@/entity/subscribe";
import {getTextAction} from "@/lib/http.ts";
import * as cheerio from "cheerio";

type FeedContentInsert = Omit<FeedContent, "id" | "subscribe_id" | "feed_id">;

function normalizeText(input: string): string {
  return input
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safeUrlJoin(base: string, maybeRelative: string): string {
  try {
    return new URL(maybeRelative, base).href;
  } catch {
    return maybeRelative;
  }
}

function pickBestTitle($: cheerio.CheerioAPI): string {
  const candidates = [
    $('meta[property="og:title"]').attr("content"),
    $('meta[name="twitter:title"]').attr("content"),
    $("title").first().text(),
    $("h1").first().text(),
  ];
  for (const c of candidates) {
    const t = typeof c === "string" ? normalizeText(c) : "";
    if (t) return t;
  }
  return "";
}

type Candidate = { element: cheerio.Cheerio<any>; score: number };

function scoreElement($: cheerio.CheerioAPI, el: any): number {
  const $el = $(el);
  const text = normalizeText($el.text());
  if (!text) return 0;
  const linkCount = $el.find("a").length;
  const pCount = $el.find("p").length;
  const textLen = text.length;
  const penalty = Math.min(linkCount * 20, 800);
  const bonus = Math.min(pCount * 80, 1200);
  return textLen + bonus - penalty;
}

function pickMainElement($: cheerio.CheerioAPI): cheerio.Cheerio<any> {
  const selectors = [
    "article",
    "main",
    '[role="main"]',
    "#content",
    "#main",
    ".content",
    ".post",
    ".post-content",
    ".entry-content",
    ".article",
    ".article-content",
    ".markdown-body",
  ];

  const candidates: Candidate[] = [];
  for (const selector of selectors) {
    $(selector).each((_, el) => {
      const score = scoreElement($, el);
      if (score > 0) candidates.push({element: $(el), score});
    });
  }

  candidates.sort((a, b) => b.score - a.score);
  if (candidates[0]?.score && candidates[0].score > 200) return candidates[0].element;
  return $("body");
}

function removeNoise($: cheerio.CheerioAPI) {
  const noiseSelectors = [
    "script",
    "style",
    "noscript",
    "iframe",
    "svg",
    "canvas",
    "form",
    "header",
    "footer",
    "nav",
    "aside",
    "button",
    "input",
    "textarea",
    "select",
    "option",
  ];
  $(noiseSelectors.join(",")).remove();
}

function absolutizeLinks(
  $: cheerio.CheerioAPI,
  root: cheerio.Cheerio<any>,
  baseUrl: string
) {
  root.find("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;
    $(el).attr("href", safeUrlJoin(baseUrl, href));
  });
  root.find("img[src]").each((_, el) => {
    const src = $(el).attr("src");
    if (!src) return;
    $(el).attr("src", safeUrlJoin(baseUrl, src));
  });
}

function simplifyHtml($: cheerio.CheerioAPI, root: cheerio.Cheerio<any>): string {
  const keepTags = new Set([
    "p",
    "br",
    "a",
    "img",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "ul",
    "ol",
    "li",
    "blockquote",
    "pre",
    "code",
    "strong",
    "em",
    "b",
    "i",
    "del",
    "hr",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
  ]);

  const unwrapTags = new Set([
    "div",
    "section",
    "article",
    "main",
    "span",
    "font",
    "figure",
    "figcaption",
    "picture",
    "center",
  ]);

  const $root = $("<div></div>").append(root.clone());

  $root.find("*").each((_, el) => {
    const tag = (el.tagName || "").toLowerCase();
    const $el = $(el);

    if (unwrapTags.has(tag)) {
      $el.replaceWith($el.contents());
      return;
    }

    if (!keepTags.has(tag)) {
      const text = $el.text();
      if (text && normalizeText(text)) {
        $el.replaceWith(escapeHtml(normalizeText(text)));
      } else {
        $el.remove();
      }
      return;
    }

    const attrs = el.attribs ? Object.keys(el.attribs) : [];
    for (const attr of attrs) {
      if (tag === "a") {
        if (attr === "href" || attr === "title") continue;
        $el.removeAttr(attr);
        continue;
      }
      if (tag === "img") {
        if (attr === "src" || attr === "alt" || attr === "title") continue;
        $el.removeAttr(attr);
        continue;
      }
      $el.removeAttr(attr);
    }
  });

  $root.find("p, li, blockquote, pre, code, h1, h2, h3, h4, h5, h6").each((_, el) => {
    const $el = $(el);
    if (!normalizeText($el.text())) $el.remove();
  });

  const html = $root.html() || "";
  return html.trim();
}

function htmlToPlainText(html: string): string {
  return normalizeText(html.replace(/<[^>]*>/g, " "));
}

function plainTextToSimpleHtml(text: string): string {
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
  if (!normalized) return "";
  const parts = normalized.split(/\n{2,}/g).map((p) => normalizeText(p.replace(/\n/g, " "))).filter(Boolean);
  return parts.map((p) => `<p>${escapeHtml(p)}</p>`).join("");
}

export async function fetchFeedContent(feed: FeedItem): Promise<FeedContentInsert> {
  const html = await getTextAction(feed.link, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  });

  const fetchTime = new Date().toISOString();
  const itemLink = feed.signal || feed.link;

  try {
    const $ = cheerio.load(html);
    removeNoise($);
    const parsedTitle = pickBestTitle($) || feed.title || "";
    const main = pickMainElement($);
    absolutizeLinks($, main, feed.link);
    const parsedContent = simplifyHtml($, main);
    const parseSuccess = htmlToPlainText(parsedContent).length >= 30;

    return {
      item_link: itemLink,
      html_content: html,
      parsed_title: parsedTitle,
      parsed_content: parsedContent,
      fetch_time: fetchTime,
      parse_success: parseSuccess,
    };
  } catch {
    const parsedTitle = feed.title || "";
    const parsedContent = plainTextToSimpleHtml(normalizeText(html.replace(/<[^>]*>/g, " ")));
    return {
      item_link: itemLink,
      html_content: html,
      parsed_title: parsedTitle,
      parsed_content: parsedContent,
      fetch_time: fetchTime,
      parse_success: false,
    };
  }
}
