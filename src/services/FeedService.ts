import {useSql} from "@/lib/sql.ts";
import type {FeedContent, FeedItem, SubscribeItem} from "@/entity/subscribe";
import type {PageResponse} from "@/global/PageResponse.ts";
import {fetchFeedItems} from "@/modules/subscribe";
import {map} from "@/util";
import {fetchFeedContent} from "@/modules/subscribe/FeedContentFetch.ts";
import {logDebug} from "@/lib/log.ts";
import {useSubscribeStore} from "@/store/SubscribeStore.ts";

export async function listFeed(subscribeId: string, page: number, pageSize: number, keyword?: string): Promise<PageResponse<FeedItem>> {
  const query = useSql().query<FeedItem>("feed_item");
  let q = query.eq('subscribe_id', subscribeId).orderByDesc('pub_date');
  if (keyword && keyword.trim()) {
    const key = keyword.trim();
    q = q.like('title', key).lastSql(`or \`summary\` like '%${key}%'`);
  }
  return q.page(page, pageSize)
}

export async function refreshFeed(subscribeId: string) {
  const feedQuery = useSql().query<FeedItem>('feed_item')
  let update = false;
  const subscribeQuery = useSql().query<SubscribeItem>('subscribe_item')
  const subscribe = await subscribeQuery.eq('id', subscribeId).one();
  if (!subscribe) return Promise.reject(new Error("订阅不存在"));
  try {
    const feedMapper = useSql().mapper<FeedItem>('feed_item')

    const feedItems = await fetchFeedItems(subscribe);
    const hav = await feedQuery.in('signal', feedItems.map(e => e.signal)).select('signal', 'id').list();
    const havMap = map(hav, 'signal');
    for (const feedItem of feedItems) {
      // 需要判断是否存在
      if (!havMap.has(feedItem.signal)) {
        await feedMapper.insert(feedItem);
        update = true;
      }
    }
  } finally {
    const subscribeMapper = useSql().mapper<SubscribeItem>("subscribe_item")
    // 重新计算数量
    let count = subscribe.count;
    let unReadCount = subscribe.un_read_count;
    if (update) {
      logDebug("重新计算数量")
      count = await feedQuery.eq('subscribe_id', subscribeId).count();
      unReadCount = 1;
    }
    logDebug(`订阅「${subscribeId}」有 feed 共 ${count} 个`)
    await subscribeMapper.updateById(subscribeId, {
      count,
      un_read_count: unReadCount,
      updated_at: Date.now()
    });
    useSubscribeStore().refresh();
  }


}

export interface FeedWrapper extends FeedContent, FeedItem {

}

export async function getFeedContentDefault(feedId: string): Promise<FeedWrapper> {
  const feedQuery = useSql().query<FeedItem>("feed_item")
  const feed = await feedQuery.eq('id', feedId).one();
  if (!feed) return Promise.reject(new Error(`feed item 「${feedId}」不存在`));

  const feedMapper = useSql().mapper<FeedItem>("feed_item")
  await feedMapper.updateById(feedId, {is_read: 1, content_fetched: 1})

  return {
    ...feed,
    feed_id: feedId,
    item_link: feed.link,
    html_content: '',
    parsed_title: '',
    parsed_content: '',
    fetch_time: '',
    parse_success: 0
  };
}

export async function getFeedContent(feedId: string): Promise<FeedWrapper> {
  const feedQuery = useSql().query<FeedItem>("feed_item")
  const feed = await feedQuery.eq('id', feedId).one();
  if (!feed) return Promise.reject(new Error(`feed item 「${feedId}」不存在`));


  const feedContentQuery = useSql().query<FeedContent>("feed_content")
  const feedContentMapper = useSql().mapper<FeedContent>("feed_content")
  const content = await feedContentQuery.eq('feed_id', feedId).one();
  if (content) return {...content, ...feed};
  const save = await fetchFeedContent(feed);
  await feedContentMapper.insert({
    ...save,
    feed_id: feedId,
    subscribe_id: feed.subscribe_id
  });

  const feedMapper = useSql().mapper<FeedItem>("feed_item")
  await feedMapper.updateById(feedId, {is_read: 1, content_fetched: 1})
  return {...save, ...feed, feed_id: feedId};
}