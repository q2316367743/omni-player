<template>
  <div class="abs-0 overflow-hidden">
    <router-view />
  </div>
</template>
<script lang="ts" setup>
import {setupRefreshFeedTask} from "@/modules/subscribe/RefreshFeedTask.ts";
import {logError, logInfo} from "@/lib/log.ts";
import {useMemoFriendStore} from "@/store/MemoFriendStore.ts";

// 注册定时刷新任务
setupRefreshFeedTask()
  .then(() => logInfo("注册定时刷新任务成功"))
  .catch(e => logError("注册定时刷新任务失败", e))
// setupWindow()
//   .then(() => logInfo("注册窗口隐藏事件成功"))
//   .catch(e => logError("注册窗口隐藏事件失败", e))

// 获取全部 memo 好友
useMemoFriendStore().loadFriends();
</script>
<style scoped lang="less">
.app-content {
  transform: scale(1);
}
</style>
