export const GENERIC_ICONS = [
  '📦', '📱', '🍳', '⚽', '🪑', '🎵', '📚', '👕', '👜', '🌱',
  '🔧', '🎨', '🧸', '💊', '💄', '📋', '🏠', '🚗', '🐕', '✈️',
  '🍎', '🏺', '💎', '🔌', '🧽', '🚿', '🛏️', '🛋️', '🍽️', '👔',
  '💡', '🖼️', '✂️', '🎲', '🏆', '📄', '💿', '🍼', '🎄', '🏕️',
  '🏊♂️', '🎯', '🎪', '🎭', '🎸', '🎤', '🎧', '📷', '📺', '💻',
  '⌚', '🔑', '💰', '🎁', '🌟', '❤️', '🔥', '⚡', '🌈', '🎊'
];

const categoryIconMap: { [key: string]: string } = {
  'Accessories': '👜',
  'Antiques': '🏺',
  'Appliances': '🔌',
  'Art': '🎨',
  'Automotive': '🚗',
  'Baby': '🍼',
  'Bathroom': '🚿',
  'Beauty': '💄',
  'Bedroom': '🛏️',
  'Books': '📚',
  'Cleaning': '🧽',
  'Clothes': '👕',
  'Collectibles': '🏆',
  'Crafts': '✂️',
  'Decor': '🖼️',
  'Dining': '🍽️',
  'Documents': '📄',
  'Electronics': '📱',
  'Food': '🍎',
  'Furniture': '🪑',
  'Games': '🎲',
  'Garden': '🌱',
  'Health': '💊',
  'Home': '🏠',
  'Jewelry': '💎',
  'Kitchen': '🍳',
  'Laundry': '👔',
  'Lighting': '💡',
  'Living Room': '🛋️',
  'Media': '💿',
  'Music': '🎵',
  'Office': '📋',
  'Outdoor': '🏕️',
  'Pet': '🐕',
  'Pool': '🏊♂️',
  'Seasonal': '🎄',
  'Sports': '⚽',
  'Storage': '📦',
  'Tools': '🔧',
  'Toys': '🧸',
  'Travel': '✈️',
  'Other': '📦'
};

export const getCategoryIcon = (category: string): string => {
  return categoryIconMap[category] || '📦';
};

export const setCategoryIcon = (category: string, icon: string): void => {
  categoryIconMap[category] = icon;
};