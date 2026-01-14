import {listSubscribe} from "@/services";
import {refreshFeed} from "@/services/FeedService.ts";
import {logError, logInfo} from "@/lib/log.ts";
import {useSettingStore} from "@/store/GlobalSettingStore.ts";


export async function setupRefreshFeedTask() {

  const now = Date.now();
  try {

    // 获取所有订阅
    const subscribes = await listSubscribe();
    for (const subscribe of subscribes) {
      // 刷新
      if (now - subscribe.updated_at < Math.abs((useSettingStore().rssRefreshInterval - 2) * 60 * 1000)) {
        logInfo(`${subscribe.name} 距上次刷新时间不足 ${useSettingStore().rssRefreshInterval} 分钟，跳过刷新`);
        continue;
      }
      try {
        logInfo(`开始刷新订阅：${subscribe.name}`)
        await refreshFeed(subscribe.id);
      } catch (e) {
        logError(`刷新 ${subscribe.name} 失败`, e);
      }
    }

  } finally {
    // 15 分钟后重新执行
    setTimeout(setupRefreshFeedTask, useSettingStore().rssRefreshInterval * 60 * 1000)
  }


}