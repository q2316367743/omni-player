import {useSql} from "@/lib/sql.ts";
import type {AnalysisSession, AnalysisSessionSourceType} from "@/entity/analysis/AnalysisSession.ts";
import type {AnalysisCategory} from "@/entity/analysis/AnalysisCategory.ts";
import type {AnalysisTransaction, AnalysisTransactionCore} from "@/entity/analysis/AnalysisTransaction.ts";


export async function saveTransactions(
  filename: string,
  sourceType: AnalysisSessionSourceType,
  transactions: AnalysisTransactionCore[]
) {
  const sql = useSql();

  const now = Date.now();

  let dateRangeStart = Date.now();
  let dateRangeEnd = 0;
  transactions.sort((a, b) => a.date - b.date);

  if (transactions.length > 0) {
    const lastTx = transactions[transactions.length - 1];
    const firstTx = transactions[0];
    if (lastTx && firstTx) {
      dateRangeStart = firstTx.date;
      dateRangeEnd = lastTx.date;
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