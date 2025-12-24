import axios, {type AxiosRequestConfig} from "axios";
import {fetch} from '@tauri-apps/plugin-http'

export type Method =
  | 'get' | 'GET'
  | 'delete' | 'DELETE'
  | 'head' | 'HEAD'
  | 'options' | 'OPTIONS'
  | 'post' | 'POST'
  | 'put' | 'PUT'
  | 'patch' | 'PATCH'
  | 'purge' | 'PURGE'
  | 'link' | 'LINK'
  | 'unlink' | 'UNLINK';

const instance = axios.create({
  timeout: 150000,
  adapter: 'fetch',
  env: {
    fetch: fetch
  }
  // 配置代理等信息
});

instance.interceptors.response.use(e => {
  console.debug(e)
  return e;
}, e => {
  console.error(e);
  return Promise.reject(e);
})

export interface RequestConfig extends AxiosRequestConfig {

}

export function requestAction<T = Record<string, any>>(config: RequestConfig) {
  return instance.request<T>(config);
}

export function getAction<T = Record<string, any>>(url: string, params?: Record<string, any>, config?: RequestConfig) {
  return instance.get<T>(url, {
    ...config,
    params
  });
}

export function postAction<T = Record<string, any>>(url: string, data?: Record<string, any>, config?: RequestConfig) {
  return instance.post<T>(url, data, config);
}