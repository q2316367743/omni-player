import {useSql} from "@/lib/sql.ts";
import type {AnalysisSession} from "@/entity/analysis/AnalysisSession.ts";
import type {AnalysisCategory} from "@/entity/analysis/AnalysisCategory.ts";
import type {AnalysisTransaction, AnalysisTransactionCore} from "@/entity/analysis/AnalysisTransaction.ts";


export async function saveTransactions(
  filename: string,
  sourceType: 'alipay' | 'wechat',
  transactions: AnalysisTransactionCore[]
) {
  const sql = useSql();

  const now = Date.now();

  let dateRangeStart = Date.now();
  let dateRangeEnd = 0;

  if (transactions.length > 0) {
    const lastTx = transactions[transactions.length - 1];
    const firstTx = transactions[0];
    if (lastTx && firstTx) {
      dateRangeStart = lastTx.date;
      dateRangeEnd = firstTx.date;
    }
  }

  const sessionMapper = await sql.mapper<AnalysisSession>('analysis_session');
  const {id: sessionId} = await sessionMapper.insert({
    created_at: now,
    updated_at: now,
    filename,
    source_type: sourceType,
    record_count: transactions.length,
    date_range_start: dateRangeStart,
    date_range_end: dateRangeEnd
  });

  const categories = new Set<string>();
  for (const tx of transactions) {
    if (tx.category) {
      categories.add(tx.category);
    }
  }

  const categoryMapper = await sql.mapper<AnalysisCategory>('analysis_category');
  let displayOrder = 1;
  for (const category of categories) {
    await categoryMapper.insert({
      created_at: now,
      session_id: sessionId,
      name: category,
      display_order: displayOrder++
    });
  }

  const transactionMapper = await sql.mapper<AnalysisTransaction>('analysis_transaction');
  for (const tx of transactions) {
    await transactionMapper.insert({
      created_at: now,
      updated_at: now,
      session_id: sessionId,
      date: tx.date,
      product: tx.product,
      counterparty: tx.counterparty,
      category: tx.category,
      type: tx.type,
      amount: tx.amount,
      remark: tx.remark
    });
  }
}

export function parseWechatCSV(text: string): AnalysisTransactionCore[] {
  const lines = text.split('\n').filter((line: string) => line.trim());
  const transactions: AnalysisTransactionCore[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line || !line.includes(',')) continue;

    const parts = line.split(',');
    if (parts.length < 5) continue;

    const dateStr = parts[0];
    if (!dateStr) continue;
    const date = new Date(dateStr).getTime();

    const type = parts[5] === '支出' ? 'expense' : 'income';
    const amount = parts[4] ? parseFloat(String(parts[4])) : 0;

    transactions.push({
      date,
      product: parts[2] || '',
      counterparty: parts[3] || '',
      category: parts[1] || '',
      type,
      amount,
      remark: parts[6] || ''
    });
  }

  return transactions;
}
