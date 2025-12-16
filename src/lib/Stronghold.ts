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

  async insertRecord(key: string, value: string) {
    const store = await this.getStore();
    const data = Array.from(new TextEncoder().encode(value));
    await store.insert(key, data);
  }

  async getRecord(key: string): Promise<string | null> {
    const store = await this.getStore();
    const data = await store.get(key);
    if (!data) return null;
    return new TextDecoder().decode(new Uint8Array(data));
  }

}

let strongholdWrapper: StrongholdWrapper | null = null;

export const useStronghold = () => {
  if (!strongholdWrapper) {
    strongholdWrapper = new StrongholdWrapper();
  }
  return strongholdWrapper;
}