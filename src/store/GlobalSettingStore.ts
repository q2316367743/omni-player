import {defineStore} from "pinia";
import {LocalName} from "@/global/LocalName.ts";
import {buildGlobalSetting} from "@/entity/GlobalSetting.ts";

export const useGlobalSettingStore = defineStore("global-setting", () => {
  const globalSetting = useLocalStorage(LocalName.KEY_SETTING_GLOBAL, buildGlobalSetting());

  const rssRefreshInterval = computed(() => {
    if (!globalSetting.value.rssRefreshInterval) return 15;
    return Math.max(15, globalSetting.value.rssRefreshInterval);
  })

  return {
    globalSetting,
    rssRefreshInterval
  }
})