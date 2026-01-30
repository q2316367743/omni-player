import type {MemoChunk, MemoComment, MemoItem, MemoItemCore} from "@/entity/memo";
import {useSql} from "@/lib/sql.ts";
import type {PageResponse} from "@/global/PageResponse.ts";
import {group} from "@/util";
import {chunkMemo} from "@/util/text/ChunkUtil.ts";
import {useMemoVelesdb} from "@/lib/velesdb.ts";
import {aiMemoAnalyzer} from "@/modules/ai/memo/AiMemoAnalyzer.ts";
import {useMemoFriendStore} from "@/store/MemoFriendStore.ts";
import {aiMemoComment} from "@/modules/ai/memo/AiMemoComment.ts";

export interface MemoCommentView extends MemoComment {
  reply: Array<MemoComment>;
}

export interface MemoItemView extends MemoItem {
  content: string;
  // 评论信息
  comments: Array<MemoCommentView>
}

export async function pageMemoItem(pageNum: number, pageSize: number): Promise<PageResponse<MemoItemView>> {
  const itemPage = await useSql().query<MemoItem>('memo_item')
  .orderByDesc('created_at')
  .page(pageNum, pageSize);
  if (itemPage.records.length === 0) {
    return {
      records: [],
      total: itemPage.total,
      pageNum,
      pageSize,
    };
  }
  const itemIds = itemPage.records.map(e => e.id);
  const chunks = await useSql().query<MemoChunk>('memo_chunk').in('memo_id', itemIds).list();
  const chunkMap = group(chunks, 'memo_id');

  // 获取全部相关的评论
  const comments = await useSql().query<MemoComment>('memo_comment').in('memo_id', itemIds).list();
  // 分组
  const commentMap = group(comments, 'memo_id');

  return {
    ...itemPage,
    records: itemPage.records.map(item => {
      const chunks = chunkMap.getOrDefault(item.id, []);
      // 构建两级评论结构：顶级评论 + 回复（回复不会再有子回复）
      const allComments = commentMap.getOrDefault(item.id, []);
      const topLevel = allComments.filter((c: MemoComment) => !c.parent_id);
      const replies = allComments.filter((c: MemoComment) => !!c.parent_id);

      // 将回复按 parent_id 归组，并包装为 MemoCommentView，且其 nested reply 置空
      const replyGroups = group(replies, 'parent_id');

      const commentsView: Array<MemoCommentView> = topLevel.map(t => ({
        ...t,
        reply: replyGroups.getOrDefault(t.id, []).sort((a, b) => a.created_at - b.created_at)
      }));

      return {
        ...item,
        content: chunks
          .sort((a, b) => a.index - b.index)
          .map(chunk => chunk.content)
          .join('\n\n'),
        comments: commentsView.sort((a, b) => a.created_at - b.created_at)
      };
    }),
  };
}

export interface MemoItemAdd extends MemoItemCore {
  content: string;
}

/**
 * 新增 memo
 * @param data
 */
export async function addMemoService(data: MemoItemAdd) {
  let now = Date.now();
  // 先分段
  const chunks = chunkMemo(data.content);
  // 1. 新增 memo
  const newMemo = await useSql().mapper<MemoItem>('memo_item').insert({
    type: data.type,
    friend_ids: data.friend_ids,
    consumed: 0,
    created_at: now,
    updated_at: now,
  });
  // 2. 进行分块
  let index = 0;
  const chunkDbs = new Array<MemoChunk>();
  for (const chunk of chunks) {
    // 3. 新增分块
    const res = await useSql().mapper<MemoChunk>('memo_chunk').insert({
      memo_id: newMemo.id,
      content: chunk,
      index: index,
      created_at: now,
      updated_at: now,
    });
    index += 1;
    now += 1;
    chunkDbs.push(res);
  }
  if (data.type !== "normal") {
    // 如果不是 normal 的话，就不需要向量化了
    return;
  }
  // 4. 向量化，存储向量
  await useMemoVelesdb().addChunkBatch(chunkDbs.map(e => ({
    id: e.created_at,
    content: e.content,
    payload: {
      id: e.id,
      content: e.content,
      memo_id: e.memo_id,
    }
  })))
  // 5. 使用 AI 进行处理
  if (data.type === "normal") {
    aiMemoAnalyzer({
      memoContent: data.content,
      sourceId: newMemo.id,
      source: 'memo'
    }).finally(() => {
      // 消费
      useSql().mapper<MemoItem>('memo_item').updateById(newMemo.id, {
        consumed: 1
      })
    });
  }
  // 6. 如果 @ 了 AI，需要 AI 进行回复
  if (data.friend_ids !== '') {
    // 存在 @
    const friendIds = data.friend_ids.split(",");
    friendIds.forEach((friendId) => {
      const {friendMap} = useMemoFriendStore();
      const friend = friendMap.get(friendId);
      if (!friend) return;
      aiMemoComment({
        friend,
        memo: data
      }).then(comment => {
        useSql().mapper<MemoComment>('memo_comment').insert({
          memo_id: newMemo.id,
          content: comment,
          created_at: now,
          updated_at: now,
          friend_id: friendId
        })
      })
    })
  }
}


export async function removeMemoService(id: string) {
  // 查询全部的分块
  const chunks = await useSql().query<MemoChunk>('memo_chunk').eq('memo_id', id).select('id').list();
  // 查询全部的评论
  const comments = await useSql().query<MemoComment>('memo_comment').eq('memo_id', id).select('id').list();
  // 删除
  for (const chunk of chunks) {
    await useMemoVelesdb().delete(chunk.created_at);
  }
  for (const comment of comments) {
    await useMemoVelesdb().delete(comment.created_at);
  }
  // 删除分块
  await useSql().query<MemoChunk>('memo_chunk').eq('memo_id', id).delete();
  // 删除评论
  await useSql().query<MemoComment>('memo_comment').eq('memo_id', id).delete();
  // 删除自身
  await useSql().mapper<MemoItem>('memo_item').deleteById(id);
}