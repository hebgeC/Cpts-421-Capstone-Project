import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

const DONATION_URL = 'https://www.trm.org/donate/';

export default function DonationScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Donate</Text>
      </View>
      <WebView
        source={{ uri: DONATION_URL }}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#C0392B" />
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FDF6F0' },
  header: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  title: { fontSize: 16, fontWeight: '700', color: '#2C1810' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
