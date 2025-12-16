import {appDataDir, join} from "@tauri-apps/api/path";

export const APP_NAME = "omni-player";
export const APP_VERSION = "0.0.1";
export const APP_PASSWORD = "vpj13Q7AFKjpin"

export const APP_DATA_DIR = () => appDataDir();
export const APP_DATA_DB_PATH = async () => join(await APP_DATA_DIR(), "db.sqlite");
export const APP_DATA_STORE_PATH = async () => join(await APP_DATA_DIR(), "store.json");