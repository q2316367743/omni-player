<template>
  <app-tool-layout title="简单请求">
    <div class="http-request-tool">
      <div class="request-bar">
        <t-select v-model="method" :options="methodOptions" class="method-select"/>
        <t-input v-model="url" placeholder="输入请求地址" class="url-input" @press-enter="sendRequest"/>
        <t-button theme="primary" :loading="loading" @click="sendRequest">发送请求</t-button>
      </div>

      <HorizontalSplitPanel :default-top-height="40" :min-top-height="20" :min-bottom-height="20">
        <template #top>
          <div class="request-section">
            <t-tabs v-model="requestTab">
              <t-tab-panel value="params" label="Params">
                <t-table
                  :data="params"
                  :columns="tableColumns"
                  size="small"
                  bordered
                  :pagination="{ disabled: true }"
                >
                  <template #enabled="{ row }">
                    <t-checkbox v-model="row.enabled"/>
                  </template>
                  <template #key="{ row }">
                    <t-input v-model="row.key" size="small" placeholder="Key"/>
                  </template>
                  <template #value="{ row }">
                    <t-input v-model="row.value" size="small" placeholder="Value"/>
                  </template>
                  <template #action="{ rowIndex }">
                    <t-button theme="danger" variant="text" size="small" @click="removeRow('params', rowIndex)">
                      <template #icon>
                        <delete-icon/>
                      </template>
                    </t-button>
                  </template>
                </t-table>
                <t-button theme="default" variant="dashed" size="small" class="add-row-btn" @click="addRow('params')">
                  <template #icon>
                    <add-icon/>
                  </template>
                  添加参数
                </t-button>
              </t-tab-panel>

              <t-tab-panel value="body" label="Body" v-if="method !== 'GET' && method !== 'get'">
                <t-radio-group v-model="bodyType" variant="default-filled" class="body-type-group">
                  <t-radio-button value="json">JSON</t-radio-button>
                  <t-radio-button value="text">Text</t-radio-button>
                  <t-radio-button value="form-data">Form Data</t-radio-button>
                  <t-radio-button value="x-www-form-urlencoded">x-www-form-urlencoded</t-radio-button>
                </t-radio-group>

                <div v-if="bodyType === 'json' || bodyType === 'text'" class="body-editor">
                  <MonacoEditor
                    v-model="bodyContent"
                    :language="bodyType === 'json' ? 'json' : 'plaintext'"
                    height="400px"
                  />
                </div>

                <t-table
                  v-else
                  :data="formData"
                  :columns="tableColumns"
                  size="small"
                  bordered
                  :pagination="{ disabled: true }"
                >
                  <template #enabled="{ row }">
                    <t-checkbox v-model="row.enabled"/>
                  </template>
                  <template #key="{ row }">
                    <t-input v-model="row.key" size="small" placeholder="Key"/>
                  </template>
                  <template #type="{ row }">
                    <t-select v-model="row.type" size="small"
                              :options="[{ label: 'Text', value: 'text' }, { label: 'File', value: 'file' }]"/>
                  </template>
                  <template #value="{ row }">
                    <t-input v-if="row.type === 'text'" v-model="row.value" size="small" placeholder="Value"/>
                    <div v-else class="file-input-wrapper">
                      <input
                        type="file"
                        :ref="el => { if (el) fileInputRefs[row.key] = el as any }"
                        @change="(e: any) => handleFileChange(e, row)"
                        style="display: none"
                      />
                      <t-input
                        :value="row.file?.name || row.value"
                        size="small"
                        placeholder="选择文件"
                        readonly
                        @click="triggerFileUpload(row)"
                      />
                    </div>
                  </template>
                  <template #action="{ rowIndex }">
                    <t-button theme="danger" variant="text" size="small" @click="removeRow('formData', rowIndex)">
                      <template #icon>
                        <delete-icon/>
                      </template>
                    </t-button>
                  </template>
                </t-table>
                <t-button
                  v-if="bodyType === 'form-data' || bodyType === 'x-www-form-urlencoded'"
                  theme="default"
                  variant="dashed"
                  size="small"
                  class="add-row-btn"
                  @click="addRow('formData')"
                >
                  <template #icon>
                    <add-icon/>
                  </template>
                  添加参数
                </t-button>
              </t-tab-panel>

              <t-tab-panel value="headers" label="Headers">
                <t-table
                  :data="headers"
                  :columns="tableColumns"
                  size="small"
                  bordered
                  :pagination="{ disabled: true }"
                >
                  <template #enabled="{ row }">
                    <t-checkbox v-model="row.enabled"/>
                  </template>
                  <template #key="{ row }">
                    <t-input v-model="row.key" size="small" placeholder="Key"/>
                  </template>
                  <template #value="{ row }">
                    <t-input v-model="row.value" size="small" placeholder="Value"/>
                  </template>
                  <template #action="{ rowIndex }">
                    <t-button theme="danger" variant="text" size="small" @click="removeRow('headers', rowIndex)">
                      <template #icon>
                        <delete-icon/>
                      </template>
                    </t-button>
                  </template>
                </t-table>
                <t-button theme="default" variant="dashed" size="small" class="add-row-btn" @click="addRow('headers')">
                  <template #icon>
                    <add-icon/>
                  </template>
                  添加 Header
                </t-button>
              </t-tab-panel>

              <t-tab-panel value="cookies" label="Cookies">
                <t-table
                  :data="cookies"
                  :columns="tableColumns"
                  size="small"
                  bordered
                  :pagination="{ disabled: true }"
                >
                  <template #enabled="{ row }">
                    <t-checkbox v-model="row.enabled"/>
                  </template>
                  <template #key="{ row }">
                    <t-input v-model="row.key" size="small" placeholder="Key"/>
                  </template>
                  <template #value="{ row }">
                    <t-input v-model="row.value" size="small" placeholder="Value"/>
                  </template>
                  <template #action="{ rowIndex }">
                    <t-button theme="danger" variant="text" size="small" @click="removeRow('cookies', rowIndex)">
                      <template #icon>
                        <delete-icon/>
                      </template>
                    </t-button>
                  </template>
                </t-table>
                <t-button theme="default" variant="dashed" size="small" class="add-row-btn" @click="addRow('cookies')">
                  <template #icon>
                    <add-icon/>
                  </template>
                  添加 Cookie
                </t-button>
              </t-tab-panel>

              <t-tab-panel value="auth" label="Auth">
                <t-radio-group v-model="authType" variant="default-filled" class="auth-type-group">
                  <t-radio-button value="none">No Auth</t-radio-button>
                  <t-radio-button value="basic">Basic Auth</t-radio-button>
                  <t-radio-button value="bearer">Bearer Token</t-radio-button>
                  <t-radio-button value="api-key">API Key</t-radio-button>
                </t-radio-group>

                <div v-if="authType === 'basic'" class="auth-form">
                  <t-form label-align="left">
                    <t-form-item label="Username">
                      <t-input v-model="auth.basic.username" placeholder="用户名"/>
                    </t-form-item>
                    <t-form-item label="Password">
                      <t-input v-model="auth.basic.password" type="password" placeholder="密码"/>
                    </t-form-item>
                  </t-form>
                </div>

                <div v-if="authType === 'bearer'" class="auth-form">
                  <t-form label-align="left">
                    <t-form-item label="Token">
                      <t-input v-model="auth.bearer.token" placeholder="Bearer Token"/>
                    </t-form-item>
                  </t-form>
                </div>

                <div v-if="authType === 'api-key'" class="auth-form">
                  <t-form label-align="left">
                    <t-form-item label="Key">
                      <t-input v-model="auth.apiKey.key" placeholder="API Key 名称"/>
                    </t-form-item>
                    <t-form-item label="Value">
                      <t-input v-model="auth.apiKey.value" placeholder="API Key 值"/>
                    </t-form-item>
                    <t-form-item label="Add to">
                      <t-select v-model="auth.apiKey.addTo" :options="apiKeyAddToOptions"/>
                    </t-form-item>
                  </t-form>
                </div>
              </t-tab-panel>

              <t-tab-panel value="proxy" label="Proxy">
                <t-form label-align="left">
                  <t-form-item>
                    <t-checkbox v-model="proxy.enabled">启用代理</t-checkbox>
                  </t-form-item>
                  <template v-if="proxy.enabled">
                    <t-form-item label="协议">
                      <t-select v-model="proxy.protocol" :options="proxyProtocolOptions"/>
                    </t-form-item>
                    <t-form-item label="地址">
                      <t-input v-model="proxy.host" placeholder="代理地址"/>
                    </t-form-item>
                    <t-form-item label="端口">
                      <t-input-number v-model="proxy.port" placeholder="端口号" :min="1" :max="65535"/>
                    </t-form-item>
                    <t-form-item label="用户名">
                      <t-input v-model="proxy.username" placeholder="用户名（可选）"/>
                    </t-form-item>
                    <t-form-item label="密码">
                      <t-input v-model="proxy.password" type="password" placeholder="密码（可选）"/>
                    </t-form-item>
                  </template>
                </t-form>
              </t-tab-panel>
            </t-tabs>
          </div>
        </template>

        <template #bottom>
          <div class="response-section">
            <t-tabs v-model="responseTab">
              <template #action>
                <div v-if="response" class="response-info">
                  <t-tag :theme="getStatusTheme(response.status)">{{ response.status }}</t-tag>
                  <span class="response-time">{{ response.duration }}ms</span>
                  <span class="response-size">{{ formatSize(response.size) }}</span>
                </div>
              </template>

              <t-tab-panel value="body" label="Body">
                <div v-if="response" class="response-body">
                  <MonacoEditor
                    :model-value="formatResponseBody(response.data)"
                    :language="getResponseLanguage(response)"
                    :readonly="true"
                    height="400px"
                  />
                </div>
                <t-empty v-else description="暂无响应数据" class="mt-12vh"/>
              </t-tab-panel>

              <t-tab-panel value="cookies" label="Cookies">
                <div v-if="response?.cookies && response.cookies.length > 0" class="response-cookies">
                  <t-table :data="response.cookies" :columns="responseCookieColumns" size="small" bordered
                           :pagination="{ disabled: true }"/>
                </div>
                <t-empty v-else description="暂无 Cookie 数据" class="mt-12vh"/>
              </t-tab-panel>

              <t-tab-panel value="headers" label="Headers">
                <div v-if="response?.headers" class="response-headers">
                  <t-table :data="response.headers" :columns="responseHeaderColumns" size="small" bordered
                           :pagination="{ disabled: true }"/>
                </div>
                <t-empty v-else description="暂无 Header 数据" class="mt-12vh"/>
              </t-tab-panel>

              <t-tab-panel value="request" label="Request">
                <div v-if="requestConfig" class="request-config">
                  <MonacoEditor
                    :model-value="JSON.stringify(requestConfig, null, 2)"
                    language="json"
                    :readonly="true"
                    height="400px"
                  />
                </div>
                <t-empty v-else description="暂无请求配置" class="mt-12vh"/>
              </t-tab-panel>
            </t-tabs>
          </div>
        </template>
      </HorizontalSplitPanel>
    </div>
  </app-tool-layout>
</template>

<script setup lang="ts">
import {requestAction, type RequestConfig} from '@/lib/http.ts';
import {AddIcon, DeleteIcon} from 'tdesign-icons-vue-next';
import HorizontalSplitPanel from '@/components/common/HorizontalSplitPanel.vue';
import MonacoEditor from '@/components/common/MonacoEditor.vue';

interface KeyValueRow {
  enabled: boolean;
  key: string;
  value: string;
  type: 'text' | 'file';
  file: File | null;
}

interface AuthConfig {
  basic: {
    username: string;
    password: string;
  };
  bearer: {
    token: string;
  };
  apiKey: {
    key: string;
    value: string;
    addTo: 'header' | 'query';
  };
}

interface ProxyConfig {
  enabled: boolean;
  protocol: 'http' | 'https' | 'socks5';
  host: string;
  port: number;
  username: string;
  password: string;
}

interface ResponseData {
  status: number;
  statusText: string;
  data: any;
  headers: { key: string; value: string }[];
  cookies: { key: string; value: string }[];
  duration: number;
  size: number;
}

const method = ref('GET');
const url = ref('');
const requestTab = ref('params');
const responseTab = ref('body');
const loading = ref(false);

const params = ref<KeyValueRow[]>([]);
const headers = ref<KeyValueRow[]>([]);
const cookies = ref<KeyValueRow[]>([]);
const formData = ref<KeyValueRow[]>([]);

const bodyType = ref('json');
const bodyContent = ref('');

const authType = ref('none');
const auth = ref<AuthConfig>({
  basic: {
    username: '',
    password: ''
  },
  bearer: {
    token: ''
  },
  apiKey: {
    key: '',
    value: '',
    addTo: 'header'
  }
});

const proxy = ref<ProxyConfig>({
  enabled: false,
  protocol: 'http',
  host: '',
  port: 8080,
  username: '',
  password: ''
});

const response = ref<ResponseData | null>(null);
const requestConfig = ref<any>(null);
const fileInputRefs = ref<Record<string, HTMLInputElement>>({});

const methodOptions = [
  {label: 'GET', value: 'GET'},
  {label: 'POST', value: 'POST'},
  {label: 'PUT', value: 'PUT'},
  {label: 'DELETE', value: 'DELETE'},
  {label: 'PATCH', value: 'PATCH'},
  {label: 'HEAD', value: 'HEAD'},
  {label: 'OPTIONS', value: 'OPTIONS'}
];

const tableColumns = [
  {colKey: 'enabled', title: '启用', width: 80},
  {colKey: 'key', title: 'Key', width: 200},
  {colKey: 'type', title: '类型', width: 100},
  {colKey: 'value', title: 'Value'},
  {colKey: 'action', title: '操作', width: 80}
];

const responseCookieColumns = [
  {colKey: 'key', title: 'Key', width: 200},
  {colKey: 'value', title: 'Value'}
];

const responseHeaderColumns = [
  {colKey: 'key', title: 'Key', width: 200},
  {colKey: 'value', title: 'Value'}
];

const apiKeyAddToOptions = [
  {label: 'Header', value: 'header'},
  {label: 'Query Param', value: 'query'}
];

const proxyProtocolOptions = [
  {label: 'HTTP', value: 'http'},
  {label: 'HTTPS', value: 'https'},
  {label: 'SOCKS5', value: 'socks5'}
];

const addRow = (type: 'params' | 'headers' | 'cookies' | 'formData') => {
  const newRow: KeyValueRow = {enabled: true, key: '', value: '', type: 'text', file: null};
  if (type === 'params') {
    params.value.push(newRow);
  } else if (type === 'headers') {
    headers.value.push(newRow);
  } else if (type === 'cookies') {
    cookies.value.push(newRow);
  } else if (type === 'formData') {
    formData.value.push(newRow);
  }
};

const removeRow = (type: 'params' | 'headers' | 'cookies' | 'formData', index: number) => {
  if (type === 'params') {
    params.value.splice(index, 1);
  } else if (type === 'headers') {
    headers.value.splice(index, 1);
  } else if (type === 'cookies') {
    cookies.value.splice(index, 1);
  } else if (type === 'formData') {
    formData.value.splice(index, 1);
  }
};

const triggerFileUpload = (row: KeyValueRow) => {
  const input = fileInputRefs.value[row.key];
  if (input) {
    input.click();
  }
};

const handleFileChange = (event: Event, row: KeyValueRow) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0] || null;
  row.file = file;
  if (file) {
    row.value = file.name;
  }
};

const buildRequestParams = () => {
  const result: Record<string, string> = {};
  params.value.filter(p => p.enabled && p.key).forEach(p => {
    result[p.key] = p.value;
  });
  return result;
};

const buildRequestHeaders = () => {
  const result: Record<string, string> = {};

  headers.value.filter(h => h.enabled && h.key).forEach(h => {
    result[h.key] = h.value;
  });

  if (authType.value === 'basic') {
    const {username, password} = auth.value.basic;
    if (username || password) {
      const credentials = btoa(`${username}:${password}`);
      result['Authorization'] = `Basic ${credentials}`;
    }
  } else if (authType.value === 'bearer') {
    const token = auth.value.bearer.token;
    if (token) {
      result['Authorization'] = `Bearer ${token}`;
    }
  } else if (authType.value === 'api-key') {
    const {key, value, addTo} = auth.value.apiKey;
    if (key && value) {
      if (addTo === 'header') {
        result[key] = value;
      }
    }
  }

  if (cookies.value.filter(c => c.enabled && c.key).length > 0) {
    const cookieString = cookies.value
      .filter(c => c.enabled && c.key)
      .map(c => `${c.key}=${c.value}`)
      .join('; ');
    result['Cookie'] = cookieString;
  }

  if (bodyType.value === 'form-data') {
    delete result['Content-Type'];
  }

  return result;
};

const buildRequestBody = () => {
  const isGetOrHead = method.value === 'GET' || method.value === 'HEAD';
  if (isGetOrHead) return undefined;

  if (bodyType.value === 'json') {
    try {
      return JSON.parse(bodyContent.value);
    } catch {
      return bodyContent.value;
    }
  } else if (bodyType.value === 'text') {
    return bodyContent.value;
  } else if (bodyType.value === 'form-data') {
    const formDataObj = new FormData();
    formData.value.filter(f => f.enabled && f.key).forEach(f => {
      if (f.type === 'file' && f.file) {
        formDataObj.append(f.key, f.file);
      } else {
        formDataObj.append(f.key, f.value);
      }
    });
    return formDataObj;
  } else if (bodyType.value === 'x-www-form-urlencoded') {
    const result: Record<string, string> = {};
    formData.value.filter(f => f.enabled && f.key).forEach(f => {
      result[f.key] = f.value;
    });
    return result;
  }
  return undefined;
};

const buildRequestUrl = () => {
  let finalUrl = url.value;

  if (authType.value === 'api-key' && auth.value.apiKey.addTo === 'query') {
    const {key, value} = auth.value.apiKey;
    if (key && value) {
      const separator = finalUrl.includes('?') ? '&' : '?';
      finalUrl = `${finalUrl}${separator}${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    }
  }

  return finalUrl;
};

const sendRequest = async () => {
  if (!url.value) {
    return;
  }

  loading.value = true;
  const startTime = Date.now();

  try {
    const config: RequestConfig = {
      method: method.value as any,
      url: buildRequestUrl(),
      params: buildRequestParams(),
      headers: buildRequestHeaders(),
      data: buildRequestBody()
    };

    requestConfig.value = config;

    const res = await requestAction(config);
    const endTime = Date.now();
    const duration = endTime - startTime;

    const responseData = res.data;
    const responseHeaders = res.headers;

    const headerList: { key: string; value: string }[] = [];
    if (responseHeaders) {
      Object.entries(responseHeaders).forEach(([key, value]) => {
        headerList.push({key, value: String(value)});
      });
    }

    const cookieList: { key: string; value: string }[] = [];
    const setCookieHeader = responseHeaders?.['set-cookie'];
    if (setCookieHeader) {
      const cookies = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
      cookies.forEach(cookie => {
        const keyValue = cookie.split(';')[0];
        if (keyValue) {
          const [key, value] = keyValue.split('=');
          if (key) {
            cookieList.push({key, value: value || ''});
          }
        }
      });
    }

    const responseSize = JSON.stringify(responseData).length;

    response.value = {
      status: res.status,
      statusText: res.statusText,
      data: responseData,
      headers: headerList,
      cookies: cookieList,
      duration,
      size: responseSize
    };
  } catch (error: any) {
    const endTime = Date.now();
    const duration = endTime - startTime;

    response.value = {
      status: error.response?.status || 0,
      statusText: error.response?.statusText || error.message || '请求失败',
      data: error.response?.data || error.message,
      headers: [],
      cookies: [],
      duration,
      size: 0
    };
  } finally {
    loading.value = false;
  }
};

const getStatusTheme = (status: number) => {
  if (status >= 200 && status < 300) return 'success';
  if (status >= 300 && status < 400) return 'warning';
  if (status >= 400 && status < 500) return 'danger';
  if (status >= 500) return 'danger';
  return 'default';
};

const formatResponseBody = (data: any) => {
  if (data === null || data === undefined) {
    return '';
  }
  
  if (typeof data === 'object') {
    return JSON.stringify(data, null, 2);
  }
  
  if (typeof data === 'string') {
    return data;
  }
  
  if (data instanceof ArrayBuffer || data instanceof Uint8Array || data instanceof Blob) {
    return '[Binary data - cannot display]';
  }
  
  if (typeof data === 'number' || typeof data === 'boolean') {
    return String(data);
  }
  
  return '[Unsupported data type]';
};

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const getResponseLanguage = (response: ResponseData): 'plaintext' | 'json' | 'html' | 'javascript' | 'xml' | 'css' | 'markdown' => {
  const contentType = response.headers?.find(h => h.key.toLowerCase() === 'content-type')?.value || '';
  
  if (!contentType) {
    return typeof response.data === 'object' ? 'json' : 'plaintext';
  }

  const type = contentType.toLowerCase();
  
  if (type.includes('application/json') || type.includes('text/json')) {
    return 'json';
  }
  if (type.includes('text/html')) {
    return 'html';
  }
  if (type.includes('text/javascript') || type.includes('application/javascript') || type.includes('application/x-javascript')) {
    return 'javascript';
  }
  if (type.includes('text/xml') || type.includes('application/xml') || type.includes('application/atom+xml') || type.includes('application/rss+xml')) {
    return 'xml';
  }
  if (type.includes('text/css')) {
    return 'css';
  }
  if (type.includes('text/markdown')) {
    return 'markdown';
  }
  if (type.includes('application/x-www-form-urlencoded')) {
    return 'plaintext';
  }
  if (type.includes('multipart/form-data')) {
    return 'plaintext';
  }
  
  return 'plaintext';
};
</script>

<style scoped lang="less">
.http-request-tool {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  height: calc(100% - 32px);
  overflow: hidden;
  background-color: var(--td-bg-color-container);
}

.request-bar {
  display: flex;
  gap: 8px;
  align-items: center;

  .method-select {
    width: 120px;
  }

  .url-input {
    flex: 1;
  }
}

.request-section {
  display: flex;
  flex-direction: column;
  height: 100%;

  :deep(.t-tabs) {
    display: flex;
    flex-direction: column;
    height: 100%;

    .t-tabs__nav {
      flex: 0 0 auto;
    }

    .t-tabs__content {
      flex: 1;
      overflow: auto;
      padding-top: 16px;
    }

  }

  :deep(.t-table) {
    max-height: 300px;
    overflow: auto;
  }

  .body-type-group,
  .auth-type-group {
    margin-bottom: 16px;
  }

  .auth-form {
    margin-top: 16px;
    max-width: 500px;
  }

  .add-row-btn {
    margin-top: 12px;
  }

  .file-input-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;

    :deep(.t-input__inner) {
      cursor: pointer;
    }
  }
}

.response-section {
  display: flex;
  flex-direction: column;
  height: 100%;

  :deep(.t-tabs) {
    display: flex;
    flex-direction: column;
    height: 100%;

    .t-tabs__nav {
      flex: 0 0 auto;
    }

    .t-tabs__content {
      flex: 1;
      overflow: auto;
    }
  }

  .response-info {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px 11px;

    .response-time,
    .response-size {
      color: var(--td-text-color-secondary);
      font-size: 12px;
    }
  }

  .response-body,
  .request-config {
    padding: 16px;

    :deep(.t-textarea__inner) {
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 12px;
      background-color: var(--td-bg-color-page);
    }
  }

  .response-cookies,
  .response-headers {
    padding: 16px;
  }
}
</style>
