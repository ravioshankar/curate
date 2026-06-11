/**
 * Valuation & Price History Types
 * 
 * Extends the core collection tracking with price history and market data
 */

import { CollectionItem, CollectionStats } from './collection';

export interface PriceRecord {
  id: string;
  itemId: string;
  itemName: string;
  value: number;
  currency: string;
  recordedAt: string; // ISO timestamp
  source: 'manual' | 'market_api' | 'appraisal' | 'initial';
  notes?: string;
}

export interface TransactionRecord {
  id: string;
  itemId: string;
  itemName: string;
  transactionType: 'purchase' | 'sale' | 'appraisal' | 'revaluation' | 'transfer';
  amount: number;
  currency: string;
  date: string; // ISO timestamp
  source: 'user_input' | 'market' | 'insurance' | 'gift';
  notes?: string;
}

export interface MarketWatchData {
  itemId: string;
  itemName: string;
  currentMarketPrice?: number;
  historicalHigh?: number;
  historicalLow?: number;
  trend: 'up' | 'down' | 'stable';
  volatility: 'low' | 'medium' | 'high';
  lastUpdated: string;
}

export interface CollectionStatsWithValuation extends CollectionStats {
  totalAssetValue: number;
  totalInvestment: number;
  netAppreciation: number;
  netAppreciationPercent: number;
  topGainerId?: string;
  topGainerName?: string;
  topGainerGainPercent?: number;
  topLoserId?: string;
  topLoserName?: string;
  topLoserLossPercent?: number;
}

export interface ValuationSettings {
  autoRevalueEveryDays?: number; // Auto-trigger revaluation every N days
  checkMarketPricesOnLaunch: boolean;
  enablePriceAlerts: boolean;
  alertThresholdPercent: number; // Alert if price changes by X%
  displayCurrency: string;
}

export interface PriceChartData {
  itemId: string;
  itemName: string;
  prices: {
    date: string;
    value: number;
    source: string;
  }[];
  currentValue?: number;
  currentValueDate?: string;
}

// Extend existing CollectionItem type to include valuation fields
export interface CollectionItemWithValuation extends CollectionItem {
  priceHistory?: PriceRecord[];
  lastRevaluedAt?: string;
  marketWatchData?: MarketWatchData;
  transactionHistory?: TransactionRecord[];
  valSettings?: Partial<ValuationSettings>;
}
