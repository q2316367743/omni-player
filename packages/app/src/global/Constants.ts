import {appDataDir, join} from "@tauri-apps/api/path";
import {exists, mkdir} from "@tauri-apps/plugin-fs";
import {useColorMode} from "@/hooks/ColorMode.ts";
import {useBoolState} from "@/hooks";

export const APP_NAME = "xiaohei";
export const APP_VERSION = "1.0.0";
export const APP_PASSWORD = "vpj13Q7AFKjpin"

export const APP_DATA_DIR = () => appDataDir();
export const APP_DATA_ASSET_DIR = async () => join(await APP_DATA_DIR(), "asset");
export const APP_DATA_DB_DIR = async () => join(await APP_DATA_DIR(), "db");
export const APP_DATA_STORE_DIR = async () => join(await APP_DATA_DIR(), "store");
export const APP_DATA_HOLD_DIR = async () => join(await APP_DATA_DIR(), "hold");


export const APP_DATA_DB_PATH = async (fileName:string) => join(await APP_DATA_DB_DIR(), `${fileName}.sqlite`);
export const APP_DATA_VAULT_PATH = async (vaultName: string) => join(await APP_DATA_HOLD_DIR(), `${vaultName}.hold`);
export const APP_DATA_STORE_PATH = async (storeName: string) => join(await APP_DATA_STORE_DIR(), `${storeName}.json`);
export const APP_DATA_NOTE_PATH = async () => join(await APP_DATA_DIR(), 'note');

export const initPath = async () => {
  const items = await Promise.all([
    APP_DATA_ASSET_DIR(),
    APP_DATA_DB_DIR(),
    APP_DATA_STORE_DIR(),
    APP_DATA_HOLD_DIR(),
    APP_DATA_NOTE_PATH()
  ])
  for (const dir of items) {
    if (!await exists(dir)) {
      await mkdir(dir, {
        recursive: true
      })
    }
  }
};

export const {colorMode, isDark} = useColorMode();


// 主要
export const MAIN_MIGRATE_FILES = [{
  file: 'lib/migrate/0000_main.sql',
  version: 0
}];

// 小程序
export const MP_MIGRATE_FILES = [{
  file: 'lib/migrate/0000_init.sql',
  version: 0
}];

export const MEMO_MIGRATE_FILES = [{
  file: 'lib/migrate/0000_memo.sql',
  version: 0
}];

export const AI_RT_MIGRATE_FILES = [{
  file: 'lib/migrate/0000_ai-rt.sql',
  version: 0
}];

export const SP_MIGRATE_FILES = [{
  file: 'lib/migrate/0000_sp.sql',
  version: 0
}];

export const [collapsed, toggleCollapsed] = useBoolState( false);