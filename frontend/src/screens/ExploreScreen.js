import React, { useState, useEffect, useCallback, useContext, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView,
  ActivityIndicator, Image,
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { API_BASE_URL } from '../utils/api';
import { SavedResourcesContext } from '../context/SavedResourcesContext';

const RESOURCE_PAGE_SIZE = 10;

const BUILT_IN_SECTIONS = [
  { key: 'articles', name: 'Articles', icon: '📰', bg: '#FDECEA', color: '#C0392B', description: 'Client stories' },
  { key: 'updates', name: 'Updates', icon: '📢', bg: '#FEF9E7', color: '#E67E22', description: 'News from TRM' },
];

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ExploreScreen({ navigation }) {
  const [activeSection, setActiveSection] = useState(null);
  const [resources, setResources] = useState([]);
  const [siteCategories, setSiteCategories] = useState([]);
  const [siteItems, setSiteItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const requestId = useRef(0);
  const { isSaved, toggleSaved } = useContext(SavedResourcesContext);

  const fetchResourcePage = useCallback(async (section, pageNumber) => {
    const kind = section === 'articles' || section === 'updates'
      ? `&kind=${section}`
      : '';
    const response = await fetch(
      `${API_BASE_URL}/wpResources?page=${pageNumber}&per_page=${RESOURCE_PAGE_SIZE}${kind}`
    );
    if (!response.ok) throw new Error('Request failed');
    return response.json();
  }, []);

  const load = useCallback(async () => {
    const currentRequest = ++requestId.current;
    try {
      setError(null);
      setLoading(true);
      const [resourcesData, siteMapRes] = await Promise.all([
        fetchResourcePage(activeSection, 1),
        fetch(`${API_BASE_URL}/siteMap`),
      ]);
      const siteMapData = await siteMapRes.json();
      if (currentRequest !== requestId.current) return;
      setResources(resourcesData.resources || []);
      setPage(1);
      setTotalPages(resourcesData.totalPages || 1);
      setSiteCategories(siteMapData.categories || []);
      setSiteItems(siteMapData.items || []);
    } catch (e) {
      if (currentRequest === requestId.current) {
        setError('Could not load content. Please check your connection.');
      }
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  }, [activeSection, fetchResourcePage]);

  useEffect(() => { load(); }, [load]);

  const loadMore = useCallback(async () => {
    if (loading || loadingMore || page >= totalPages) return;
    const currentRequest = ++requestId.current;
    setLoadingMore(true);
    try {
      const data = await fetchResourcePage(activeSection, page + 1);
      if (currentRequest !== requestId.current) return;
      setResources((current) => {
        const existing = new Set(current.map((item) => `${item.kind}-${item.id}`));
        return [...current, ...(data.resources || []).filter((item) => !existing.has(`${item.kind}-${item.id}`))];
      });
      setPage(page + 1);
      setTotalPages(data.totalPages || 1);
    } catch (e) {
      // Keep the already-loaded resources visible; the next scroll can retry.
    } finally {
      if (currentRequest === requestId.current) setLoadingMore(false);
    }
  }, [activeSection, fetchResourcePage, loading, loadingMore, page, totalPages]);

  const sections = [
    ...BUILT_IN_SECTIONS,
    ...siteCategories.map((c) => ({
      key: c.key, name: c.title, icon: c.icon, bg: c.bg, color: c.color, description: c.description,
    })),
  ];

  const handleSectionPress = (key) => {
    const nextSection = activeSection === key ? null : key;
    setActiveSection(nextSection);
  };

  const handleSiteItemPress = (item) => {
    if (item.type === 'external') {
      navigation.navigate('WebView', { url: item.url, title: item.title });
    } else {
      navigation.navigate('PageDetail', { slug: item.slug, title: item.title });
    }
  };

  const isSiteCategory = activeSection && siteCategories.some((c) => c.key === activeSection);
  const activeCategoryTitle = isSiteCategory
    ? siteCategories.find((c) => c.key === activeSection)?.title
    : null;

  const siteItemsForCategory = isSiteCategory
    ? siteItems.filter((i) => i.category === activeSection)
    : [];

  const handleScroll = ({ nativeEvent }) => {
    if (isSiteCategory) return;
    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 240) loadMore();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={200}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Get Involved</Text>
          <Text style={styles.headerSub}>Find ways to serve your community</Text>
        </View>

        <View style={styles.categoryGrid}>
          {sections.map((s) => (
            <TouchableOpacity
              key={s.key}
              style={[
                styles.categoryCard,
                { backgroundColor: s.bg },
                activeSection === s.key && styles.categoryCardActive,
              ]}
              onPress={() => handleSectionPress(s.key)}
              activeOpacity={0.88}
            >
              <Text style={styles.catEmoji}>{s.icon}</Text>
              <Text style={[styles.catName, { color: s.color }]}>{s.name}</Text>
              <Text style={[styles.catCount, { color: s.color + 'AA' }]}>{s.description}</Text>
            </TouchableOpacity>
          ))}
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
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {activeSection === 'updates' ? 'Updates'
                  : activeSection === 'articles' ? 'Articles'
                  : isSiteCategory ? activeCategoryTitle
                  : 'All Resources'}
              </Text>
            </View>

            {isSiteCategory && siteItemsForCategory.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>Nothing here yet.</Text>
              </View>
            )}

            {isSiteCategory && siteItemsForCategory.map((item) => (
              <TouchableOpacity
                key={item.key}
                style={styles.listCard}
                activeOpacity={0.88}
                onPress={() => handleSiteItemPress(item)}
              >
                <View style={styles.listEmoji}>
                  <Icon name={item.icon} size={22} color="#C0392B" />
                </View>
                <View style={styles.listInfo}>
                  <Text style={styles.listCategory}>{item.type === 'external' ? 'On trm.org' : activeCategoryTitle}</Text>
                  <Text style={styles.listTitle} numberOfLines={2}>{item.title}</Text>
                </View>
                <View style={styles.listActions}>
                  <TouchableOpacity
                    style={styles.bookmarkButton}
                    onPress={() => toggleSaved({
                      ...item,
                      resourceType: item.type === 'external' ? 'external' : 'page',
                      categoryTitle: activeCategoryTitle,
                    })}
                    accessibilityLabel={isSaved({
                      ...item,
                      resourceType: item.type === 'external' ? 'external' : 'page',
                    }) ? 'Remove from saved resources' : 'Save resource'}
                  >
                    <Icon
                      name={isSaved({
                        ...item,
                        resourceType: item.type === 'external' ? 'external' : 'page',
                      }) ? 'bookmark' : 'bookmark-outline'}
                      size={20}
                      color="#C0392B"
                    />
                  </TouchableOpacity>
                  <Icon name={item.type === 'external' ? 'open-outline' : 'chevron-forward'} size={16} color="#CCCCCC" />
                </View>
              </TouchableOpacity>
            ))}

            {!isSiteCategory && resources.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>Nothing here yet.</Text>
              </View>
            )}

            {!isSiteCategory && resources.map((item) => (
              <TouchableOpacity
                key={`${item.kind}-${item.id}`}
                style={styles.listCard}
                activeOpacity={0.88}
                onPress={() => navigation.navigate('Article', { article: item })}
              >
                {item.image ? (
                  <Image source={{ uri: item.image }} style={styles.listImage} resizeMode="cover" />
                ) : (
                  <View style={styles.listEmoji}>
                    <Icon
                      name={item.kind === 'updates' ? 'megaphone-outline' : 'document-text-outline'}
                      size={22}
                      color="#C0392B"
                    />
                  </View>
                )}
                <View style={styles.listInfo}>
                  <Text style={styles.listCategory}>{item.kind === 'updates' ? 'Update' : 'Client Story'}</Text>
                  <Text style={styles.listTitle} numberOfLines={2}>{item.title || 'Untitled'}</Text>
                  <View style={styles.listMeta}>
                    <Icon name="time-outline" size={12} color="#AAAAAA" />
                    <Text style={styles.listMetaText}>{formatDate(item.date)}</Text>
                  </View>
                </View>
                <View style={styles.listActions}>
                  <TouchableOpacity
                    style={styles.bookmarkButton}
                    onPress={() => toggleSaved({ ...item, resourceType: 'article' })}
                    accessibilityLabel={isSaved(item) ? 'Remove from saved resources' : 'Save resource'}
                  >
                    <Icon
                      name={isSaved(item) ? 'bookmark' : 'bookmark-outline'}
                      size={20}
                      color="#C0392B"
                    />
                  </TouchableOpacity>
                  <Icon name="chevron-forward" size={16} color="#CCCCCC" />
                </View>
              </TouchableOpacity>
            ))}

            {!isSiteCategory && loadingMore && (
              <View style={styles.loadingMore}>
                <ActivityIndicator size="small" color="#C0392B" />
              </View>
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
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#2C1810', letterSpacing: -0.5 },
  headerSub: { fontSize: 14, color: '#8B6B5A', marginTop: 2 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 14, gap: 10, marginBottom: 24 },
  categoryCard: {
    width: '47%', borderRadius: 18, padding: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
    borderWidth: 2, borderColor: 'transparent',
  },
  categoryCardActive: { borderColor: '#2C1810' },
  catEmoji: { fontSize: 32, marginBottom: 10 },
  catName: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  catCount: { fontSize: 12, fontWeight: '500' },
  loadingBox: { alignItems: 'center', paddingVertical: 50, gap: 14 },
  errorBox: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 30, gap: 12 },
  errorText: { fontSize: 14, color: '#555', textAlign: 'center', lineHeight: 20 },
  retryBtn: { backgroundColor: '#C0392B', borderRadius: 8, paddingHorizontal: 24, paddingVertical: 10 },
  retryBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  sectionHeader: { paddingHorizontal: 20, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#2C1810' },
  emptyState: { alignItems: 'center', paddingVertical: 30, paddingHorizontal: 20 },
  emptyStateText: { fontSize: 14, color: '#AAAAAA', fontStyle: 'italic' },
  listCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFFFF', marginHorizontal: 20, marginBottom: 10,
    borderRadius: 16, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  listImage: { width: 52, height: 52, borderRadius: 14, marginRight: 12, backgroundColor: '#F0F0F0' },
  listEmoji: {
    width: 52, height: 52, borderRadius: 14, backgroundColor: '#FDF6F0',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  listInfo: { flex: 1 },
  listActions: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  bookmarkButton: { padding: 8 },
  listCategory: { fontSize: 11, color: '#C0392B', fontWeight: '700', letterSpacing: 0.5, marginBottom: 3, textTransform: 'uppercase' },
  listTitle: { fontSize: 14, fontWeight: '700', color: '#2C1810', lineHeight: 20, marginBottom: 5 },
  listMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  listMetaText: { fontSize: 12, color: '#AAAAAA' },
  loadingMore: { alignItems: 'center', paddingVertical: 18 },
});
