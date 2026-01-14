import type {AnalysisTransactionCore} from "@/entity/analysis/AnalysisTransaction.ts";
import {readFile} from "@tauri-apps/plugin-fs";
import * as XLSX from "xlsx";


export async function parseWeChatPayToTransaction(path: string): Promise<Array<AnalysisTransactionCore>> {
  const body = await readFile(path);
  const workbook = XLSX.read(body, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    return [];
  }
  const worksheet = workbook.Sheets[sheetName];
  if (!worksheet) {
    return [];
  }
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

  const transactions: Array<AnalysisTransactionCore> = [];

  let headerIndex = -1;

  for (let i = 0; i < jsonData.length; i++) {
    const row = jsonData[i];
    if (row && row[0] && typeof row[0] === "string" && row[0].includes("微信支付账单明细列表")) {
      headerIndex = i + 1;
      break;
    }
  }

  if (headerIndex === -1) {
    return transactions;
  }

  const headerRow = jsonData[headerIndex];
  if (!headerRow) {
    return transactions;
  }

  const columnIndexMap = new Map<string, number>();
  headerRow.forEach((cell: any, index: number) => {
    if (cell && typeof cell === "string") {
      columnIndexMap.set(cell.trim(), index);
    }
  });

  for (let i = headerIndex + 1; i < jsonData.length; i++) {
    const row = jsonData[i];
    if (!row || row.length === 0) {
      continue;
    }

    const timeStr = row[columnIndexMap.get("交易时间") ?? 0];
    const transactionType = row[columnIndexMap.get("交易类型") ?? 0];
    const counterparty = row[columnIndexMap.get("交易对方") ?? 0];
    const product = row[columnIndexMap.get("商品") ?? 0];
    const amountStr = row[columnIndexMap.get("金额(元)") ?? 0];
    const incomeExpense = row[columnIndexMap.get("收/支") ?? 0];
    const remark = row[columnIndexMap.get("备注") ?? 0] || "";

    if (!timeStr || !transactionType || !counterparty || !product || !amountStr || !incomeExpense) {
      continue;
    }

    const type = incomeExpense === "收入" ? "income" : incomeExpense === "支出" ? "expense" : null;

    if (!type) {
      continue;
    }

    const cleanAmountStr = String(amountStr).replace(/[¥$€£]/g, "").trim();
    const amount = parseFloat(cleanAmountStr);
    if (isNaN(amount)) {
      continue;
    }

    const date = new Date(timeStr).getTime();
    if (isNaN(date)) {
      continue;
    }

    transactions.push({
      date,
      product,
      counterparty,
      category: transactionType,
      type,
      amount,
      remark: remark || ""
    });
  }

  return transactions;
}