import type Database from "@tauri-apps/plugin-sql";
import {BaseMapper} from "@/util/file/BaseMapper.ts";
import {QueryChain} from "@/util/file/QueryWrapper.ts";
import type {AnalysisSession} from "@/entity/analysis/AnalysisSession.ts";
import type {AnalysisTransaction} from "@/entity/analysis/AnalysisTransaction.ts";
import type {AnalysisCategory} from "@/entity/analysis/AnalysisCategory.ts";

export class AnalysisSessionMapper extends BaseMapper<AnalysisSession> {
  constructor(db: Database) {
    super('analysis_session', db);
  }

  async listAll(): Promise<AnalysisSession[]> {
    const query = QueryChain.from<AnalysisSession>('analysis_session', this.db)
      .orderByDesc('created_at');
    return query.list();
  }

  async getById(id: string): Promise<AnalysisSession | null> {
    const query = QueryChain.from<AnalysisSession>('analysis_session', this.db)
      .eq('id', id);
    return query.first();
  }
}

export class AnalysisTransactionMapper extends BaseMapper<AnalysisTransaction> {
  constructor(db: Database) {
    super('analysis_transaction', db);
  }

  async listBySessionId(
    sessionId: string,
    filterType?: 'all' | 'large' | 'small'
  ): Promise<AnalysisTransaction[]> {
    let query = QueryChain.from<AnalysisTransaction>('analysis_transaction', this.db)
      .eq('session_id', sessionId);
    
    if (filterType === 'large') {
      query = query.ge('amount', 100);
    } else if (filterType === 'small') {
      query = query.lt('amount', 100);
    }
    
    return query.orderByDesc('date').list();
  }

  async getByCategory(sessionId: string, category: string): Promise<AnalysisTransaction[]> {
    const query = QueryChain.from<AnalysisTransaction>('analysis_transaction', this.db)
      .eq('session_id', sessionId)
      .eq('category', category);
    return query.orderByDesc('date').list();
  }

  async getByDateRange(
    sessionId: string,
    startDate: number,
    endDate: number
  ): Promise<AnalysisTransaction[]> {
    const query = QueryChain.from<AnalysisTransaction>('analysis_transaction', this.db)
      .eq('session_id', sessionId)
      .ge('date', startDate)
      .le('date', endDate);
    return query.orderByDesc('date').list();
  }

  async getStats(sessionId: string) {
    const totalQuery = QueryChain.from<AnalysisTransaction>('analysis_transaction', this.db)
      .eq('session_id', sessionId);
    const total = await totalQuery.count();
    
    const incomeQuery = QueryChain.from<AnalysisTransaction>('analysis_transaction', this.db)
      .eq('session_id', sessionId)
      .eq('type', 'income');
    const income = await incomeQuery.count();
    
    const expenseQuery = QueryChain.from<AnalysisTransaction>('analysis_transaction', this.db)
      .eq('session_id', sessionId)
      .eq('type', 'expense');
    const expense = await expenseQuery.count();
    
    return {
      total: { count: total, total: 0 },
      income: { count: income, total: 0 },
      expense: { count: expense, total: 0 }
    };
  }

  async getCategoryStats(sessionId: string) {
    const transactions = await QueryChain.from<AnalysisTransaction>('analysis_transaction', this.db)
      .eq('session_id', sessionId)
      .list();
    
    const categoryMap = new Map<string, { count: number, total: number }>();
    
    for (const tx of transactions) {
      if (!tx.category) continue;
      const existing = categoryMap.get(tx.category);
      if (existing) {
        existing.count++;
        existing.total += tx.amount;
      } else {
        categoryMap.set(tx.category, { count: 1, total: tx.amount });
      }
    }
    
    return Array.from(categoryMap.entries())
      .map(([category, stats]) => ({ category, ...stats }))
      .sort((a, b) => b.total - a.total);
  }

  async getMonthlyStats(sessionId: string) {
    const transactions = await QueryChain.from<AnalysisTransaction>('analysis_transaction', this.db)
      .eq('session_id', sessionId)
      .list();
    
    const monthlyMap = new Map<string, { count: number, total: number }>();
    
    for (const tx of transactions) {
      const date = new Date(tx.date);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const existing = monthlyMap.get(month);
      if (existing) {
        existing.count++;
        existing.total += tx.amount;
      } else {
        monthlyMap.set(month, { count: 1, total: tx.amount });
      }
    }
    
    return Array.from(monthlyMap.entries())
      .map(([month, stats]) => ({ month, ...stats }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  async getYearlyStats(sessionId: string) {
    const transactions = await QueryChain.from<AnalysisTransaction>('analysis_transaction', this.db)
      .eq('session_id', sessionId)
      .list();
    
    const yearlyMap = new Map<string, { count: number, total: number }>();
    
    for (const tx of transactions) {
      const date = new Date(tx.date);
      const year = String(date.getFullYear());
      const existing = yearlyMap.get(year);
      if (existing) {
        existing.count++;
        existing.total += tx.amount;
      } else {
        yearlyMap.set(year, { count: 1, total: tx.amount });
      }
    }
    
    return Array.from(yearlyMap.entries())
      .map(([year, stats]) => ({ year, ...stats }))
      .sort((a, b) => a.year.localeCompare(b.year));
  }
}

export class AnalysisCategoryMapper extends BaseMapper<AnalysisCategory> {
  constructor(db: Database) {
    super('analysis_category', db);
  }

  async listBySessionId(sessionId: string): Promise<AnalysisCategory[]> {
    const query = QueryChain.from<AnalysisCategory>('analysis_category', this.db)
      .eq('session_id', sessionId)
      .orderByAsc('display_order');
    return query.list();
  }
}
