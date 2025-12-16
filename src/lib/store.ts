import {Store} from "@tauri-apps/plugin-store";
import {APP_DATA_STORE_PATH} from "@/global/Constants";


class StoreWrapper {
  private store: Store | null = null;

  private async getStore() {
    if (!this.store) {
      this.store = await Store.load(await APP_DATA_STORE_PATH());
    }
    return this.store;
  }

  async get<T = any>(key: string) {
    const store = await this.getStore();
    return store.get<T>(key);
  }

  async set<T>(key: string, value: T) {
    const store = await this.getStore();
    await store.set(key, value);
    await store.save();
  }

  async delete(key: string) {
    const store = await this.getStore();
    return store.delete(key);
  }

  async list<T = any>(key: string) {
    const store = await this.getStore();
    const res = await store.get<Array<T>>(key);
    return res || [];
  }

  async save<T = any>(key: string, value: Array<T>) {
    const store = await this.getStore();
    await store.set(key, value);
    await store.save();
  }
}

let instance = new StoreWrapper();

export const useStore = () => instance;