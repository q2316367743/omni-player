import {defineStore} from "pinia";
import {LocalName} from "@/global/LocalName.ts";
import {buildGlobalSetting} from "@/entity/setting/GlobalSetting.ts";
import {buildAiSetting} from "@/entity/setting/AiSetting.ts";
import OpenAI from "openai";
import {getTauriFetch} from "@/lib/http.ts";
import {buildUserSetting, userToPrompt} from "@/entity/setting/UserSetting.ts";
import type {MemoFriendView} from "@/entity/memo";
import {buildDevSetting} from "@/entity/setting/DevSetting.ts";

export const useSettingStore = defineStore("setting", () => {
  const globalSetting = useLocalStorage(LocalName.KEY_SETTING_GLOBAL, buildGlobalSetting());
  const aiSetting = useLocalStorage(LocalName.KEY_SETTING_AI, buildAiSetting());
  const userSetting = useLocalStorage(LocalName.KEY_SETTING_USER, buildUserSetting());
  const devSetting = useLocalStorage(LocalName.KEY_SETTING_DEV, buildDevSetting());

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
  const debug = computed(() => devSetting.value.debug);
  const userAvatar = computed(() => userSetting.value.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=me');
  const userNickname = computed(() => userSetting.value.nickname || '主人');


  const userPrompt = (friend?: MemoFriendView) => userToPrompt(userSetting.value, friend);

  /**
   * 是否支持深度思考
   * @param model 模型名称
   */
  const supportThink = (model: string) => {
    return aiSetting.value.thinks?.includes(model);
  }

  const createAiClient = () => {
    return new OpenAI({
      baseURL: aiSetting.value.url,
      apiKey: aiSetting.value.key,
      timeout: aiSetting.value.timeout,
      dangerouslyAllowBrowser: true,
      fetch: getTauriFetch()
    });
  }


  const thinkParam = (model: string, think: boolean) => {
    if (supportThink(model)) {
      return {thinking: {type: think ? 'enabled' : 'disabled'}}
    }
    return {};
  }

  const disableThinkParam = (model: string) => {
    return thinkParam(model, false);
  }

  return {
    globalSetting,
    aiSetting,
    rssRefreshInterval,
    modelOptions,
    aiEnabled,
    defaultChatModel,
    userSetting,
    devSetting,
    debug,
    userAvatar,
    userNickname,
    userPrompt,
    createAiClient,
    supportThink,
    thinkParam,
    disableThinkParam
  }
})