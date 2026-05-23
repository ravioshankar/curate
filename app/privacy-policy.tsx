import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';

export default function PrivacyPolicyScreen() {
  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <ThemedText type="title" style={styles.title}>Privacy Policy</ThemedText>
        
        <ThemedText type="subtitle" style={styles.section}>Data Storage</ThemedText>
        <ThemedText style={styles.text}>
          iQRate stores all your data locally on your device. We do not collect, store, or transmit any personal information to external servers.
        </ThemedText>

        <ThemedText type="subtitle" style={styles.section}>Information We Do Not Collect</ThemedText>
        <ThemedText style={styles.text}>
          • Personal identifiers{'\n'}
          • Location data{'\n'}
          • Usage analytics{'\n'}
          • Device information{'\n'}
          • Contact information
        </ThemedText>

        <ThemedText type="subtitle" style={styles.section}>Your Data</ThemedText>
        <ThemedText style={styles.text}>
          All collection items, photos, and settings remain on your device. You have complete control to view, edit, or delete your information at any time.
        </ThemedText>

        <ThemedText type="subtitle" style={styles.section}>Contact</ThemedText>
        <ThemedText style={styles.text}>
          For questions about this privacy policy, please contact us through the app store listing.
        </ThemedText>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginTop: 20,
    marginBottom: 10,
  },
  text: {
    lineHeight: 20,
    marginBottom: 10,
  },
});
