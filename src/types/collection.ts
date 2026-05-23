export interface CollectionItem {
  id: string;
  name: string;
  category: string;
  location: string;
  lastUsed: string;
  imageUrl?: string;
  pricePaid?: number;
  priceExpected?: number;
  priceHistory?: {
    id: string;
    itemId: string;
    itemName: string;
    value: number;
    currency: string;
    recordedAt: string;
    source: 'manual' | 'market_api' | 'appraisal' | 'initial';
    notes?: string;
  }[];
  lastRevaluedAt?: string;
  notes?: string;
}

export interface CollectionStats {
  totalItems: number;
  categories: number;
  unusedItems: number;
}
