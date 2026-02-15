import Database, {type QueryResult} from '@tauri-apps/plugin-sql';
import {resolveResource} from '@tauri-apps/api/path';
import {readTextFile} from '@tauri-apps/plugin-fs';
import {APP_DATA_DB_PATH, DB_MIGRATE_FILES} from "@/global/Constants.ts";
import {logDebug, logError, logInfo} from "@/lib/log.ts";
import {QueryChain} from "@/util/file/QueryWrapper.ts";
import {BaseMapper, generatePlaceholders, type TableLike} from "@/util";

export type TableName =
  | 'analysis_category'
  | 'analysis_session'
  | 'analysis_transaction'
  | 'subscribe_item'
  | 'feed_item'
  | 'feed_content'
  | 'snippet_meta'
  | 'snippet_tag'
  | 'snippet_tags'
  | 'snippet_content'
  | 'release_project'
  | 'release_version'
  | 'release_version_log'
  | 'release_instance'
  | 'release_deploy'
  | 'release_asset_meta'
  | 'release_asset_content'
  | 'ai_chat_group'
  | 'ai_chat_item'
  | 'ai_chat_message'
  | 'ai_rt_group'
  | 'ai_rt_meeting'
  | 'ai_rt_message'
  | 'ai_rt_participant'
  | 'ai_rt_role'
  | 'screenplay'
  | 'sp_dialogue'
  | 'sp_initiative_log'
  | 'sp_role'
  | 'sp_role_belief'
  | 'sp_role_emotion'
  | 'sp_role_latent_clue'
  | 'sp_role_timeline'
  | 'sp_scene'
  | 'sp_role_appearance'
  | 'sp_log'
  | 'sp_director_instruction_log'
  | 'sp_chapter'
  | 'sp_chapter_content'
  | 'memo_item'
  | 'memo_chunk'
  | 'memo_comment'
  | 'memo_layer_behavior'
  | 'memo_layer_cognitive'
  | 'memo_layer_emotion'
  | 'memo_layer_persona'
  | 'memo_friend'
  | 'memo_session'
  | 'memo_message'
  | 'memo_session_summary'
  | 'memo_post'
  | 'memo_post_comment'
  | 'mcp_setting'
  | 'memo_chat'
  | 'memo_chat_summary';

export class SqlWrapper {

  private db: Database | null = null;

  async getDb(): Promise<Database> {
    // 将新的 SQL 调用追加到 Promise 链尾部
    if (this.db) return this.db;
    const path = await APP_DATA_DB_PATH();
    logInfo("[sql] db path: ", path)
    this.db = await Database.load(`sqlite:${path}`);
    logInfo("[sql] db init success", this.db);
    return this.db;
  }

  private executionChain: Promise<void> = Promise.resolve();

  /**
   * 串行执行 SQL 命令，确保同一时间只有一个查询在运行
   */
  private async execute(query: string, bindValues?: unknown[]): Promise<QueryResult> {
    // 封装当前操作为一个函数
    const operation = () => this.db!.execute(query, bindValues);

    // 将操作加入执行链
    const result = this.executionChain.then(() => operation());

    // 更新执行链：下一个操作必须等这个完成
    this.executionChain = result.then(
      () => {
      }, // 成功时继续
      () => {
      }  // 失败也继续（避免链断裂）
    );

    // 延迟 50 ms
    await new Promise((resolve) => setTimeout(resolve, 50));

    // 返回原始结果（带类型）
    return result;
  }

  async select<T>(query: string, bindValues?: unknown[]): Promise<T> {
    return this.db!.select<T>(query, bindValues);
  }

  private async getLatestVersion() {
    const rows =
      await this.select<Array<{
        version: number
      }>>("SELECT COALESCE(MAX(version), -1) AS version FROM schema_version;");
    if (rows) {
      const row = rows[0];
      if (row) {
        const {version} = row;
        if (typeof version !== 'undefined' && version !== null) {
          return version as number;
        }
      }
    }
    return -1;
  }

  async migrate() {
    // 获取 db
    await this.getDb();
// 1. 检查 schema_version 表是否存在
    logInfo("[sql] 1. 检查 schema_version 表是否存在");
    const rows = await this.select<Array<{
      name: string
    }>>("SELECT name FROM sqlite_master WHERE type='table' AND name='schema_version';");
    if (!rows || !rows.length) {
      logInfo("[sql] 表不存在，创建 schema_version 表");
      await this.execute("CREATE TABLE schema_version (version int PRIMARY KEY,applied_at DATETIME DEFAULT CURRENT_TIMESTAMP);");
    } else {
      logInfo("[sql] 表已存在，跳过创建");
    }

    // 2. 获取当前版本
    logInfo("[sql] 2. 获取当前版本");
    const current = await this.getLatestVersion();
    logInfo("[sql] 当前版本: ", current);
    const pending = DB_MIGRATE_FILES
      .filter((m) => m.version > current)
      .sort((a, b) => a.version - b.version);

    for (const {file, version} of pending) {
      const resourcePath = await resolveResource(file);
      const sql = await readTextFile(resourcePath);
      logInfo("[sql] 开始处理文件：", file, ",版本：", version);
      await this.execute("BEGIN");
      try {
        logInfo("[sql] 执行sql文件");
        await this.execute(sql);
        logInfo("[sql] 插入版本");
        await this.execute(`INSERT INTO schema_version(version)
                            VALUES (${generatePlaceholders(1)})`, [version]);
        logInfo("[sql] 提交事务");
        await this.execute("COMMIT");
        logInfo(`[sql] ✅ migration ${file} applied`);
      } catch (e) {
        await this.execute("ROLLBACK");
        logError(`[sql] ❌ migration ${file} failed`, e);
        throw e;
      }
    }
  }

  query<T extends TableLike>(tableName: TableName) {
    return new QueryChain<T>(tableName, this);
  }

  mapper<T extends TableLike>(tableName: TableName) {
    return new BaseMapper<T>(tableName, this);
  }

  // 开启一个事务
  async beginTransaction<T = any>(callback: (sql: SqlWrapper) => Promise<T>): Promise<T> {
    try {
      logDebug("[sql] begin transaction")
      await this.db!.execute(`BEGIN`);
      const r = await callback(this);
      logDebug("[sql] commit transaction")
      await this.db!.execute(`COMMIT`);
      return r;
    } catch (e) {
      logError("[sql] rollback transaction")
      console.error(e)
      try {
        await this.db!.execute(`ROLLBACK`);
      } catch (err) {
        logError("[sql] 回滚失败");
        console.error(err)
      }
      throw e;
    }
  }

}

const sql = new SqlWrapper();

export const useSql = () => {
  return sql;
}
