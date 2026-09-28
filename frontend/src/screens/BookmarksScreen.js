import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator,
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { API_BASE_URL } from '../utils/api';

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function BookmarksScreen({ navigation }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/wpArticles`);
      const data = await response.json();
      setArticles((data.articles || []).slice(0, 3).map((a) => ({ ...a, kind: 'articles' })));
    } catch (e) {
      setError('Could not load saved resources. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Saved Resources</Text>
          <Text style={styles.headerSub}>{articles.length} items saved</Text>
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

        {!loading && !error && (
          <View style={styles.collectionCard}>
            <View style={styles.collectionHeader}>
              <Text style={styles.collectionTitle}>My Reading List</Text>
              <Icon name="folder-outline" size={18} color="#C0392B" />
            </View>
            {articles.map((article, i) => (
              <TouchableOpacity
                key={article.id}
                style={[styles.bookmarkItem, i < articles.length - 1 && styles.bookmarkItemBorder]}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('Article', { article })}
              >
                <View style={styles.bookmarkIcon}>
                  <Icon name="document-text-outline" size={22} color="#C0392B" />
                </View>
                <View style={styles.bookmarkInfo}>
                  <Text style={styles.bookmarkCategory}>Client Story</Text>
                  <Text style={styles.bookmarkTitle} numberOfLines={2}>{article.title}</Text>
                  <View style={styles.bookmarkMeta}>
                    <Icon name="time-outline" size={12} color="#AAAAAA" />
                    <Text style={styles.bookmarkMetaText}>{formatDate(article.date)}</Text>
                  </View>
                </View>
                <Icon name="chevron-forward" size={16} color="#CCCCCC" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.tipBox}>
          <Icon name="information-circle-outline" size={18} color="#8B6B5A" />
          <Text style={styles.tipText}>Saved resources are stored locally on your device.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FDF6F0' },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#2C1810', letterSpacing: -0.5 },
  headerSub: { fontSize: 14, color: '#8B6B5A', marginTop: 2 },
  loadingBox: { alignItems: 'center', paddingVertical: 50, gap: 14 },
  errorBox: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 30, gap: 12 },
  errorText: { fontSize: 14, color: '#555', textAlign: 'center', lineHeight: 20 },
  retryBtn: { backgroundColor: '#C0392B', borderRadius: 8, paddingHorizontal: 24, paddingVertical: 10 },
  retryBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  collectionCard: {
    backgroundColor: '#FFFFFF', marginHorizontal: 20, borderRadius: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
    overflow: 'hidden',
  },
  collectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, backgroundColor: '#FEF0EE',
  },
  collectionTitle: { fontSize: 14, fontWeight: '700', color: '#C0392B' },
  bookmarkItem: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  bookmarkItemBorder: { borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  bookmarkIcon: {
    width: 48, height: 48, borderRadius: 14, backgroundColor: '#FDF6F0',
    alignItems: 'center', justifyContent: 'center',
  },
  bookmarkInfo: { flex: 1 },
  bookmarkCategory: { fontSize: 11, color: '#C0392B', fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 3 },
  bookmarkTitle: { fontSize: 14, fontWeight: '700', color: '#2C1810', lineHeight: 20, marginBottom: 5 },
  bookmarkMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  bookmarkMetaText: { fontSize: 12, color: '#AAAAAA' },
  tipBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 20, marginTop: 16, padding: 14,
    backgroundColor: '#FFFFFF', borderRadius: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  tipText: { fontSize: 13, color: '#8B6B5A', flex: 1 },
});
