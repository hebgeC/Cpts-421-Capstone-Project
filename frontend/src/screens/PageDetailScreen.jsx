import { colors } from '../theme/colors';
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  ActivityIndicator, Linking,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { getPageBySlug } from '../services/wordpress';
import WordPressWebView, { escapeHtml } from '../components/WordPressWebView';

const SHELTER_PHONE = '2533834493';

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function PageDetailScreen() {
  const navigation = useNavigation();
  const { params } = useRoute();
  const { slug, title } = params;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const json = await getPageBySlug(slug);
      setData(json);
    } catch (e) {
      setError('Could not load this page. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { load(); }, [load]);

  const handleLinkPress = (href) => {
    if (/^(tel|mailto):/i.test(href)) {
      Linking.openURL(href);
      return;
    }
    if (href === data?.link) {
      Linking.openURL(href);
      return;
    }
    if (/^https?:\/\//i.test(href)) {
      navigation.navigate('WebView', { url: href, title: data?.title || title });
    }
  };

  const pageHtml = data ? `
    <h1>${escapeHtml(data.title)}</h1>
    ${data.modified ? `<p class="app-updated">Last updated ${escapeHtml(formatDate(data.modified))}</p>` : ''}
    ${slug === 'emergency-services' ? `<p><a class="app-button" href="tel:${SHELTER_PHONE}">Call 253-383-4493</a></p>` : ''}
    ${data.contentHtml}
    ${data.link ? `<p class="app-footer"><a class="app-button" href="${escapeHtml(data.link)}">View full page on trm.org</a></p>` : ''}
  ` : '';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <TouchableOpacity accessibilityLabel="Go back" style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={20} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle} numberOfLines={1}>{title || data?.title || ''}</Text>
      </View>

      {loading && (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      {!loading && error && (
        <View style={styles.errorBox}>
          <Icon name="wifi-outline" size={24} color={colors.primary} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={load}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && !error && data && (
        <WordPressWebView bodyHtml={pageHtml} onLinkPress={handleLinkPress} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: colors.warm,
    backgroundColor: '#FFFFFF',
  },
  backBtn: { width: 36, padding: 8, alignItems: 'center' },
  topBarTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: colors.ink, textAlign: 'center' },
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  errorBox: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30, gap: 12 },
  errorText: { fontSize: 14, color: colors.muted, textAlign: 'center', lineHeight: 20 },
  retryBtn: { backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 24, paddingVertical: 10 },
  retryBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
});
