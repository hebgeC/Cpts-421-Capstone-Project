import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView,
  ActivityIndicator, Image,
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { API_BASE_URL } from '../utils/api';

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function HomeScreen({ navigation }) {
  const [articles, setArticles] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const [articlesRes, updatesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/wpArticles`),
        fetch(`${API_BASE_URL}/wpUpdates`),
      ]);
      const articlesData = await articlesRes.json();
      const updatesData = await updatesRes.json();
      setArticles((articlesData.articles || []).map((a) => ({ ...a, kind: 'articles' })));
      setUpdates((updatesData || []).filter((u) => u.title).map((u) => ({ ...u, kind: 'updates' })));
    } catch (e) {
      setError('Could not load content. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const featured = articles[0];
  const recentArticles = articles.slice(1, 5);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>How can you help today?</Text>
            <Text style={styles.headerTitle}>TRM</Text>
          </View>
          <TouchableOpacity style={styles.notifBtn}>
            <Icon name="notifications-outline" size={22} color="#2C1810" />
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>

        <View style={styles.urgentBanner}>
          <Icon name="alert-circle" size={16} color="#C0392B" />
          <Text style={styles.urgentText}>Urgent: Winter shelter drive needs volunteers this weekend</Text>
        </View>

        <TouchableOpacity style={styles.searchBar} activeOpacity={0.8}>
          <Icon name="search-outline" size={18} color="#AAAAAA" />
          <Text style={styles.searchText}>Search drives, events, resources...</Text>
        </TouchableOpacity>

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
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured Story</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Explore')}>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>

            {featured ? (
              <TouchableOpacity
                style={styles.featuredCard}
                activeOpacity={0.92}
                onPress={() => navigation.navigate('Article', { article: featured })}
              >
                {featured.image ? (
                  <Image source={{ uri: featured.image }} style={styles.featuredImage} resizeMode="cover" />
                ) : (
                  <View style={styles.featuredImageBg}>
                    <Icon name="heart" size={100} color="rgba(255,255,255,0.4)" />
                  </View>
                )}
                <View style={styles.featuredOverlay}>
                  <View style={styles.featuredTag}>
                    <Text style={styles.featuredTagText}>Client Story</Text>
                  </View>
                  <Text style={styles.featuredTitle} numberOfLines={2}>{featured.title}</Text>
                  <View style={styles.featuredMeta}>
                    <Icon name="time-outline" size={13} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.featuredMetaText}>{formatDate(featured.date)}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No stories available right now.</Text>
              </View>
            )}

            {updates.length > 0 && (
              <>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Updates</Text>
                </View>
                {updates.map((update) => (
                  <TouchableOpacity
                    key={update.id}
                    style={styles.articleCard}
                    activeOpacity={0.88}
                    onPress={() => navigation.navigate('Article', { article: update })}
                  >
                    <View style={styles.articleEmoji}>
                      <Icon name="megaphone-outline" size={24} color="#C0392B" />
                    </View>
                    <View style={styles.articleInfo}>
                      <Text style={styles.articleCategory}>Update</Text>
                      <Text style={styles.articleTitle} numberOfLines={2}>{update.title}</Text>
                      <View style={styles.articleMeta}>
                        <Icon name="time-outline" size={12} color="#AAAAAA" />
                        <Text style={styles.articleMetaText}>{formatDate(update.date)}</Text>
                      </View>
                    </View>
                    <Icon name="chevron-forward" size={16} color="#CCCCCC" />
                  </TouchableOpacity>
                ))}
              </>
            )}

            {recentArticles.length > 0 && (
              <>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>More Stories</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Explore')}>
                    <Text style={styles.seeAll}>See all</Text>
                  </TouchableOpacity>
                </View>

                {recentArticles.map((article) => (
                  <TouchableOpacity
                    key={article.id}
                    style={styles.articleCard}
                    activeOpacity={0.88}
                    onPress={() => navigation.navigate('Article', { article })}
                  >
                    {article.image ? (
                      <Image source={{ uri: article.image }} style={styles.articleThumb} resizeMode="cover" />
                    ) : (
                      <View style={styles.articleEmoji}>
                        <Icon name="document-text-outline" size={24} color="#C0392B" />
                      </View>
                    )}
                    <View style={styles.articleInfo}>
                      <Text style={styles.articleCategory}>Client Story</Text>
                      <Text style={styles.articleTitle} numberOfLines={2}>{article.title}</Text>
                      <View style={styles.articleMeta}>
                        <Icon name="time-outline" size={12} color="#AAAAAA" />
                        <Text style={styles.articleMetaText}>{formatDate(article.date)}</Text>
                      </View>
                    </View>
                    <Icon name="chevron-forward" size={16} color="#CCCCCC" />
                  </TouchableOpacity>
                ))}
              </>
            )}
          </>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FDF6F0' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8,
  },
  greeting: { fontSize: 13, color: '#8B6B5A', fontWeight: '500' },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#2C1810', letterSpacing: -0.5 },
  notifBtn: {
    position: 'relative', padding: 8, backgroundColor: '#FFFFFF', borderRadius: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  notifDot: {
    position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#C0392B', borderWidth: 1.5, borderColor: '#FFFFFF',
  },
  urgentBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#FDECEA', marginHorizontal: 20, marginBottom: 10,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
    borderLeftWidth: 3, borderLeftColor: '#C0392B',
  },
  urgentText: { flex: 1, fontSize: 12, color: '#7B241C', fontWeight: '600', lineHeight: 17 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#FFFFFF', marginHorizontal: 20, marginVertical: 8,
    borderRadius: 14, paddingHorizontal: 16, paddingVertical: 13,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  searchText: { color: '#BBBBBB', fontSize: 14 },
  loadingBox: { alignItems: 'center', paddingVertical: 50, gap: 14 },
  errorBox: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 30, gap: 12 },
  errorText: { fontSize: 14, color: '#555', textAlign: 'center', lineHeight: 20 },
  retryBtn: { backgroundColor: '#C0392B', borderRadius: 8, paddingHorizontal: 24, paddingVertical: 10 },
  retryBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, marginTop: 20, marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#2C1810' },
  seeAll: { fontSize: 13, color: '#C0392B', fontWeight: '600' },
  featuredCard: {
    marginHorizontal: 20, borderRadius: 20, overflow: 'hidden',
    height: 220, backgroundColor: '#C0392B',
    shadowColor: '#C0392B', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 8,
  },
  featuredImage: { ...StyleSheet.absoluteFillObject },
  featuredImageBg: {
    ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center',
  },
  featuredOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  featuredTag: {
    backgroundColor: 'rgba(255,255,255,0.25)', alignSelf: 'flex-start',
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 8,
  },
  featuredTagText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  featuredTitle: { color: '#FFFFFF', fontSize: 19, fontWeight: '800', lineHeight: 25, marginBottom: 10 },
  featuredMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  featuredMetaText: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
  articleCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFFFF', marginHorizontal: 20, marginBottom: 10,
    borderRadius: 16, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  articleEmoji: {
    width: 56, height: 56, borderRadius: 14, backgroundColor: '#FDF6F0',
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  articleThumb: { width: 56, height: 56, borderRadius: 14, marginRight: 14, backgroundColor: '#F0F0F0' },
  articleInfo: { flex: 1 },
  articleCategory: { fontSize: 11, color: '#C0392B', fontWeight: '700', letterSpacing: 0.5, marginBottom: 3, textTransform: 'uppercase' },
  articleTitle: { fontSize: 14, fontWeight: '700', color: '#2C1810', lineHeight: 20, marginBottom: 6 },
  articleMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  articleMetaText: { fontSize: 12, color: '#AAAAAA' },
  emptyState: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20 },
  emptyStateText: { fontSize: 14, color: '#AAAAAA', fontStyle: 'italic' },
});
