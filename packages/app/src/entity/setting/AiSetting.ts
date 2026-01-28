export interface AiModel {
  label: string;
  value: string;

  /**
   * The model identifier, which can be referenced in the API endpoints.
   */
  id: string;

  /**
   * The Unix timestamp (in seconds) when the model was created.
   */
  created: number;

  /**
   * The object type, which is always "model".
   */
  object: 'model';

  /**
   * The organization that owns the model.
   */
  owned_by: string;
}

export interface AiSetting {

  /**
   * AI 类型
   */
  type: 'openai' | 'ollama'

  /**
   * 模型服务地址
   */
  url: string;

  /**
   * 密钥
   */
  key: string;

  /**
   * 启用的模型
   */
  model: Array<string>;

  /**
   * 支持深度思考的模型，默认为空，如果加入，则会出现是否启用深度思考的按钮
   */
  thinks: Array<string>;

  /**
   * 支持的模型
   */
  models: Array<AiModel>;

  /**
   * 超时时间
   */
  timeout: number;

  /**
   * 默认对话模型
   */
  defaultChatModel: string;

  /**
   * 默认话题命名模型
   */
  defaultTopicModel: string;

  /**
   * 搜索词构建模型
   */
  defaultSearchModel: string;

  /**
   * 默认嵌入模型
   */
  defaultEmbeddingModel: string;

}

export function buildAiSetting(): AiSetting {
  return {
    type: 'openai',
    url: "https://api.openai.com/v1",
    key: '',
    model: ["gpt-3.5-turbo"],
    thinks: [],
    defaultChatModel: "gpt-3.5-turbo",
    defaultTopicModel: '',
    defaultSearchModel: '',
    defaultEmbeddingModel: '',
    timeout: 15000,
    models: [
      {
        label: "GPT-3.5-Turbo",
        value: "gpt-3.5-turbo",
        id: "gpt-3.5-turbo",
        created: 0,
        object: "model",
        owned_by: "openai"
      },
      {
        label: "GPT-4",
        value: "gpt-4",
        id: "gpt-4",
        created: 0,
        object: "model",
        owned_by: "openai"
      }
    ]
  }
}