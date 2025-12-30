import {appDataDir, join} from "@tauri-apps/api/path";
import {useColorMode} from "@/hooks/ColorMode.ts";
import {useBoolState} from "@/hooks";

export const APP_NAME = "nor-regret";
export const APP_VERSION = "1.0.0";
export const APP_PASSWORD = "vpj13Q7AFKjpin"

export const APP_DATA_DIR = () => appDataDir();
export const APP_DATA_DB_PATH = async () => join(await APP_DATA_DIR(), "db.sqlite");
export const APP_DATA_VAULT_PATH = async (vaultName: string) => join(await APP_DATA_DIR(), `${vaultName}.hold`);
export const APP_DATA_STORE_PATH = async (storeName: string) => join(await APP_DATA_DIR(), `${storeName}.json`);
export const APP_DATA_NOTE_PATH = async () => join(await APP_DATA_DIR(), 'note');

export const {colorMode, isDark} = useColorMode();

export const toggleColorMode = () => {
  colorMode.value = colorMode.value === 'light' ? 'dark' : 'light';
}

export const SUPPORT_MOVIE = /mp4|mkv|flv/i

export const DB_MIGRATE_FILES = [{
  file: 'lib/migrate/0000_init.sql',
  version: 0
}];

export const [collapsed, toggleCollapsed] = useBoolState( false);