import {defineStore} from "pinia";
import {LocalName} from "@/global/LocalName.ts";
import {buildGlobalSetting} from "@/entity/GlobalSetting.ts";

export const useGlobalSettingStore = defineStore("global-setting", () => {
  const globalSetting = useLocalStorage(LocalName.KEY_SETTING_GLOBAL, buildGlobalSetting());

  const playerModeType = computed(() => {
    return globalSetting.value.playerModeType;
  })

  return {
    globalSetting,
    playerModeType
  }
})