<template>
  <div class="debug-rag">
    <t-tabs v-model="activeTab">
      <t-tab-panel value="search" label="搜索查询">
        <div class="search-panel">
          <t-space direction="vertical" style="width: 100%">
            <t-form :data="searchForm" labelAlign="top">
              <t-form-item label="查询方式">
                <t-select v-model="searchForm.queryType" :options="queryTypeOptions" placeholder="选择查询方式"
                          style="width: 100%"/>
              </t-form-item>

              <t-form-item v-if="searchForm.queryType === 'text'" label="搜索内容">
                <t-input
                  v-model="searchForm.textQuery"
                  placeholder="输入搜索内容..."
                  clearable
                  @enter="handleSearch"
                >
                  <template #suffixIcon>
                    <search-icon @click="handleSearch" style="cursor: pointer"/>
                  </template>
                </t-input>
              </t-form-item>

              <t-form-item v-if="searchForm.queryType === 'vector'" label="向量数据">
                <monaco-editor
                  v-model="searchForm.vectorQuery"
                  language="json"
                  height="100px"
                  placeholder="请输入向量数组，如 [0.1, 0.2, ...]"
                />
              </t-form-item>

              <t-form-item v-if="searchForm.queryType === 'hybrid'" label="文本查询">
                <t-input
                  v-model="searchForm.hybridTextQuery"
                  placeholder="输入文本查询..."
                  clearable
                />
              </t-form-item>

              <t-form-item v-if="searchForm.queryType === 'hybrid'" label="向量数据">
                <monaco-editor
                  v-model="searchForm.hybridVectorQuery"
                  language="json"
                  height="100px"
                  placeholder="请输入向量数组，如 [0.1, 0.2, ...]"
                />
              </t-form-item>

              <t-form-item v-if="searchForm.queryType === 'hybrid'" label="向量权重">
                <t-slider v-model="searchForm.vectorWeight" :min="0" :max="1" :step="0.1"
                          :marks="{ 0: '0', 0.5: '0.5', 1: '1' }"/>
                <div class="weight-value">当前值: {{ searchForm.vectorWeight }}</div>
              </t-form-item>

              <t-form-item label="返回数量">
                <t-input-number v-model="searchForm.topK" :min="1" :max="100" style="width: 100%"/>
              </t-form-item>
            </t-form>

            <t-space>
              <t-button theme="primary" @click="handleSearch" :loading="searching">
                搜索
              </t-button>
              <t-button @click="resetSearch">
                清空
              </t-button>
            </t-space>
          </t-space>

          <div v-if="searchResults.length > 0" class="results-container">
            <t-divider>搜索结果 ({{ searchResults.length }})</t-divider>
            <t-list :split="true">
              <t-list-item v-for="(result, index) in searchResults" :key="index">
                <div class="result-item">
                  <div class="result-content">{{ result.content }}</div>
                </div>
              </t-list-item>
            </t-list>
          </div>
        </div>
      </t-tab-panel>

      <t-tab-panel value="sql" label="SQL 查询">
        <div class="sql-panel">
          <t-space direction="vertical" style="width: 100%">
            <div class="sql-editor-wrapper">
              <monaco-editor
                v-model="sqlQuery"
                language="sql"
                height="200px"
              />
            </div>
            <t-space>
              <t-button theme="primary" @click="handleSqlQuery" :loading="sqlQuerying">
                执行 SQL
              </t-button>
              <t-button @click="sqlQuery = ''; sqlResults = []">
                清空
              </t-button>
            </t-space>
          </t-space>

          <div v-if="sqlResults.length > 0" class="results-container">
            <t-divider>查询结果 ({{ sqlResults.length }})</t-divider>
            <t-table
              :data="sqlResults"
              :columns="sqlTableColumns"
              :bordered="true"
              :stripe="true"
              :hover="true"
              size="small"
            >
              <template #cell="{ row, col }">
                <div class="table-cell-content">
                  <template v-if="typeof row[col.colKey] === 'object' && row[col.colKey] !== null">
                    <pre class="json-cell">{{ JSON.stringify(row[col.colKey], null, 2) }}</pre>
                  </template>
                  <template v-else>
                    {{ String(row[col.colKey] ?? '') }}
                  </template>
                </div>
              </template>
            </t-table>
          </div>
        </div>
      </t-tab-panel>
    </t-tabs>
  </div>
</template>

<script lang="ts" setup>
import {SearchIcon} from 'tdesign-icons-vue-next';
import {useMemoVelesdb} from '@/lib/velesdb';
import type {VelesdbChunkPayload} from '@/lib/velesdb';

const activeTab = ref('search');
const sqlQuery = ref('SELECT * FROM memo LIMIT 10');
const searching = ref(false);
const sqlQuerying = ref(false);
const searchResults = ref<VelesdbChunkPayload[]>([]);
const sqlResults = ref<VelesdbChunkPayload[]>([]);

const sqlTableColumns = computed(() => {
  if (sqlResults.value.length === 0) return [];

  const allKeys = new Set<string>();
  sqlResults.value.forEach(result => {
    Object.keys(result).forEach(key => allKeys.add(key));
  });

  return Array.from(allKeys).map(key => ({
    colKey: key,
    title: key,
    ellipsis: true,
  }));
});

const queryTypeOptions = [
  {label: '文本搜索', value: 'text'},
  {label: '向量搜索', value: 'vector'},
  {label: '混合搜索', value: 'hybrid'},
];

const searchForm = ref({
  queryType: 'text',
  textQuery: '',
  vectorQuery: '[]',
  hybridTextQuery: '',
  hybridVectorQuery: '[]',
  topK: 10,
  vectorWeight: 0.5,
});

const velesdb = useMemoVelesdb();

const resetSearch = () => {
  searchForm.value = {
    queryType: 'text',
    textQuery: '',
    vectorQuery: '[]',
    hybridTextQuery: '',
    hybridVectorQuery: '[]',
    topK: 10,
    vectorWeight: 0.5,
  };
  searchResults.value = [];
};

const handleSearch = async () => {
  searching.value = true;
  try {
    switch (searchForm.value.queryType) {
      case 'text':
        if (!searchForm.value.textQuery.trim()) {
          return;
        }
        searchResults.value = await velesdb.query(searchForm.value.textQuery, searchForm.value.topK);
        break;

      case 'vector':
        try {
          const vector = JSON.parse(searchForm.value.vectorQuery);
          if (!Array.isArray(vector)) {
            throw new Error('向量必须是数组');
          }
          searchResults.value = await velesdb.vectorSearch(vector, searchForm.value.topK);
        } catch (e) {
          console.error('向量解析失败:', e);
          alert('向量数据格式错误，请输入有效的 JSON 数组');
        }
        break;

      case 'hybrid':
        if (!searchForm.value.hybridTextQuery.trim()) {
          return;
        }
        try {
          const vector = JSON.parse(searchForm.value.hybridVectorQuery);
          if (!Array.isArray(vector)) {
            throw new Error('向量必须是数组');
          }
          searchResults.value = await velesdb.hybridSearchQuery(
            vector,
            searchForm.value.hybridTextQuery,
            searchForm.value.topK,
            searchForm.value.vectorWeight
          );
        } catch (e) {
          console.error('向量解析失败:', e);
          alert('向量数据格式错误，请输入有效的 JSON 数组');
        }
        break;
    }
  } catch (e) {
    console.error('搜索失败:', e);
  } finally {
    searching.value = false;
  }
};

const handleSqlQuery = async () => {
  if (!sqlQuery.value.trim()) {
    return;
  }

  sqlQuerying.value = true;
  try {
    sqlResults.value = await velesdb.executeSql(sqlQuery.value);
  } catch (e) {
    console.error('SQL 查询失败:', e);
  } finally {
    sqlQuerying.value = false;
  }
};
</script>

<style scoped lang="less">
.debug-rag {

  .search-panel,
  .sql-panel {
    padding: 16px 0;
  }

  .sql-editor-wrapper {
    border: 1px solid var(--td-component-border);
    border-radius: var(--td-radius-default);
    overflow: hidden;
  }

  .weight-value {
    font-size: 12px;
    color: var(--td-text-color-secondary);
    margin-top: 4px;
  }

  .results-container {
    margin-top: 16px;

    .result-item {
      padding: 8px 0;

      .result-content {
        word-break: break-word;
        white-space: pre-wrap;
        line-height: 1.6;
      }
    }

    .table-cell-content {
      .json-cell {
        margin: 0;
        white-space: pre-wrap;
        word-break: break-word;
        font-size: 12px;
        line-height: 1.4;
        max-height: 200px;
        overflow-y: auto;
        background: var(--td-bg-color-container);
        padding: 8px;
        border-radius: 4px;
      }
    }
  }
}
</style>
