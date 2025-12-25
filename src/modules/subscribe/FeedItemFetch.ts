import type {FeedItem, SubscribeItem} from "@/entity/subscribe";
import {getTextAction} from "@/lib/http.ts";
import {XMLParser} from "fast-xml-parser";

type FeedItemWrap = Omit<FeedItem, 'id'>;

function asArray<T>(value: T | T[] | undefined | null): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function getText(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (!value || typeof value !== "object") return "";
  const obj = value as Record<string, unknown>;
  const text = obj["#text"];
  if (typeof text === "string") return text;
  return "";
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .replace(/&nbsp;/g, " ")
    .trim();
}

function buildSnippet(input: string, maxLen = 200): string {
  const text = stripHtml(input);
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).trim();
}

function parseDateToTs(dateValue: unknown, fallback: number): number {
  if (typeof dateValue === "number" && Number.isFinite(dateValue)) return dateValue;
  const str = getText(dateValue);
  if (!str) return fallback;
  const ts = Date.parse(str);
  return Number.isFinite(ts) ? ts : fallback;
}

type RssLikeItem = Record<string, unknown>;

function pickAtomLink(entry: RssLikeItem): string {
  const links = asArray(entry.link as unknown);
  for (const link of links) {
    if (typeof link === "string") return link;
    if (!link || typeof link !== "object") continue;
    const obj = link as Record<string, unknown>;
    const rel = typeof obj["@_rel"] === "string" ? obj["@_rel"] : "";
    const href = typeof obj["@_href"] === "string" ? obj["@_href"] : "";
    if (rel === "alternate" && href) return href;
  }
  for (const link of links) {
    if (typeof link === "string") return link;
    if (!link || typeof link !== "object") continue;
    const obj = link as Record<string, unknown>;
    const href = typeof obj["@_href"] === "string" ? obj["@_href"] : "";
    if (href) return href;
  }
  return "";
}

function extractEntries(parsed: any): Array<RssLikeItem> {
  const rssChannel = parsed?.rss?.channel ?? parsed?.RSS?.channel ?? parsed?.rdf?.channel ?? parsed?.RDF?.channel;
  const channel = Array.isArray(rssChannel) ? rssChannel[0] : rssChannel;
  const rssItems = asArray<RssLikeItem>(channel?.item ?? parsed?.item ?? parsed?.rdf?.item ?? parsed?.RDF?.item);
  if (rssItems.length) return rssItems;

  const atomFeed = parsed?.feed ?? parsed?.Feed;
  const atomEntries = asArray<RssLikeItem>(atomFeed?.entry);
  if (atomEntries.length) return atomEntries;

  return [];
}

function normalizeEntry(entry: RssLikeItem, subscribeId: string, now: number): FeedItemWrap | null {
  const guid = getText(entry.guid ?? entry.id);
  const title = getText(entry.title);

  const link =
    (typeof entry.link === "string" ? entry.link : "") ||
    (entry.link && typeof entry.link === "object" ? (entry.link as any)["@_href"] : "") ||
    pickAtomLink(entry);

  const publishedTs = parseDateToTs(entry.pubDate ?? entry.published ?? entry.updated ?? entry.date, now);

  const author =
    getText(entry.creator) ||
    getText(entry.author) ||
    getText((entry.author as any)?.name) ||
    "";

  const summaryRaw =
    getText(entry.contentSnippet) ||
    getText(entry.description) ||
    getText(entry.summary) ||
    getText(entry.encoded) ||
    getText(entry.content) ||
    "";

  const summary = buildSnippet(summaryRaw);

  const signal = guid || link || "";
  if (!signal) return null;

  return {
    created_at: now,
    updated_at: now,
    is_read: false,
    signal,
    title: title || "",
    link: link || "",
    pub_date: publishedTs,
    author,
    summary,
    content_fetched: false,
    subscribe_id: subscribeId
  };
}

export async function fetchFeedItems(subscribe: SubscribeItem): Promise<Array<FeedItemWrap>> {
  const xml = await getTextAction(subscribe.url);
  const parser = new XMLParser({
    attributeNamePrefix: "@_",
    ignoreAttributes: false,
    removeNSPrefix: true,
    trimValues: true
  });

  let parsed: any;
  try {
    parsed = parser.parse(xml);
  } catch (e) {
    throw new Error(`RSS 解析失败: ${(e as Error)?.message || String(e)}`);
  }

  const entries = extractEntries(parsed);
  const now = Date.now();
  return entries
    .map(e => normalizeEntry(e, subscribe.id, now))
    .filter((e): e is FeedItemWrap => !!e);
}
