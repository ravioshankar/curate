export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  location: string;
  lastUsed: string;
  imageUrl?: string;
  pricePaid?: number;
  priceExpected?: number;
}