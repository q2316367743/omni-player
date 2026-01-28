import type {MemoChunk, MemoItem, MemoItemCore} from "@/entity/memo";
import {useSql} from "@/lib/sql.ts";
import type {PageResponse} from "@/global/PageResponse.ts";
import {group} from "@/util";

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
  // 1. 新增 memo
  // 2. 进行分块
  // 3. 新增分块
  // 4. 向量化，存储向量
  // 5. 使用 AI 进行处理
}