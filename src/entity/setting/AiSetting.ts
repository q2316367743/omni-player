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
   * 模型服务地址
   */
  url: string;

  /**
   * 密钥
   */
  key: string;

  /**
   * 模型名称
   */
  model: Array<string>;

  /**
   * 支持的模型
   */
  models: Array<AiModel>;

  /**
   * 超时时间
   */
  timeout: number;

}

export function buildAiSetting(): AiSetting {
  return {
    url: "https://api.openai.com/v1",
    key: '',
    model: ["gpt-3.5-turbo"],
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