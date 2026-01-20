import type {AxiosRequestConfig} from "axios";

export interface RequestConfig extends AxiosRequestConfig {
  webview?: boolean;
  charset?: string;
}