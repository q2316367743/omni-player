import type {MemoChunk, MemoComment, MemoCommentCore, MemoItem, MemoItemCore} from "@/entity/memo";
import {useSql} from "@/lib/sql.ts";
import type {PageResponse} from "@/global/PageResponse.ts";
import {group} from "@/util";
import {chunkMemo} from "@/util/text/ChunkUtil.ts";
import {useMemoVelesdb} from "@/lib/velesdb.ts";
import {aiMemoAnalyzer} from "@/modules/ai/AiMemoAnalyzer.ts";

export interface MemoCommentView extends MemoCommentCore{
  reply: Array<MemoCommentView>;
}

export interface MemoItemView extends MemoItem {
  content: string;
  // 评论信息
  comments: Array<MemoCommentView>
}

export async function pageMemoItem(pageNum: number, pageSize: number): Promise<PageResponse<MemoItemView>> {
  const itemPage = await useSql().query<MemoItem>('memo_item').page(pageNum, pageSize);
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
      const chunks = chunkMap.get(item.id) || [];
      return {
        ...item,
        content: chunks
          .sort((a, b) => a.index - b.index)
          .map(chunk => chunk.content)
          .join('\n\n'),
        comments: commentMap.get(item.id) || []
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
  const now = Date.now();
  // 先分段
  const chunks = chunkMemo(data.content);
  // 1. 新增 memo
  const newMemo = await useSql().mapper<MemoItem>('memo_item').insert({
    ...data,
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
    });
    index += 1;
    chunkDbs.push(res);
  }
  if (data.type !== "normal") {
    // 如果不是 normal 的话，就不需要向量化了
    return;
  }
  // 4. 向量化，存储向量
  await useMemoVelesdb().addChunkBatch(chunkDbs.map(e => ({
    content: e.content,
    payload: {
      id: e.id,
      content: e.content,
      memo_id: e.memo_id,
    }
  })))
  // 5. 使用 AI 进行处理
  if (data.type === "normal") {
    await aiMemoAnalyzer({
      memoContent: data.content,
      sourceId: newMemo.id,
      source: 'memo'
    });
  }
}