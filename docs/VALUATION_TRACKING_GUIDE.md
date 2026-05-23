# Valuation Tracking & Price History - Feature Guide

## 🎯 Overview

This feature adds comprehensive price tracking and valuation history to your iQRate collection. Users can now:

- Track item values over time
- View price trends with visual sparkline charts
- Revalue items manually at any time
- Get portfolio-level analytics
- Export data for insurance/tax purposes

## 📦 What Was Implemented

### **1. Core Components**

#### **PriceTrackingService** (`src/services/PriceTrackingService.ts`)
- Manages price history records per item
- Migration from legacy storage to new schema
- Auto-revaluation scheduling
- Market watch data (ready for API integration)

#### **PriceHistoryReducer** (`src/store/priceHistoryReducer.ts`)
- Redux slice for price history state management
- Add/remove price records
- Transaction logging
- Alert management

#### **ValuationTypes** (`src/types/valuation.ts`)
New TypeScript interfaces:
- `PriceRecord` - Individual price point with metadata
- `TransactionRecord` - Purchase/sale/appraisal events
- `MarketWatchData` - External market reference data
- `CollectionStatsWithValuation` - Enhanced portfolio metrics

#### **PriceCard Component** (`src/components/PriceCard.tsx`)
Beautiful, responsive component showing:
- Current value with color-coded trends
- Visual sparkline chart (using native RN components)
- Percentage change indicator
- Quick edit actions

#### **ValuationAnalysisScreen** (`src/screens/ValuationAnalysisScreen.tsx`)
Portfolio overview with:
- Total portfolio value
- Net appreciation/depreciation
- Top performing items list
- Smart insights & recommendations

#### **PriceHistoryScreen** (`src/screens/PriceHistoryScreen.tsx`)
Detailed view for individual items:
- Complete price history table
- Add new price records
- Delete/edit existing records
- Trigger automatic revaluation
- Chart visualization

#### **MigrationService** (`src/services/MigrationService.ts`)
Ensures backward compatibility:
- Migrates existing AsyncStorage data to SQLite schema
- Initializes price history for current items
- Enables valuation tracking in settings
- Safe upgrade path (no data loss)

## 🔧 How to Use

### **For New Users**

1. **Install & Launch App**
   ```bash
   npm install
   npx expo start
   ```

2. **Add Your First Item**
   - Tap "+" in Collection tab
   - Fill in item details (name, category, etc.)
   - Tap "Revalue" button to establish baseline value
   
3. **Track Future Value Changes**
   - Open individual item
   - Tap "Add Price" → Enter new value
   - View chart showing appreciation/depreciation

### **For Existing Users (Migration)**

The migration runs automatically on first launch:

1. **Existing items are preserved** - No data loss
2. **Current values become baseline** for price history
3. **SQLite schema is upgraded** with new columns
4. **Settings are updated** with valuation tracking enabled

### **Manual Revaluation (Best Practice)**

Use "Revalue" button when:
- Item appreciates (e.g., collectible goes up in value)
- Seasonal trends affect your items
- Market conditions change
- Insurance appraisal completes

## 📊 Features Breakdown

### **Sparkline Charts**
- Visual price trends over time
- Color-coded: Green = appreciation, Red = depreciation
- Responsive to any screen size
- Built with native React Native components

### **Portfolio Analytics**
- Total tracked portfolio value
- Original investment vs. current worth
- Net change calculation
- Top gainers/losers tracking

### **Price History Table**
Shows:
- Date of each valuation
- Price at that time
- Source (manual/market/appraisal)
- Quick delete action

### **Smart Insights**
Auto-generated tips like:
- "Your watch has appreciated by 15% this year!"
- "Consider insuring items worth over $500"
- "Market trends suggest X category is hot"

## 🎨 UI Components Used

All components use **Expo's standard React Native API**:
- `react-native-chart-kit` (optional, for advanced charts)
- Native `View`, `Text`, `ScrollView` for sparklines
- Material Icons for visual feedback
- Themed styling for consistency

## 🔄 Data Flow

```
User Action → Add Price Record
             ↓
    Redux State Update
             ↓
   AsyncStorage / SQLite Sync
             ↓
   UI Re-renders with Chart
```

## ⚠️ Important Notes

### **Performance**
- Price charts use simplified sparklines (native components)
- Lazy-loading for long price histories (>100 records)
- Indexed database queries for fast lookups

### **Data Privacy**
- All valuation data stored locally on device
- No cloud sync in current implementation
- Export functionality for backup/migration

### **API Integration Ready**
The `MarketWatchData` interface is ready for:
- eBay API (sold listing prices)
- ArtPrice.com integration
- Custom scraper for niche items

## 🧪 Testing Checklist

- [ ] New user onboarding works
- [ ] Migration preserves existing data
- [ ] Price records add successfully
- [ ] Charts display correctly (iOS/Android/Web)
- [ ] Portfolio analytics calculate accurately
- [ ] Revaluation triggers properly
- [ ] Export generates valid data

## 🚀 Next Steps (Future Enhancements)

1. **Market API Integration**
   - Connect to eBay/ArtPrice APIs
   - Auto-refresh prices daily
   - Alert on significant market shifts

2. **Advanced Charts**
   - Replace sparklines with `react-native-chart-kit`
   - Add comparison lines (category average)
   - Timeline view with annotations

3. **Notifications**
   - Push alerts for appreciation/depreciation
   - Insurance renewal reminders
   - Market volatility warnings

4. **Social Features**
   - Share collection certificates
   - Compete with friends (gamification)
   - Community marketplaces

## 📚 Related Files

- `src/types/valuation.ts` - Type definitions
- `src/store/priceHistoryReducer.ts` - Redux slice
- `src/services/PriceTrackingService.ts` - Core service
- `src/screens/ValuationAnalysisScreen.tsx` - Portfolio view
- `src/screens/PriceHistoryScreen.tsx` - Item detail view
- `src/components/PriceCard.tsx` - Price display component

## 💡 Pro Tips

1. **Set Baseline Early**: Add items with current market value immediately
2. **Revalue Seasonally**: Check prices after major events (auctions, sales)
3. **Categorize Thoughtfully**: Use consistent categories for accurate analytics
4. **Include Notes**: Document why you revalued (e.g., "Sold at auction")

---

**Feature Status**: ✅ Core Implementation Complete

**Ready for Testing**: Yes  
**Production Ready**: After testing on physical devices  
**Breaking Changes**: None (backward compatible)
