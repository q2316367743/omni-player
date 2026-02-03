import type {MemoPost} from "@/entity/memo";
import {useMemoFriendStore} from "@/store";
import {aiMemoPostComment} from "@/modules/ai/memo/AiMemoPostComment.ts";
import {addMemoPostComment} from "@/services/memo/MemoPostCommentService.ts";
import {updateMemoFriendDynamic} from "@/services/memo/MemoFriendService.ts";
import {logDebug, logInfo, logError} from "@/lib/log.ts";

interface CandidateFriend {
  friendId: string;
  matchedKeyword: string;
}

export async function createPostComment(post: MemoPost) {
  logDebug('[CreatePostComment] 开始基于关键字触发 AI 评论', post.content);
  
  const {friends, fetchFriend} = useMemoFriendStore();
  
  const now = Date.now();
  const currentHour = new Date(now).getHours();

  const candidates: CandidateFriend[] = [];

  for (const friend of friends) {
    if (friend.is_active !== 1) continue;
    
    if (!friend.posting_triggers.includes('keyword')) continue;

    const triggerKeywords = friend.trigger_keywords;
    if (!triggerKeywords || triggerKeywords.length === 0) continue;

    const matchedKeyword = triggerKeywords.find(keyword => 
      post.content.toLowerCase().includes(keyword.toLowerCase())
    );
    if (!matchedKeyword) continue;

    logDebug(`[CreatePostComment] 朋友 ${friend.name} 匹配到关键字: ${matchedKeyword}`);

    const activeHours = friend.active_hours;
    if (currentHour < activeHours.start || currentHour >= activeHours.end) {
      logDebug(`[CreatePostComment] 朋友 ${friend.name} 不在活跃时间段 (${activeHours.start}-${activeHours.end})`);
      continue;
    }

    logInfo(`[CreatePostComment] 朋友 ${friend.name} 符合评论条件，加入候选列表`);
    candidates.push({
      friendId: friend.id,
      matchedKeyword
    });
  }

  if (candidates.length === 0) {
    logDebug('[CreatePostComment] 没有找到符合条件的朋友');
    return;
  }

  for (const candidate of candidates) {
    const friend = friends.find(f => f.id === candidate.friendId);
    if (!friend) {
      logError('[CreatePostComment] 未找到选中的朋友', candidate.friendId);
      continue;
    }

    logInfo(`[CreatePostComment] 朋友 ${friend.name} 开始生成评论，触发关键字: ${candidate.matchedKeyword}`);

    const f = await fetchFriend(friend.id);


    const commentContent = await aiMemoPostComment({
      friend: f!,
      post,
      keyword: candidate.matchedKeyword
    });

    logDebug(`[CreatePostComment] 生成评论内容: ${commentContent}`);
    if (!commentContent.trim()) {
      logDebug(`[CreatePostComment] 朋友 ${friend.name} 没有生成评论内容`);
      continue;
    }

    await addMemoPostComment({
      post_id: post.id,
      friend_id: friend.id,
      content: commentContent
    });

    logInfo(`[CreatePostComment] 朋友 ${friend.name} 评论发布成功`);

    await updateMemoFriendDynamic(friend.id, {
      last_interaction: now
    });

    logDebug(`[CreatePostComment] 更新朋友 ${friend.name} 最后互动时间`);
  }
}