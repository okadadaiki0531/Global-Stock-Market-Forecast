export interface MarketData {
  date: string;
  price: number;
  prediction?: number;
}

export interface GlobalFactor {
  country: string;
  factor: string;
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
}

export interface PredictionResult {
  summary: string;
  factors: GlobalFactor[];
  shortTermTrend: 'up' | 'down' | 'sideways';
  confidence: number;
}
