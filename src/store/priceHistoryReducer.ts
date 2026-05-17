import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PriceRecord, TransactionRecord, ValuationSettings } from '../types/valuation';

// Initial state for price history tracking
export interface PriceHistoryState {
  items: Record<string, PriceRecord[]>; // itemId -> array of price records
  transactions: Record<string, TransactionRecord[]>; // itemId -> array of transactions
  valuationSettings: ValuationSettings;
  alerts: string[]; // List of alert IDs (for managing active alerts)
}

const initialState: PriceHistoryState = {
  items: {},
  transactions: {},
  valuationSettings: {
    autoRevalueEveryDays: 30, // Default: revaluate every 30 days
    checkMarketPricesOnLaunch: true,
    enablePriceAlerts: true,
    alertThresholdPercent: 10, // Alert if price changes by 10%+
    displayCurrency: 'USD',
  },
  alerts: [],
};

const priceHistorySlice = createSlice({
  name: 'priceHistory',
  initialState,
  reducers: {
    // Add a price record for an item
    addPriceRecord: (state, action: PayloadAction<{ itemId: string; record: Omit<PriceRecord, 'id'> }>) => {
      if (!state.items[action.payload.itemId]) {
        state.items[action.payload.itemId] = [];
      }
      
      // Insert at the beginning (newest first)
      state.items[action.payload.itemId].unshift({ ...action.payload.record, id: `price_${Date.now()}_${Math.random()}` });
    },
    
    // Remove a price record
    removePriceRecord: (state, action: PayloadAction<{ itemId: string; recordId: string }>) => {
      if (state.items[action.payload.itemId]) {
        state.items[action.payload.itemId] = state.items[action.payload.itemId].filter(
          (record) => record.id !== action.payload.recordId
        );
      }
    },
    
    // Add a transaction
    addTransaction: (state, action: PayloadAction<{ itemId: string; transaction: Omit<TransactionRecord, 'id'> }>) => {
      if (!state.transactions[action.payload.itemId]) {
        state.transactions[action.payload.itemId] = [];
      }
      
      state.transactions[action.payload.itemId].unshift({ ...action.payload.transaction, id: `tx_${Date.now()}_${Math.random()}` });
    },
    
    // Remove a transaction
    removeTransaction: (state, action: PayloadAction<{ itemId: string; transactionId: string }>) => {
      if (state.transactions[action.payload.itemId]) {
        state.transactions[action.payload.itemId] = state.transactions[action.payload.itemId].filter(
          (tx) => tx.id !== action.payload.transactionId
        );
      }
    },
    
    // Update valuation settings
    updateValuationSettings: (state, action: PayloadAction<Partial<ValuationSettings>>) => {
      state.valuationSettings = { ...state.valuationSettings, ...action.payload };
    },
    
    // Clear all alerts
    clearAlerts: (state) => {
      state.alerts = [];
    },
    
    // Add a new alert
    addAlert: (state, action: PayloadAction<string>) => {
      if (!state.alerts.includes(action.payload)) {
        state.alerts.push(action.payload);
      }
    },
    
    // Clear price history for an item
    clearPriceHistory: (state, action: PayloadAction<string>) => {
      delete state.items[action.payload];
    },
    
    // Clear transaction history for an item
    clearTransactionHistory: (state, action: PayloadAction<string>) => {
      delete state.transactions[action.payload];
    },
  },
});

export const priceHistoryActions = priceHistorySlice.actions;
export default priceHistorySlice.reducer;
