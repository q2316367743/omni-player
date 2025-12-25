import Database, {type QueryResult} from '@tauri-apps/plugin-sql';
import { resolveResource } from '@tauri-apps/api/path';
import { readTextFile } from '@tauri-apps/plugin-fs';
import {APP_DATA_DB_PATH, DB_MIGRATE_FILES} from "@/global/Constants.ts";
import {logInfo} from "@/lib/log.ts";
import {QueryChain} from "@/util/file/QueryWrapper.ts";
import MessageUtil from "@/util/model/MessageUtil.ts";
import {BaseMapper, type TableLike} from "@/util";

class Sql {

  private db: Database | null = null;

  private async _getDb() {
    if (this.db) return this.db;
    const path = await APP_DATA_DB_PATH();
    console.log("db path: ", path)
    this.db = await Database.load(path);
    return this.db;
  }

  private promiseChain: Promise<unknown> = Promise.resolve();

  private async getDb(): Promise<Database> {
    // 将新的 SQL 调用追加到 Promise 链尾部
    this.promiseChain = this.promiseChain
      .then(() => this._getDb())
      .catch((err) => {
        console.error('get store error:', err);
        throw err; // 保证错误能被调用者捕获
      });

    return this.promiseChain as Promise<Database>;
  }

  private executeChain: Promise<unknown> = Promise.resolve();

  async execute(query: string, bindValues?: unknown[]): Promise<QueryResult> {
    // 将新的 SQL 调用追加到 Promise 链尾部
    this.executeChain = this.executeChain
      .then(async () => {
        const db = await this.getDb();
        return db.execute(query, bindValues);
      })
      .catch((err) => {
        console.error('get store error:', err);
        throw err; // 保证错误能被调用者捕获
      });

    return this.executeChain as Promise<QueryResult>;
  }

  async select<T>(query: string, bindValues?: unknown[]): Promise<T> {
    const db = await this.getDb();
    return db.select<T>(query, bindValues);
  }

  async getLatestVersion() {
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
// 1. 检查 schema_version 表是否存在
    logInfo("1. 检查 schema_version 表是否存在");
    const rows = await this.select<Array<{name: string}>>("SELECT name FROM sqlite_master WHERE type='table' AND name='schema_version';");
    if (!rows || !rows.length) {
      logInfo("表不存在，创建 schema_version 表");
      await this.execute("CREATE TABLE schema_version (version int PRIMARY KEY,applied_at DATETIME DEFAULT CURRENT_TIMESTAMP);");
    } else {
      logInfo("表已存在，跳过创建");
    }

    // 2. 获取当前版本
    logInfo("2. 获取当前版本");
    const current = await this.getLatestVersion();
    logInfo("当前版本: ", current);
    const pending = DB_MIGRATE_FILES
      .filter((m) => m.version > current)
      .sort((a, b) => a.version - b.version);

    for (const { file, version } of pending) {
      const resourcePath = await resolveResource(file);
      const sql = await readTextFile(resourcePath);
      logInfo("开始处理文件：", file, ",版本：", version);
      await this.execute("BEGIN");
      try {
        logInfo("执行sql文件");
        await this.execute(sql);
        logInfo("插入版本");
        await this.execute("INSERT INTO schema_version(version) VALUES ($1)`", [version]);
        logInfo("提交事务");
        await this.execute("COMMIT");
        console.info(`✅ migration ${file} applied`);
      } catch (e) {
        await this.execute("ROLLBACK");
        console.error(`❌ migration ${file} failed`, e);
        throw e;
      }
    }
  }

  async query<T extends TableLike>(tableName: string) {
    return new QueryChain<T>(tableName, await this.getDb());
  }

  async mapper<T extends TableLike>(tableName: string) {
    return new BaseMapper<T>(tableName, await this.getDb());
  }

}

const sql = new Sql();

// 开始合并
sql.migrate().catch(e => MessageUtil.error("数据库合并失败", e));

export const useSql = () => {
  return sql;
}