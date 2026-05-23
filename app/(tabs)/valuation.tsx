import { Stack } from 'expo-router';

export default function TabLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Existing Tabs */}
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Dashboard',
        }} 
      />
      
      <Stack.Screen 
        name="collection" 
        options={{ 
          title: 'Collection',
        }} 
      />

      <Stack.Screen 
        name="profile" 
        options={{ 
          title: 'Profile',
        }} 
      />

      {/* NEW: Price History Analysis Tab */}
      <Stack.Screen 
        name="valuation-analysis" 
        options={{ 
          title: 'Valuation Analysis',
        }} 
      />

      {/* NEW: Individual Item Price History */}
      <Stack.Screen 
        name="item-price-history" 
        options={{ 
          title: 'Price History',
          headerShadowVisible: false,
        }} 
      />

      {/* 404 Handler */}
      <Stack.Screen 
        name="+not-found" 
        options={{ 
          title: 'Not Found',
        }} 
      />
    </Stack>
  );
}
