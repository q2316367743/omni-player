export interface AnalysisTransactionCore {

  // 交易时间
  date: number;
  // 交易商品
  product: string;
  // 交易对方
  counterparty: string;
  // 分类
  category: string;
  // 交易类型
  type: "expense" | "income";
  // 交易金额
  amount: number;
  // 交易备注
  remark: string;

}

export interface AnalysisTransaction extends AnalysisTransactionCore{
  id: string;
  created_at: number;
  updated_at: number;

  session_id: string;

}