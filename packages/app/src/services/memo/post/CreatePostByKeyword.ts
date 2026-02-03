import {countMemoPostForWeek, type MemoItemAdd} from "@/services/memo";
import {useMemoFriendStore} from "@/store";
import {aiMemoPostByKeyword} from "@/modules/ai/memo/AiMemoPostByKeyword.ts";
import {createMemoPost} from "@/services/memo/MemoPostService.ts";
import {logDebug, logInfo, logError} from "@/lib/log.ts";

interface CandidateFriend {
  friendId: string;
  matchedKeyword: string;
}

export async function createPostByKeyword(memo: MemoItemAdd) {
  logDebug('[CreatePostByKeyword] 开始基于关键字触发 AI 朋友圈', memo.content);
  
  const {friends, fetchFriend} = useMemoFriendStore();
  
  const now = Date.now();
  const currentHour = new Date(now).getHours();
  const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

  const candidates: CandidateFriend[] = [];

  for (const friend of friends) {
    if (friend.is_active !== 1) continue;
    
    const postingTriggers = friend.posting_triggers;
    if (!postingTriggers.includes('keyword')) continue;

    const triggerKeywords = friend.trigger_keywords;
    if (!triggerKeywords || triggerKeywords.length === 0) continue;

    const matchedKeyword = triggerKeywords.find(keyword => 
      memo.content.toLowerCase().includes(keyword.toLowerCase())
    );
    if (!matchedKeyword) continue;

    logDebug(`[CreatePostByKeyword] 朋友 ${friend.name} 匹配到关键字: ${matchedKeyword}`);

    const activeHours = friend.active_hours;
    if (currentHour < activeHours.start || currentHour >= activeHours.end) {
      logDebug(`[CreatePostByKeyword] 朋友 ${friend.name} 不在活跃时间段 (${activeHours.start}-${activeHours.end})`);
      continue;
    }

    const autopostIntervalHours = friend.autopost_interval_hours || 0;
    if (autopostIntervalHours > 0) {
      const timeSinceLastAutopost = now - (friend.last_autopost_at || 0);
      if (timeSinceLastAutopost < autopostIntervalHours * 60 * 60 * 1000) {
        logDebug(`[CreatePostByKeyword] 朋友 ${friend.name} 未达到自主发圈间隔 (${autopostIntervalHours}小时)`);
        continue;
      }
    }

    const maxPostsPerWeek = friend.max_posts_per_week || 0;
    if (maxPostsPerWeek > 0) {
      const recentPosts = await countMemoPostForWeek(friend.id, oneWeekAgo)
      if (recentPosts >= maxPostsPerWeek) {
        logDebug(`[CreatePostByKeyword] 朋友 ${friend.name} 已达到每周发圈上限 (${maxPostsPerWeek}条)`);
        continue;
      }
    }

    logInfo(`[CreatePostByKeyword] 朋友 ${friend.name} 符合发圈条件，加入候选列表`);
    candidates.push({
      friendId: friend.id,
      matchedKeyword
    });
  }

  if (candidates.length === 0) {
    logDebug('[CreatePostByKeyword] 没有找到符合条件的朋友');
    return;
  }

  const selectedCandidate = candidates[0];
  if (!selectedCandidate) return;
  
  const selectedFriend = friends.find(f => f.id === selectedCandidate.friendId);
  if (!selectedFriend) {
    logError('[CreatePostByKeyword] 未找到选中的朋友', selectedCandidate.friendId);
    return;
  }

  logInfo(`[CreatePostByKeyword] 选择朋友 ${selectedFriend.name} 发朋友圈，触发关键字: ${selectedCandidate.matchedKeyword}`);

  const f = await fetchFriend(selectedFriend.id);

  const postContent = await aiMemoPostByKeyword({
    memo,
    friend: f!
  });

  logDebug(`[CreatePostByKeyword] 生成朋友圈内容: ${postContent}`);
  if (!postContent.trim()) {
    // 没有生成内容
    logDebug(`[CreatePostByKeyword] 朋友 ${selectedFriend.name} 没有生成朋友圈内容`);
    return;
  }

  await createMemoPost({
    friend_id: selectedFriend.id,
    content: postContent,
    media_urls: '',
    location: '',
    triggered_by: `/memo/${memo.friend_ids}`,
    trigger_keyword: selectedCandidate.matchedKeyword
  });

  logInfo(`[CreatePostByKeyword] 朋友 ${selectedFriend.name} 朋友圈发布成功`);

  await useMemoFriendStore().updateFriendStatic(selectedFriend.id, {
    last_autopost_at: now
  });

  logDebug(`[CreatePostByKeyword] 更新朋友 ${selectedFriend.name} 最后发圈时间`);
}