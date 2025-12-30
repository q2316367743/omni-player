import {debug, error, info} from '@tauri-apps/plugin-log';


function renderMessage(message: string, ...args: any[]) {
  return message + (args && args.length > 0 ? (": " + args.join(",")) : '');
}

export function logDebug(message: string, ...args: any[]) {
  debug(renderMessage(message, ...args));
}

export function logInfo(message: string, ...args: any[]) {
  info(renderMessage(message, ...args));
}

export function logError(message: string, ...args: any[]) {
  error(renderMessage(message, ...args));
}