import {Client, Store, Stronghold} from '@tauri-apps/plugin-stronghold';
// 当设置 `"withGlobalTauri": true` 时，你可以用
// const { Client, Stronghold } = window.__TAURI__.stronghold;
import {appDataDir} from '@tauri-apps/api/path';
import {APP_NAME, APP_PASSWORD} from "@/global/Constants.ts";
// 当设置 `"withGlobalTauri": true` 时，你可以用
// const { appDataDir } = window.__TAURI__.path;


class StrongholdWrapper {
  private stronghold: Stronghold | null = null;
  private client: Client | null = null;
  private store: Store | null = null;

  private async getStronghold() {
    if (!this.stronghold) {
      const vaultPath = `${await appDataDir()}/vault.hold`;
      this.stronghold = await Stronghold.load(vaultPath, APP_PASSWORD);
    }
    return this.stronghold;
  }

  private async getClient() {
    if (!this.client) {
      const stronghold = await this.getStronghold();
      try {
        this.client = await stronghold.loadClient(APP_NAME);
      } catch {
        this.client = await stronghold.createClient(APP_NAME);
      }
    }
    return this.client;
  }

  private async getStore() {
    if (!this.store) {
      const client = await this.getClient();
      this.store = client.getStore();
    }
    return this.store;
  }

  /**
   * 插入一条记录
   * @param key 键
   * @param value 值
   * @param timeout 超时时间，默认0，不超时
   */
  async insertRecord(key: string, value: string, timeout = 0) {
    const store = await this.getStore();
    const data = Array.from(new TextEncoder().encode(JSON.stringify({
      timeout,
      value,
      start: Date.now()
    })));
    await store.insert(key, data);
  }

  async getRecord(key: string): Promise<string | null> {
    const store = await this.getStore();
    const data = await store.get(key);
    if (!data) return null;
    const text = new TextDecoder().decode(new Uint8Array(data));
    const obj = JSON.parse(text);
    if (obj.timeout > 0 && Date.now() - obj.start > obj.timeout) {
      await store.remove(key);
      return null;
    }
    return obj.value;
  }

  async getMediaRecord(serviceId: string, key: string) {
    return await this.getRecord(`/media/${serviceId}/${key}`);
  }

  async setMediaRecord(serviceId: string, key: string, value: string, timeout?: number) {
    return await this.insertRecord(`/media/${serviceId}/${key}`, value, timeout);
  }

  async removeMediaRecord(serviceId: string, key: string) {
    const store = await this.getStore();
    await store.remove(`/media/${serviceId}/${key}`);
  }

}

let strongholdWrapper: StrongholdWrapper | null = null;

export const useStronghold = () => {
  if (!strongholdWrapper) {
    strongholdWrapper = new StrongholdWrapper();
  }
  return strongholdWrapper;
}