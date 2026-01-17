import {logDebug} from "@/lib/log";
import {generatePlaceholders, stringifyJsonWithBigIntSupport} from "@/util";
import type {PageResponse} from "@/global/PageResponse.ts";
import {SqlWrapper} from "@/lib/sql.ts";


export class QueryChain<T extends Record<string, any>, K extends keyof T = keyof T> {
  private readonly db: SqlWrapper;
  private readonly tableName: string;

  private readonly fields = new Array<K>();
  private readonly params = new Array<string>();
  private readonly values = new Array<T[K]>();
  private readonly orders = new Array<string>();
  private readonly lastExpress = new Array<string>();

  constructor(tableName: string, db: SqlWrapper) {
    this.tableName = tableName;
    this.db = db;
  }

  public static from<T extends Record<string, any>>(
    tableName: string,
    db: SqlWrapper,
    p?: Partial<T>
  ): QueryChain<T> {
    const qw = new QueryChain<T>(tableName, db);
    if (typeof p !== "undefined") {
      Object.entries(p).forEach(([k, v]) => {
        qw.simpleWhere(k, "=", v);
      });
    }
    return qw;
  }

  private simpleWhere(k: K, op: string, v?: T[K]) {
    if (typeof v === "undefined" || v === null) return this;
    this.params.push(`\`${String(k)}\` ${op} ${generatePlaceholders(1, this.values.length)}`);
    this.values.push(v);
    return this;
  }

  eq(k: K, v?: T[K]) {
    return this.simpleWhere(k, "=", v);
  }

  ne(k: K, v: T[K]) {
    return this.simpleWhere(k, "!=", v);
  }

  ge(k: K, v: T[K]) {
    return this.simpleWhere(k, ">=", v);
  }

  le(k: K, v: T[K]) {
    return this.simpleWhere(k, "<=", v);
  }

  gt(k: K, v: T[K]) {
    return this.simpleWhere(k, ">", v);
  }

  lt(k: K, v: T[K]) {
    return this.simpleWhere(k, "<", v);
  }

  like(k: K, v?: T[K]) {
    if (typeof v === "undefined" || v === null) return this;
    this.params.push(`\`${String(k)}\` like CONCAT('%', ${generatePlaceholders(1, this.values.length)}, '%')`);
    this.values.push(v);
    return this;
  }

  likeLeft(k: K, v?: T[K]) {
    if (typeof v === "undefined" || v === null) return this;
    this.params.push(`\`${String(k)}\` like CONCAT('%', ${generatePlaceholders(1, this.values.length)})`);
    this.values.push(v);
    return this;
  }

  likeRight(k: K, v?: T[K]) {
    if (typeof v === "undefined" || v === null) return this;
    this.params.push(`\`${String(k)}\` like CONCAT(${generatePlaceholders(1, this.values.length)}, '%')`);
    this.values.push(v);
    return this;
  }

  order(k: K, order: "ASC" | "DESC") {
    this.orders.push(`\`${String(k)}\` ${order}`);
    return this;
  }

  orderByAsc(k: K) {
    return this.order(k, "ASC");
  }

  orderByDesc(k: K) {
    return this.order(k, "DESC");
  }

  lastSql(sql: string) {
    this.lastExpress.push(sql);
    return this;
  }

  in(k: K, sql: string | Array<T[K]>) {
    if (Array.isArray(sql)) {
      this.params.push(`\`${String(k)}\` in (${generatePlaceholders(sql.length, this.values.length)})`);
      this.values.push(...sql);
    } else {
      this.params.push(`\`${String(k)}\` in (${sql})`);
    }
    return this;
  }

  select(...fields: Array<K>) {
    this.fields.push(...fields);
    return this;
  }

  private getSql() {
    let sql = "select";
    if (this.fields.length > 0) {
      sql += " " + this.fields.map((field) => `\`${String(field)}\``).join(", ");
    } else {
      sql += " *";
    }
    sql += ` from \`${this.tableName}\``;
    if (this.params.length > 0) {
      sql += " where " + this.params.join(" and ");
    }
    if (this.orders.length > 0) {
      sql += " order by " + this.orders.join(", ");
    }
    if (this.lastExpress.length > 0) {
      sql += " " + this.lastExpress.join(" ");
    }
    return sql;
  }

  async execQuery(db: SqlWrapper) {
    const sql = this.getSql();
    logDebug("select sql\t\t:" + sql);
    logDebug("select values\t:" + this.values);
    const list = await db.select<Array<T>>(sql, this.values);
    logDebug("select result\t:" + list.length);
    return list;
  }

  list(): Promise<Array<T>> {
    return this.execQuery(this.db);
  }

  async first(): Promise<T | null> {
    this.lastSql("LIMIT 1");
    const list = await this.execQuery(this.db);
    return list.length > 0 ? list[0]! : null;
  }

  async one(): Promise<T | null> {
    this.lastSql("LIMIT 1");
    const list = await this.execQuery(this.db);
    if (list.length > 1) return Promise.reject(new Error("存在多个数据"));
    return list.length > 0 ? list[0]! : null;
  }


  async get(): Promise<T | undefined> {
    return await this.one() || undefined;
  }

  async count(): Promise<number> {
    const sql = `select count(1) as \`total\`
                 from (${this.getSql()}) t`;
    logDebug("select sql\t\t:" + sql);
    logDebug("select values\t:" + this.values);
    const row = await this.db.select<Array<{ total: number }>>(sql, this.values);
    logDebug("select result\t:" + stringifyJsonWithBigIntSupport(row));
    return row[0]!.total || 0;
  }

  async batchList(batchSize: number, each: (list: Array<T>) => Promise<void>): Promise<void> {
    let page = 1;
    const total = await this.count();
    while ((page - 1) * batchSize < total) {
      const list = await this.lastSql(`LIMIT ${batchSize} OFFSET ${(page - 1) * batchSize}`).list();
      // 把刚刚加入的 LIMIT 语句弹出
      this.lastExpress.pop();
      await each(list);
      page += 1;
    }
  }

  async delete(): Promise<void> {
    let sql = "delete";
    sql += ` from \`${this.tableName}\``;
    if (this.params.length > 0) {
      sql += " where " + this.params.join(" and ");
    }
    if (this.lastExpress.length > 0) {
      sql += " " + this.lastExpress.join(" ");
    }
    logDebug("delete sql\t\t:" + sql);
    logDebug("delete values\t:" + this.values);
    const r = await this.db.execute(sql, this.values);
    logDebug("delete result:\t" + r.rowsAffected);
  }

  async page(pageNum: number, pageSize: number): Promise<PageResponse<T>> {
    const total = await this.count();
    const records = await this.lastSql(
      `LIMIT ${pageSize} OFFSET ${(pageNum - 1) * pageSize}`
    ).list();
    return {
      total,
      records,
      pageNum,
      pageSize
    };
  }
}