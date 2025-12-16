import {debug, error, info} from '@tauri-apps/plugin-log';


export function logDebug(message: string) {
  debug(message);
}

export function logInfo(message: string) {
  info(message);
}

export function logError(message: string) {
  error(message);
}