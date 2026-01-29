import type {MemoChunk, MemoItem, MemoItemCore} from "@/entity/memo";
import {useSql} from "@/lib/sql.ts";
import type {PageResponse} from "@/global/PageResponse.ts";
import {group} from "@/util";
import {chunkMemo} from "@/util/text/ChunkUtil.ts";
import {useMemoVelesdb} from "@/lib/velesdb.ts";

export interface MemoItemView extends MemoItem {
  content: string;
}

export interface MemoItemAdd extends MemoItemCore {
  content: string;
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

  return {
    ...itemPage,
    records: itemPage.records.map(item => {
      const chunks = chunkMap.get(item.id) || [];
      return {
        ...item,
        content: chunks
          .sort((a, b) => a.index - b.index)
          .map(chunk => chunk.content)
          .join('\n'),
      };
    }),
  };
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
}