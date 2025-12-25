import type {SubscribeItem} from "@/entity/subscribe";
import {useSql} from "@/lib/sql.ts";
import {TableName} from "@/global/TableName.ts";

export async function listSubscribe() {
  const query = await useSql().query<Array<SubscribeItem>>(TableName.SUBSCRIBE_ITEM)
  return query.list();
}