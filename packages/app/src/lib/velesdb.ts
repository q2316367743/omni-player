import {
  type CollectionInfo,
  createCollection,
  getCollection,
  type PointInput,
  upsert
} from "@wiscale/tauri-plugin-velesdb";
import {logError} from "@/lib/log.ts";
import {useSettingStore} from "@/store/GlobalSettingStore.ts";

interface VelesdbChunk {
  // 内容
  content: string;
  // 元数据
  payload: Record<string, any>;
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
        dimension: 768,
        metric: "cosine",
      });
    }
  }

  async addChunkBatch(chunks: Array<VelesdbChunk>) {
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
        payload: chunk.payload
      });
    }


    await upsert({
      collection: this.name,
      points: points
    })
  }

}

const memoVelesdb = new VelesdbWrap('memo');

export const useMemoVelesdb = () => {
  return memoVelesdb;
}