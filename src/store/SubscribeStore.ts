import {defineStore} from "pinia";
import type {SubscribeItem} from "@/entity/subscribe";
import {listSubscribe} from "@/services";

export const useSubscribeStore = defineStore('subscribe', () => {
  const subscribes = ref<Array<SubscribeItem>>([]);

  const refresh = () => {
    listSubscribe().then(res => {
      subscribes.value = res;
    });
  }
  refresh();

  return {
    subscribes,
    refresh
  }

})