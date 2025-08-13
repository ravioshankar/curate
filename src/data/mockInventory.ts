import { InventoryItem } from '../types/inventory';

export const mockInventory: InventoryItem[] = [
  {
    id: '1',
    name: 'Vintage Action Figure',
    category: 'Collectibles',
    location: 'Basement Box 1',
    lastUsed: '2022-05-10',
    imageUrl: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=300&fit=crop',
    pricePaid: 50.00,
    priceExpected: 150.00
  },
  {
    id: '2',
    name: 'Winter Coat',
    category: 'Clothes',
    location: 'Bedroom Closet',
    lastUsed: '2025-01-15',
    imageUrl: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400&h=300&fit=crop',
    pricePaid: 120.00,
    priceExpected: 60.00
  },
  {
    id: '3',
    name: 'Electric Kettle',
    category: 'Kitchen',
    location: 'Kitchen Counter',
    lastUsed: '2025-08-01',
    imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=300&fit=crop',
    pricePaid: 35.00,
    priceExpected: 25.00
  },
  {
    id: '4',
    name: 'Old Books (Box)',
    category: 'Books',
    location: 'Attic Storage',
    lastUsed: '2020-03-22',
    imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop',
    priceExpected: 20.00
  },
];