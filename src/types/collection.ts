export interface CollectionItem {
  id: string;
  name: string;
  category: string;
  location: string;
  lastUsed: string;
  imageUrl?: string;
  pricePaid?: number;
  priceExpected?: number;
}

export interface CollectionStats {
  totalItems: number;
  categories: number;
  unusedItems: number;
}