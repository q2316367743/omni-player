import {
  type CollectionInfo,
  createCollection,
  getCollection,
  type PointInput,
  upsert
} from "@wiscale/tauri-plugin-velesdb";
import {logError} from "@/lib/log.ts";
import type {MemoChunk} from "@/entity/memo";
import {useSettingStore} from "@/store/GlobalSettingStore.ts";

class VelesdbWrap {

  private db: CollectionInfo | undefined = undefined;

  async getVelesdb() {
    if (this.db) return this.db;
    try {
      this.db = await getCollection("memo");
    } catch (e) {
      logError("未找到memo集合，创建memo集合", e);
      this.db = await createCollection({
        name: "memo",
        dimension: 768,
        metric: "cosine",
      });
    }
  }

  async addMemo(chunks: MemoChunk[]) {
    await this.getVelesdb();
    const now = Date.now();
    const points = new Array<PointInput>();
    const {createAiClient, aiSetting} = useSettingStore();
    // 向量化
    const openAI = createAiClient();

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]!;


      const newVar = await openAI.embeddings.create({
        input: chunk.content,
        model: aiSetting.defaultEmbeddingModel,
      });


      points.push({
        id: now + i,
        vector: newVar.data.flatMap(c => c.embedding),
        payload: {
          content: chunk.content,
          id: chunk.id,
          memo_id: chunk.memo_id,
        }
      });
    }


    await upsert({
      collection: 'memo',
      points: chunks.map((chunk, i) => ({
        id: now + i,
        vector: [1],
        payload: {
          content: chunk.content,
          id: chunk.id,
          memo_id: chunk.memo_id,
        }
      }))
    })
  }

}

const velesdb = new VelesdbWrap();

export const useVelesdb = () => {
  return velesdb;
}