import type {FeedContent, FeedItem, SubscribeItem, SubscribeItemEdit} from "@/entity/subscribe";
import {useSql} from "@/lib/sql.ts";
import {logError} from "@/lib/log.ts";
import {getFaviconUrl} from "@/util/file/website.ts";
import {refreshFeed} from "@/services/FeedService.ts";
import {LocalName} from "@/global/LocalName.ts";
import {useSubscribeStore} from "@/store/SubscribeStore.ts";

export async function listSubscribe() {
  const query =  useSql().query<SubscribeItem>("subscribe_item")
  return query.list();
}

export async function addSubscribe(subscribe: SubscribeItemEdit) {
  const mapper =  useSql().mapper<SubscribeItem>("subscribe_item")
  const item = await mapper.insert({
    created_at: Date.now(),
    updated_at: Date.now(),
    count: 0,
    icon: "",
    name: subscribe.name,
    url: subscribe.url,
    folder: subscribe.folder,
    sequence: subscribe.sequence,
  });
  // 异步获取图标
  (async () => {

    const favicon = await getFaviconUrl(subscribe.url);

    await mapper.updateById(item.id, {icon: favicon});
  })().catch(() => logError(`获取图标 ${subscribe.name} 失败`));

  // 第一次刷新

  refreshFeed(item.id).catch(() => logError(`第一次刷新 ${subscribe.name} 失败`));

}

export async function updateSubscribe(id: string, subscribe: SubscribeItemEdit) {
  const query = useSql().query<SubscribeItem>("subscribe_item")
  const mapper = useSql().mapper<SubscribeItem>("subscribe_item")
  // 获取旧的
  const old = await query.eq('id', id).one();
  if (!old) {
    // 没找到新增
    await addSubscribe(subscribe);
    return;
  }

  await mapper.updateById(id, {
    updated_at: Date.now(),
    name: subscribe.name,
    url: subscribe.url,
    folder: subscribe.folder,
    sequence: subscribe.sequence,
  });
  // 异步获取图标

  if (old.url !== subscribe.url) {
    // 链接发生改变，删除旧的全部 rss
    await useSql().beginTransaction(async (sql) => {
      const feedItemQuery = sql.query<FeedItem>("feed_item")
      await feedItemQuery.eq('subscribe_id', id).delete();
      const feedContentQuery = sql.query<FeedItem>("feed_content")
      await feedContentQuery.eq('subscribe_id', id).delete();
    });
    // 请求新的 rss
    refreshFeed(id)
      .then(() => {
        (async () => {
          const favicon = await getFaviconUrl(subscribe.url);
          await mapper.updateById(id, {icon: favicon});
        })().catch(() => logError(`获取图标 ${subscribe.name} 失败`));
      })
      .catch(() => logError(`第一次刷新 ${subscribe.name} 失败`));
  }

}

export async function removeSubscribe(id: string) {
  await useSql().beginTransaction(async (sql) => {
    const feedItemQuery = sql.query<FeedItem>("feed_item")
    await feedItemQuery.eq('subscribe_id', id).delete();
    const feedContentQuery = sql.query<FeedContent>("feed_content")
    await feedContentQuery.eq('subscribe_id', id).delete();
    const subscribeQuery = sql.query<SubscribeItem>("subscribe_item")
    await subscribeQuery.eq('id', id).delete();
  })
  localStorage.removeItem(LocalName.PAGE_SUBSCRIBE_VIEW_MODE(id));
}

export async function getSubscribe(id: string) {
  const query = useSql().query<SubscribeItem>("subscribe_item")
  const res = await query.eq('id', id).one();
  if (res && res.un_read_count > 0) {
    await useSubscribeStore().read(id)
  }
  return res || undefined;
}