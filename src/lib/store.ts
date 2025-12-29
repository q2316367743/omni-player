import {Store} from "@tauri-apps/plugin-store";
import {APP_DATA_STORE_PATH} from "@/global/Constants";


class StoreWrapper {

  private readonly storeName: string
  private store: Store | null = null;

  constructor(storeName: string) {
    this.storeName = storeName;
  }

  private promiseChain: Promise<unknown> = Promise.resolve();

  async getStore(): Promise<Store> {
    // 将新的 SQL 调用追加到 Promise 链尾部
    this.promiseChain = this.promiseChain
      .then(() => this._getStore())
      .catch((err) => {
        console.error('get store error:', err);
        throw err; // 保证错误能被调用者捕获
      });

    return this.promiseChain as Promise<Store>;
  }

  private async _getStore() {
    if (!this.store) {
      this.store = await Store.load(await APP_DATA_STORE_PATH(this.storeName));
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

const instance = new StoreWrapper("store");

export const useStore = () => instance;

const todoStore = new StoreWrapper("todo");

export const useTodoStore = () => todoStore;