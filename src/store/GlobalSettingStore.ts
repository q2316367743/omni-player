import {defineStore} from "pinia";
import {platform} from "@tauri-apps/plugin-os";
import {LocalName} from "@/global/LocalName.ts";
import {buildGlobalSetting} from "@/entity/GlobalSetting.ts";

export const useGlobalSettingStore = defineStore("global-setting", () => {
  const globalSetting = useLocalStorage(LocalName.KEY_SETTING_GLOBAL, buildGlobalSetting());

  const playerModeType = computed(() => {
    if (platform() === "windows") {
      return globalSetting.value.playerModeType;
    }
    return "h5"
  })

  return {
    globalSetting,
    playerModeType
  }
})