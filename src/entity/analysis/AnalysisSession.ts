export interface AnalysisSession {
  id: string;
  created_at: number;
  updated_at: number;
  filename: string;
  source_type: 'wechat' | 'alipay';
  record_count: number;
  date_range_start: number;
  date_range_end: number;
}