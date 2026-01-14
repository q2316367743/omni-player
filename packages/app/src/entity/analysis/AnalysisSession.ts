export type AnalysisSessionSourceType = 'wechat' | 'alipay' | 'mixin';

export interface AnalysisSession {
  id: string;
  created_at: number;
  updated_at: number;
  filename: string;
  source_type: AnalysisSessionSourceType;
  record_count: number;
  date_range_start: number;
  date_range_end: number;
}

export const getSourceTypeName = (sourceType: AnalysisSessionSourceType) => {
  switch (sourceType) {
    case 'wechat':
      return '微信';
    case 'alipay':
      return '支付宝';
    case 'mixin':
      return '混合';
  }
};