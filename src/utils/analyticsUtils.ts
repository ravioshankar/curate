import { CollectionItem } from '../types/collection';

export interface CollectionAnalytics {
  totalValue: number;
  expectedValue: number;
  potentialLoss: number;
  potentialGain: number;
  categoryBreakdown: { [key: string]: number };
  locationBreakdown: { [key: string]: number };
  unusedItemsCount: number;
  averageItemAge: number;
  mostValuableItems: CollectionItem[];
  leastUsedItems: CollectionItem[];
}

export const generateAnalytics = (items: CollectionItem[]): CollectionAnalytics => {
  const totalValue = items.reduce((sum, item) => sum + (item.pricePaid || 0), 0);
  const expectedValue = items.reduce((sum, item) => sum + (item.priceExpected || 0), 0);
  
  const categoryBreakdown: { [key: string]: number } = {};
  const locationBreakdown: { [key: string]: number } = {};
  
  items.forEach(item => {
    categoryBreakdown[item.category] = (categoryBreakdown[item.category] || 0) + 1;
    locationBreakdown[item.location] = (locationBreakdown[item.location] || 0) + 1;
  });
  
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  
  const unusedItems = items.filter(item => new Date(item.lastUsed) < oneYearAgo);
  
  const itemAges = items.map(item => {
    const lastUsed = new Date(item.lastUsed);
    const now = new Date();
    return Math.floor((now.getTime() - lastUsed.getTime()) / (1000 * 60 * 60 * 24));
  });
  
  const averageItemAge = itemAges.length > 0 
    ? itemAges.reduce((sum, age) => sum + age, 0) / itemAges.length 
    : 0;
  
  const mostValuableItems = items
    .filter(item => item.pricePaid)
    .sort((a, b) => (b.pricePaid || 0) - (a.pricePaid || 0))
    .slice(0, 5);
    
  const leastUsedItems = items
    .sort((a, b) => new Date(a.lastUsed).getTime() - new Date(b.lastUsed).getTime())
    .slice(0, 5);
  
  return {
    totalValue,
    expectedValue,
    potentialLoss: Math.max(0, totalValue - expectedValue),
    potentialGain: Math.max(0, expectedValue - totalValue),
    categoryBreakdown,
    locationBreakdown,
    unusedItemsCount: unusedItems.length,
    averageItemAge,
    mostValuableItems,
    leastUsedItems
  };
};

export const getRecommendations = (items: CollectionItem[]): string[] => {
  const analytics = generateAnalytics(items);
  const recommendations: string[] = [];
  
  if (analytics.unusedItemsCount > 0) {
    recommendations.push(`Consider selling or donating ${analytics.unusedItemsCount} unused items`);
  }
  
  if (analytics.potentialLoss > 100) {
    recommendations.push(`Items have depreciated by $${analytics.potentialLoss.toFixed(0)} - consider insurance`);
  }
  
  if (analytics.averageItemAge > 365) {
    recommendations.push('Many items haven\'t been used recently - time to declutter?');
  }
  
  const topCategory = Object.entries(analytics.categoryBreakdown)
    .sort(([,a], [,b]) => b - a)[0];
  
  if (topCategory && topCategory[1] > items.length * 0.3) {
    recommendations.push(`You have many ${topCategory[0]} items - consider organizing them better`);
  }
  
  return recommendations;
};