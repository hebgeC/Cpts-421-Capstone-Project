import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView,
  ActivityIndicator, Linking, useWindowDimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import RenderHTML from 'react-native-render-html';
import { Ionicons as Icon } from '@expo/vector-icons';
import { API_BASE_URL } from '../utils/api';

const SHELTER_PHONE = '2533834493';

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function PageDetailScreen() {
  const navigation = useNavigation();
  const { params } = useRoute();
  const { slug, title } = params;
  const { width } = useWindowDimensions();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/wpPage/${slug}`);
      if (!response.ok) throw new Error('Request failed');
      const json = await response.json();
      setData(json);
    } catch (e) {
      setError('Could not load this page. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { load(); }, [load]);

  const handleLinkPress = (event, href) => {
    if (href.startsWith('tel:') || href.startsWith('mailto:')) {
      Linking.openURL(href);
      return;
    }
    navigation.navigate('WebView', { url: href, title: data?.title || title });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={20} color="#2C1810" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle} numberOfLines={1}>{title || data?.title || ''}</Text>
        <View style={styles.backBtn} />
      </View>

      {loading && (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#C0392B" />
        </View>
      )}

      {!loading && error && (
        <View style={styles.errorBox}>
          <Icon name="wifi-outline" size={24} color="#C0392B" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={load}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && !error && data && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>{data.title}</Text>
          {data.modified ? (
            <Text style={styles.updated}>Last updated {formatDate(data.modified)}</Text>
          ) : null}

          {slug === 'emergency-services' ? (
            <TouchableOpacity
              style={styles.callCard}
              onPress={() => Linking.openURL(`tel:${SHELTER_PHONE}`)}
              activeOpacity={0.85}
            >
              <Icon name="call-outline" size={18} color="#C0392B" />
              <Text style={styles.callText}>253-383-4493</Text>
            </TouchableOpacity>
          ) : null}

          <RenderHTML
            contentWidth={width - 40}
            source={{ html: data.contentHtml }}
            baseStyle={styles.bodyText}
            renderersProps={{
              a: { onPress: handleLinkPress },
            }}
          />

          {data.link ? (
            <TouchableOpacity style={styles.linkBtn} onPress={() => Linking.openURL(data.link)} activeOpacity={0.9}>
              <Icon name="open-outline" size={16} color="#FFFFFF" />
              <Text style={styles.linkBtnText}>View full page on trm.org</Text>
            </TouchableOpacity>
          ) : null}

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  backBtn: { width: 36, padding: 8, alignItems: 'center' },
  topBarTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: '#2C1810', textAlign: 'center' },
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  errorBox: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30, gap: 12 },
  errorText: { fontSize: 14, color: '#555', textAlign: 'center', lineHeight: 20 },
  retryBtn: { backgroundColor: '#C0392B', borderRadius: 8, paddingHorizontal: 24, paddingVertical: 10 },
  retryBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  scrollContent: { padding: 20 },
  title: { fontSize: 24, fontWeight: '800', color: '#2C1810', marginBottom: 4 },
  updated: { fontSize: 12, color: '#AAAAAA', marginBottom: 16 },
  callCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#FDECEA', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14,
    marginBottom: 20, alignSelf: 'flex-start',
  },
  callText: { fontSize: 15, fontWeight: '700', color: '#C0392B' },
  bodyText: { fontSize: 15, color: '#4A3728', lineHeight: 25 },
  linkBtn: {
    marginTop: 20, backgroundColor: '#C0392B', borderRadius: 14, paddingVertical: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  linkBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
});
