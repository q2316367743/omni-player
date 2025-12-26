import {useSql} from "@/lib/sql.ts";
import type {FeedContent, FeedItem, SubscribeItem} from "@/entity/subscribe";
import {TableName} from "@/global/TableName.ts";
import type {PageResponse} from "@/global/PageResponse.ts";
import {fetchFeedItems} from "@/modules/subscribe";
import {map} from "@/util";
import {fetchFeedContent} from "@/modules/subscribe/FeedContentFetch.ts";
import {logDebug} from "@/lib/log.ts";

export async function listFeed(subscribeId: string, page: number, pageSize: number, keyword?: string): Promise<PageResponse<FeedItem>> {
  const query = await useSql().query<FeedItem>(TableName.FEED_ITEM);
  let q = query.eq('subscribe_id', subscribeId).orderByDesc('pub_date');
  if (keyword && keyword.trim()) {
    const key = keyword.trim();
    q = q.like('title', key).lastSql(`or \`summary\` like '%${key}%'`);
  }
  return q.page(page, pageSize)
}

export async function refreshFeed(subscribeId: string) {
  const feedQuery = await useSql().query<FeedItem>(TableName.FEED_ITEM)
  try {
    const subscribeQuery = await useSql().query<SubscribeItem>(TableName.SUBSCRIBE_ITEM)
    const subscribe = await subscribeQuery.eq('id', subscribeId).one();
    if (!subscribe) return Promise.reject(new Error("订阅不存在"));
    const feedMapper = await useSql().mapper<FeedItem>(TableName.FEED_ITEM)

    const feedItems = await fetchFeedItems(subscribe);
    const hav = await feedQuery.in('signal', feedItems.map(e => e.signal)).select('signal', 'id').list();
    const havMap = map(hav, 'signal');
    for (const feedItem of feedItems) {
      // 需要判断是否存在
      if (!havMap.has(feedItem.signal)) {
        await feedMapper.insert(feedItem);
      }
    }
  } finally {
    const subscribeMapper = await useSql().mapper<SubscribeItem>(TableName.SUBSCRIBE_ITEM)
    // 重新计算数量
    logDebug("重新计算数量")
    const count = await feedQuery.eq('subscribe_id', subscribeId).count();
    logDebug(`订阅「${subscribeId}」有 feed 共 ${count} 个`)
    await subscribeMapper.updateById(subscribeId, {
      count
    })
  }


}

export interface FeedWrapper extends FeedContent, FeedItem {

}

export async function getFeedContent(feedId: string): Promise<FeedWrapper> {
  const feedQuery = await useSql().query<FeedItem>(TableName.FEED_ITEM)
  const feed = await feedQuery.eq('id', feedId).one();
  if (!feed) return Promise.reject(new Error(`feed item 「${feedId}」不存在`));

  if (!feed.is_read) {
    const feedMapper = await useSql().mapper<FeedItem>(TableName.FEED_ITEM)
    await feedMapper.updateById(feedId, {is_read: true})
  }

  const feedContentQuery = await useSql().query<FeedContent>(TableName.FEED_CONTENT)
  const feedContentMapper = await useSql().mapper<FeedContent>(TableName.FEED_CONTENT)
  const content = await feedContentQuery.eq('feed_id', feedId).one();
  if (content) return {...content, ...feed};
  const save = await fetchFeedContent(feed);
  await feedContentMapper.insert({
    ...save,
    feed_id: feedId,
    subscribe_id: feed.subscribe_id
  });
  return {...save, ...feed, feed_id: feedId};
}