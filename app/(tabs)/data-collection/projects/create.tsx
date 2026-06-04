import React from 'react';
import { View, Text } from 'react-native';
import { Stack } from 'expo-router';

export default function CreateProjectScreen() {
  return (
    <View style={{ flex: 1, padding: 24 }}>
      <Stack.Screen 
        options={{
          title: 'Create New Project',
        }}
      />
      
      {/* Future: Full create project form */}
      <Text>Project creation form coming soon...</Text>
    </View>
  );
}
