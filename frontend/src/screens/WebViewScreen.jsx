import { colors } from '../theme/colors';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, Linking, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons as Icon } from '@expo/vector-icons';

export default function WebViewScreen() {
  const navigation = useNavigation();
  const { params } = useRoute();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity accessibilityLabel="Go back" onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Icon name="chevron-back" size={22} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{params?.title ?? ''}</Text>
        <View style={styles.backBtn} />
      </View>
      {Platform.OS === 'web' ? (
        <View style={styles.webFallback}>
          <View style={styles.webIcon}>
            <Icon name="open-outline" size={30} color={colors.primary} />
          </View>
          <Text style={styles.webTitle}>{params?.title || 'External website'}</Text>
          <Text style={styles.webDescription}>Open this page in your browser to continue.</Text>
          {params?.url ? (
            <TouchableOpacity
              accessibilityRole="button"
              style={styles.openButton}
              onPress={() => Linking.openURL(params.url)}
            >
              <Text style={styles.openButtonText}>Open website</Text>
              <Icon name="open-outline" size={17} color="#FFFFFF" />
            </TouchableOpacity>
          ) : null}
        </View>
      ) : (
        <WebView
          source={{ uri: params?.url }}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.loader}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.warm,
    backgroundColor: '#FFFFFF',
  },
  backBtn: { width: 36, alignItems: 'center' },
  title: { flex: 1, fontSize: 16, fontWeight: '700', color: colors.ink, textAlign: 'center' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  webFallback: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, gap: 16 },
  webIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  webTitle: { fontSize: 24, fontWeight: '800', color: colors.ink, textAlign: 'center' },
  webDescription: { fontSize: 15, lineHeight: 22, color: colors.muted, textAlign: 'center' },
  openButton: { marginTop: 8, backgroundColor: colors.primary, borderRadius: 12, paddingHorizontal: 22, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', gap: 10 },
  openButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
