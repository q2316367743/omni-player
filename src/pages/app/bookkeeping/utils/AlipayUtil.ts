import type {AnalysisTransaction} from "@/entity/analysis/AnalysisTransaction.ts";
import {useSnowflake} from "@/util/lang/Snowflake.ts";
import {readFile} from "@tauri-apps/plugin-fs";
import GBK from "gbk.js";

export async function readAlipayCsv(path: string){
  const file = await readFile( path);
  return GBK.decode(Array.from(file));
}

export function parseAlipayToTransaction(csv: string): Array<AnalysisTransaction> {
  const transactions: Array<AnalysisTransaction> = [];
  const lines = csv.split('\n');
  
  let headerIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) {
      continue;
    }
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('交易时间')) {
      headerIndex = i;
      break;
    }
  }
  
  if (headerIndex === -1) {
    return transactions;
  }
  
  const now = Date.now();
  const snowflake = useSnowflake();
  
  for (let i = headerIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) {
      continue;
    }
    
    const trimmedLine = line.trim();
    if (!trimmedLine) {
      continue;
    }
    
    const columns = trimmedLine.split(',').map(col => col.trim());
    
    if (columns.length < 7) {
      continue;
    }
    
    const timeStr = columns[0];
    const category = columns[1];
    const counterparty = columns[2];
    const product = columns[4];
    const typeStr = columns[5];
    const amountStr = columns[6];
    const remark = columns[11] || '';
    
    if (!timeStr || !category || !counterparty || !product || !typeStr || !amountStr) {
      continue;
    }
    
    const type = typeStr === '收入' ? 'income' : typeStr === '支出' ? 'expense' : null;
    if (!type) {
      continue;
    }
    
    const amount = parseFloat(amountStr);
    if (isNaN(amount)) {
      continue;
    }
    
    const date = new Date(timeStr).getTime();
    if (isNaN(date)) {
      continue;
    }
    
    transactions.push({
      id: snowflake.nextId(),
      created_at: now,
      updated_at: now,
      session_id: '',
      date,
      product,
      counterparty,
      category,
      type,
      amount,
      remark: remark || ''
    });
  }
  
  return transactions;
}