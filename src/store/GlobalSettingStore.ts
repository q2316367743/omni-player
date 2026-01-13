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

  const modelOptions = computed(() => {
    return aiSetting.value.model.map(m => ({
      label: m,
      value: m
    }))
  })

  return {
    globalSetting,
    aiSetting,
    rssRefreshInterval,
    modelOptions
  }
})