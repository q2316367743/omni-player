import type Database from "@tauri-apps/plugin-sql";
import {logDebug} from "@/lib/log";
import {generatePlaceholders, useSnowflake} from "@/util";

export interface TableLike extends Record<string, any> {
  id: string;
}

export class BaseMapper<T extends TableLike> {
  protected readonly db: Database;
  private readonly tableName: string;

  constructor(tableName: string, db: Database) {
    this.db = db;
    this.tableName = tableName;
  }


  async updateById(id: string, params: Partial<T>) {
    const query = new Array<string>();
    const values = new Array<any>();
    for (const key in params) {
      const value = params[key];
      if (typeof value === "undefined" || value === null) continue;
      query.push(`\`${key}\` = $${values.length + 1}`);
      values.push(value);
    }
    if (query.length === 0) {
      // 没有更新的
      return;
    }
    const sql = `update ${this.tableName} set ${query.join(", ")} where id = ${values.length + 1}`;
    logDebug("update sql:\t\t" + sql);
    logDebug("update values:\t" + values);
    const r = await this.db.execute(sql, [...values, id]);
    logDebug("update result:\t" + r.rowsAffected);
  }

  async deleteById(id: string) {
    const sql = `delete from ${this.tableName} where id = $1`;
    logDebug("delete sql:\t\t" + sql);
    logDebug("delete values:\t" + id);
    const r = await this.db.execute(sql,[id]);
    logDebug("delete result:\t" + r.rowsAffected);
  }

  async deleteByIds(ids: Array<string>) {
    const sql = `delete from ${this.tableName} where id in (${generatePlaceholders(ids.length)})`;
    logDebug("delete sql:\t\t" + sql);
    logDebug("delete values:\t" + ids.join(", "));
    const r = await this.db.execute(sql, ids);
    logDebug("delete result:\t" + r.rowsAffected);
  }

  async insert(params: Partial<Omit<T, "id">>): Promise<T> {
    const query = new Array<string>();
    const values = new Array<any>();
    for (const key in params) {
      if (key === "id") continue;
      query.push(`\`${key}\``);
      values.push((params as any)[key]);
    }
    const sql = `insert into ${this.tableName} (id, ${query.join(
      ", "
    )}) values (${generatePlaceholders(query.length)})`;
    logDebug("insert sql:\t\t" + sql);
    logDebug("insert values:\t" + values);
    const id = useSnowflake().nextId();
    const r = await this.db.execute(sql, [id, ...values]);
    logDebug("insert result:\t" + r.rowsAffected);
    return {
      ...params,
      id
    } as T;
  }

  async insertBatch(params: Array<Partial<Omit<T, "id">>>): Promise<Array<string>> {
    if (params.length === 0) {
      return [];
    }

    // 获取第一个对象的键名（排除id）
    const keys = Object.keys(params[0]!).filter((key) => key !== "id");
    const columnNames = keys.map((key) => `\`${key}\``);

    // 生成所有ID
    const ids: Array<string> = [];
    const allValues: Array<any> = [];

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const _param of params) {
      const id = useSnowflake().nextId();
      ids.push(id);

      // 添加ID到值数组的开头
      allValues.push(id);
      // 按键顺序添加其他值
      for (const key of keys) {
        allValues.push((params as any)[key]);
      }
    }

    // 构建SQL语句
    const valuePlaceholders = params
      .map((_v, index) => `(${generatePlaceholders(keys.length  + 1, keys.length * index)})`)
      .join(", ");

    const sql = `insert into ${this.tableName} (id, ${columnNames.join(
      ", "
    )}) values ${valuePlaceholders}`;

    logDebug("insertBatch sql:\t" + sql);
    logDebug("insertBatch values:\t" + allValues);

    const r = await this.db.execute(sql, allValues);
    logDebug("insertBatch result:\t" + r.rowsAffected);

    return ids;
  }

  async insertSelf(params: Partial<T> & TableLike) {
    const query = new Array<string>();
    const values = new Array<any>();
    for (const key in params) {
      query.push(`\`${key}\``);
      values.push(params[key]);
    }
    const sql = `insert into ${this.tableName} (${query.join(
      ", "
    )}) values (${generatePlaceholders(query.length)})`;
    logDebug("insert sql:\t\t" + sql);
    logDebug("insert values:\t" + values);
    const r = await this.db.execute(sql, values);
    logDebug("insert result:\t" + r.rowsAffected);
  }
}
