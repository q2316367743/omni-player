import {defineStore} from "pinia";
import {LocalName} from "@/global/LocalName.ts";
import {buildGlobalSetting} from "@/entity/setting/GlobalSetting.ts";
import {buildAiSetting} from "@/entity/setting/AiSetting.ts";

export const useSettingStore = defineStore("setting", () => {
  const globalSetting = useLocalStorage(LocalName.KEY_SETTING_GLOBAL, buildGlobalSetting());
  const aiSetting = useLocalStorage(LocalName.KEY_SETTING_AI, buildAiSetting());

  const rssRefreshInterval = computed(() => {
    if (!globalSetting.value.rssRefreshInterval) return 15;
    return Math.max(15, globalSetting.value.rssRefreshInterval);
  })

  // AI 功能是否可用
  const aiEnabled = computed(() => {
    return aiSetting.value.url && aiSetting.value.key
  })
  const defaultChatModel = computed(() => aiSetting.value.defaultChatModel);

  const modelOptions = computed(() => {
    return aiSetting.value.model.map(m => ({
      label: m,
      value: m
    }))
  });

  /**
   * 是否支持深度思考
   * @param model 模型名称
   */
  const supportThink = (model: string) => {
    return aiSetting.value.thinks?.includes(model);
  }

  return {
    globalSetting,
    aiSetting,
    rssRefreshInterval,
    modelOptions,
    aiEnabled,
    defaultChatModel,
    supportThink
  }
})