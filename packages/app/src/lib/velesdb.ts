import {
  type CollectionInfo,
  createCollection, deletePoints,
  getCollection,
  type PointInput, textSearch,
  upsert
} from "@wiscale/tauri-plugin-velesdb";
import {logError, logInfo} from "@/lib/log.ts";
import {useSettingStore} from "@/store/GlobalSettingStore.ts";

interface VelesdbChunkPayload extends Record<string, any>{
  content: string;
}

interface VelesdbChunk {
  id: number;
  // 内容
  content: string;
  // 元数据
  payload: VelesdbChunkPayload;
}

class VelesdbWrap {

  private db: CollectionInfo | undefined = undefined;
  private readonly name: string;

  constructor(name: string) {
    this.name = name;
  }

  async getVelesdb() {
    if (this.db) return this.db;
    try {
      this.db = await getCollection(this.name);
    } catch (e) {
      logError("未找到memo集合，创建memo集合", e);
      this.db = await createCollection({
        name: this.name,
        dimension: 1536,
        metric: "cosine",
      });
    }
  }

  async addChunkBatch(chunks: Array<VelesdbChunk>) {
    await this.getVelesdb();
    const points = new Array<PointInput>();
    const {createAiClient, aiSetting} = useSettingStore();
    // 向量化
    const openAI = createAiClient();

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]!;


      const newVar = await openAI.embeddings.create({
        input: chunk.content,
        model: aiSetting.memoEmbeddingModel,
      });


      points.push({
        id: chunk.id,
        vector: newVar.data.flatMap(c => c.embedding),
        payload: chunk.payload
      });
    }


    await upsert({
      collection: this.name,
      points: points
    })
  }

  async query(query: string, topK: number = 10): Promise<Array<VelesdbChunkPayload>> {
    await this.getVelesdb();
    const res = await textSearch({
      collection: this.name,
      query: query,
      topK: topK,
    });
    return res.results.map(r => r.payload as VelesdbChunkPayload)
  }

  async delete(id: number) {
    await this.getVelesdb();
    await deletePoints({
      collection: this.name,
      ids: [id]
    })
  }

}

const memoVelesdb = new VelesdbWrap('memo');

memoVelesdb.getVelesdb()
  .then(() => logInfo("初始化 velesdb 成功"))
  .catch(e => logError("初始化 velesdb 失败", e));

export const useMemoVelesdb = () => {
  return memoVelesdb;
}