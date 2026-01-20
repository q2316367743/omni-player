import type {RequestConfig} from "../shard/RequestConfig";

export async function UrlParser(rule: string): Promise<RequestConfig> {
  const parts = rule.split(',');
  let url: string;
  let optionsStr: string;

  if (parts.length < 2) {
    return { url: rule.trim() };
  }

  url = parts[0]!.trim();
  optionsStr = parts.slice(1).join(',');

  const isJsMode = /^\s*(var|let|const|function)\s+/m.test(optionsStr);

  if (isJsMode) {
    try {
      const executeJs = new Function(`
        ${optionsStr}
        return result;
      `);
      const result = executeJs();

      if (typeof result !== 'string') {
        throw new Error('JS mode must return a string');
      }

      const resultParts = result.split(',');
      if (resultParts.length < 2) {
        throw new Error('Invalid JS mode result format');
      }

      url = resultParts[0]!.trim();
      optionsStr = resultParts.slice(1).join(',');
    } catch (error: any) {
      throw new Error(`JS execution failed: ${error.message}`);
    }
  }

  let option: any;
  try {
    option = JSON.parse(optionsStr);
  } catch (error: any) {
    throw new Error(`JSON parse failed: ${error.message}`);
  }

  const config: RequestConfig = { url };

  if (option.baseURL !== undefined && option.baseURL !== null) {
    const baseURLVal = option.baseURL;
    if (typeof baseURLVal === 'string') {
      (config as { baseURL?: string }).baseURL = baseURLVal;
    } else {
      (config as { baseURL?: string }).baseURL = String(baseURLVal);
    }
  }

  if (option.method) {
    const methodVal = option.method;
    const methodStr = typeof methodVal === 'string' ? methodVal.toUpperCase() : String(methodVal).toUpperCase();
    (config as { method?: string }).method = methodStr;
  }

  if (option.headers) {
    config.headers = option.headers;
  } else {
    config.headers = {};
  }

  if (option.params) {
    config.params = option.params;
  }
  if (option.webView) {
    config.webview = option.webView;
  }

  if (option.timeout !== undefined && option.timeout !== null) {
    config.timeout = Number(option.timeout);
  }

  if (option.timeoutErrorMessage) {
    config.timeoutErrorMessage = String(option.timeoutErrorMessage);
  }

  if (option.withCredentials !== undefined) {
    config.withCredentials = Boolean(option.withCredentials);
  }

  if (option.responseType) {
    config.responseType = option.responseType;
  }

  if (option.paramsSerializer) {
    config.paramsSerializer = option.paramsSerializer;
  }

  const writingMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
  if (option.body && writingMethods.includes(String(config.method).toUpperCase())) {
    const body = option.body;
    config.data = typeof body === 'string' ? body : JSON.stringify(body);
  }

  if (option.charset) {
    config.responseEncoding = option.charset;
  }

  if (option.maxBodyLength !== undefined) {
    config.maxBodyLength = Number(option.maxBodyLength);
  }

  if (option.maxContentLength !== undefined) {
    config.maxContentLength = Number(option.maxContentLength);
  }

  return config;
}
