import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Image, SafeAreaView, ScrollView, StyleSheet, Text,
  TouchableOpacity, View,
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { getArticles, getSiteMap } from '../services/wordpress';
import ScreenHeader from '../components/ScreenHeader';

const PAGE_SIZE = 10;
const { items: siteItems } = getSiteMap();
const PATHS = [
  { key: 'what-we-do', title: 'What We Do', description: 'Programs and services', icon: 'compass-outline', tint: 'teal' },
  { key: 'get-involved', title: 'Get Involved', description: 'Give, serve, and partner', icon: 'heart-outline', tint: 'olive' },
  { key: 'about', title: 'About', description: 'Our story, people, and impact', icon: 'people-outline', tint: 'tan' },
];
const SECTION_DESCRIPTIONS = {
  articles: 'Stories from our community.',
  'what-we-do': 'Explore our programs and services.',
  'get-involved': 'Find ways to give, serve, and partner.',
  about: 'Learn about our story, people, and impact.',
};

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ExploreScreen({ navigation, route }) {
  const [activeSection, setActiveSection] = useState(route?.params?.section || null);
  const [articles, setArticles] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const requestId = useRef(0);
  const loadingMoreRef = useRef(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (route?.params?.section === 'articles') setActiveSection('articles');
  }, [route?.params?.section]);

  const loadArticles = useCallback(async () => {
    const currentRequest = ++requestId.current;
    setError(null);
    setLoading(true);
    try {
      const data = await getArticles(1, PAGE_SIZE);
      if (currentRequest !== requestId.current) return;
      setArticles((data.articles || []).map((article) => ({ ...article, kind: 'articles' })));
      setPage(1);
      setTotalPages(data.totalPages || 1);
    } catch (e) {
      if (currentRequest === requestId.current) setError('Could not load articles. Please check your connection.');
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeSection === 'articles') loadArticles();
    return () => {
      requestId.current += 1;
      loadingMoreRef.current = false;
    };
  }, [activeSection, loadArticles]);

  const loadMore = useCallback(async () => {
    if (activeSection !== 'articles' || loading || loadingMoreRef.current || page >= totalPages) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    const currentRequest = ++requestId.current;
    try {
      const data = await getArticles(page + 1, PAGE_SIZE);
      if (currentRequest !== requestId.current) return;
      setArticles((current) => {
        const existing = new Set(current.map((article) => article.id));
        return [...current, ...(data.articles || [])
          .filter((article) => !existing.has(article.id))
          .map((article) => ({ ...article, kind: 'articles' }))];
      });
      setPage(page + 1);
      setTotalPages(data.totalPages || 1);
    } catch (e) {
      // Keep loaded articles visible; another scroll can retry this page.
    } finally {
      if (currentRequest === requestId.current) {
        loadingMoreRef.current = false;
        setLoadingMore(false);
      }
    }
  }, [activeSection, loading, page, totalPages]);

  const showSection = (section) => {
    setLoadingMore(false);
    setActiveSection(section);
    scrollRef.current?.scrollTo?.({ y: 0, animated: false });
  };
  const showLanding = () => {
    setLoadingMore(false);
    setActiveSection(null);
    navigation.setParams?.({ section: undefined });
    scrollRef.current?.scrollTo?.({ y: 0, animated: false });
  };
  const openSiteItem = (item) => {
    if (item.type === 'external') navigation.navigate('WebView', { url: item.url, title: item.title });
    else navigation.navigate('PageDetail', { slug: item.slug, title: item.title });
  };
  const handleScroll = ({ nativeEvent }) => {
    if (activeSection !== 'articles') return;
    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 240) loadMore();
  };
  const sectionTitle = activeSection === 'articles' ? 'Articles' : PATHS.find((path) => path.key === activeSection)?.title;
  const sectionItems = siteItems.filter((item) => item.category === activeSection && item.key !== 'donate');

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView ref={scrollRef} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} onScroll={handleScroll} scrollEventThrottle={200}>
        {!activeSection ? (
          <View style={styles.landing}>
            <ScreenHeader title="Explore" />
            <TouchableOpacity style={styles.feature} activeOpacity={0.88} accessibilityRole="button" accessibilityLabel="Browse articles" onPress={() => showSection('articles')}>
              <View style={styles.featureCircleLarge} />
              <View style={styles.featureCircleSmall} />
              <View style={styles.featureTop}>
                <Icon name="newspaper-outline" size={18} color="#FFFFFF" />
                <Text style={styles.featureKicker}>ARTICLES</Text>
              </View>
              <View style={styles.featureBottom}>
                <Text style={styles.featureTitle}>Stories of hope and change</Text>
                <Text style={styles.featureDescription}>Read stories from our community.</Text>
                <View style={styles.featureLink}>
                  <Text style={styles.featureLinkText}>Browse articles</Text>
                  <Icon name="arrow-forward" size={16} color="#FFFFFF" />
                </View>
              </View>
            </TouchableOpacity>
            <View style={styles.paths}>
              <Text style={styles.pathsHeading}>More to explore</Text>
              {PATHS.map((path) => (
                <TouchableOpacity key={path.key} style={styles.pathRow} activeOpacity={0.88} accessibilityRole="button" accessibilityLabel={path.title} onPress={() => showSection(path.key)}>
                  <View style={[styles.pathIcon, styles[`${path.tint}Icon`]]}>
                    <Icon name={path.icon} size={23} color={path.tint === 'tan' ? colors.ink : path.tint === 'olive' ? colors.accent : colors.primary} />
                  </View>
                  <View style={styles.pathCopy}>
                    <Text style={styles.pathTitle}>{path.title}</Text>
                    <Text style={styles.pathDescription}>{path.description}</Text>
                  </View>
                  <Icon name="chevron-forward" size={17} color={colors.muted} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <>
            <View style={styles.detailHeader}>
              <TouchableOpacity style={styles.backButton} onPress={showLanding} accessibilityRole="button" accessibilityLabel="Back to Explore">
                <Icon name="arrow-back" size={20} color={colors.primary} />
                <Text style={styles.backText}>Explore</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>{sectionTitle}</Text>
              <Text style={styles.headerSub}>{SECTION_DESCRIPTIONS[activeSection]}</Text>
            </View>
            {activeSection === 'articles' ? (
              <>
                {loading && <View style={styles.loadingBox}><ActivityIndicator size="large" color={colors.primary} /></View>}
                {!loading && error && (
                  <View style={styles.errorBox}>
                    <Icon name="wifi-outline" size={24} color={colors.primary} />
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={loadArticles} accessibilityRole="button"><Text style={styles.retryText}>Retry</Text></TouchableOpacity>
                  </View>
                )}
                {!loading && !error && articles.length === 0 && <Text style={styles.emptyText}>No articles available right now.</Text>}
                {!loading && !error && articles.map((article) => (
                  <TouchableOpacity key={article.id} style={styles.listCard} activeOpacity={0.88} accessibilityRole="button" onPress={() => navigation.navigate('Article', { article })}>
                    {article.image ? <Image source={{ uri: article.imageThumbnail || article.image }} style={styles.listImage} resizeMode="cover" />
                      : <View style={styles.listIcon}><Icon name="document-text-outline" size={22} color={colors.primary} /></View>}
                    <View style={styles.listInfo}>
                      <Text style={styles.listLabel}>CLIENT STORY</Text>
                      <Text style={styles.listTitle} numberOfLines={2}>{article.title || 'Untitled'}</Text>
                      <Text style={styles.listMeta}>{formatDate(article.date)}</Text>
                    </View>
                    <Icon name="chevron-forward" size={17} color={colors.muted} />
                  </TouchableOpacity>
                ))}
                {loadingMore && <View style={styles.loadingMore}><ActivityIndicator size="small" color={colors.primary} /></View>}
              </>
            ) : (
              <View style={styles.siteList}>
                {sectionItems.map((item) => (
                  <TouchableOpacity key={item.key} style={styles.siteRow} activeOpacity={0.88} accessibilityRole="button" onPress={() => openSiteItem(item)}>
                    <View style={styles.siteIcon}><Icon name={item.icon} size={21} color={colors.primary} /></View>
                    <Text style={styles.siteTitle}>{item.title}</Text>
                    <Icon name={item.type === 'external' ? 'open-outline' : 'chevron-forward'} size={17} color={colors.muted} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}
        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scrollContent: { flexGrow: 1 },
  landing: { flexGrow: 1 },
  headerTitle: { color: colors.ink, fontSize: 30, lineHeight: 34, fontWeight: '800', letterSpacing: -0.7 },
  headerSub: { color: colors.muted, fontSize: 13, lineHeight: 18 },
  feature: { backgroundColor: colors.primary, minHeight: 224, flexGrow: 1, marginHorizontal: 18, marginBottom: 22, padding: 22, borderRadius: 21, justifyContent: 'space-between', overflow: 'hidden' },
  featureCircleLarge: { position: 'absolute', right: -85, top: -105, width: 240, height: 240, borderRadius: 120, borderWidth: 28, borderColor: 'rgba(255,255,255,0.09)' },
  featureCircleSmall: { position: 'absolute', right: 13, bottom: -75, width: 130, height: 130, borderRadius: 65, borderWidth: 18, borderColor: 'rgba(255,255,255,0.06)' },
  featureTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  featureKicker: { color: '#FFFFFF', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  featureBottom: { gap: 9 },
  featureTitle: { color: '#FFFFFF', fontSize: 26, lineHeight: 29, fontWeight: '800', maxWidth: 270 },
  featureDescription: { color: 'rgba(255,255,255,0.84)', fontSize: 13 },
  featureLink: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 5 },
  featureLinkText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  paths: { flexGrow: 1.5, paddingHorizontal: 18, paddingBottom: 20 },
  pathsHeading: { marginHorizontal: 4, marginBottom: 12, color: colors.ink, fontSize: 16, fontWeight: '800' },
  pathRow: { minHeight: 86, flexGrow: 1, backgroundColor: '#FFFFFF', borderRadius: 17, padding: 15, marginBottom: 9, flexDirection: 'row', alignItems: 'center', gap: 13, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.035, shadowRadius: 10, elevation: 1 },
  pathIcon: { width: 45, height: 45, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  tealIcon: { backgroundColor: colors.primarySoft },
  oliveIcon: { backgroundColor: colors.accentSoft },
  tanIcon: { backgroundColor: colors.brownSoft },
  pathCopy: { flex: 1, gap: 3 },
  pathTitle: { color: colors.ink, fontSize: 15, fontWeight: '800' },
  pathDescription: { color: colors.muted, fontSize: 12 },
  detailHeader: { paddingHorizontal: 23, paddingTop: 18, paddingBottom: 20, gap: 7 },
  backButton: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', marginBottom: 8 },
  backText: { color: colors.primary, fontSize: 14, fontWeight: '700' },
  loadingBox: { alignItems: 'center', paddingVertical: 50 },
  errorBox: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 30, gap: 12 },
  errorText: { color: colors.muted, fontSize: 14, textAlign: 'center', lineHeight: 20 },
  retryButton: { backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 24, paddingVertical: 10 },
  retryText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  emptyText: { color: colors.muted, textAlign: 'center', paddingVertical: 35, fontSize: 14 },
  listCard: { marginHorizontal: 18, marginBottom: 10, padding: 14, backgroundColor: '#FFFFFF', borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 1 },
  listImage: { width: 52, height: 52, borderRadius: 12, backgroundColor: colors.warm },
  listIcon: { width: 52, height: 52, borderRadius: 12, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  listInfo: { flex: 1 },
  listLabel: { color: colors.primary, fontSize: 10, fontWeight: '800', letterSpacing: 0.6, marginBottom: 3 },
  listTitle: { color: colors.ink, fontSize: 14, fontWeight: '700', lineHeight: 20, marginBottom: 4 },
  listMeta: { color: colors.muted, fontSize: 12 },
  loadingMore: { alignItems: 'center', paddingVertical: 18 },
  siteList: { paddingHorizontal: 18 },
  siteRow: { minHeight: 68, backgroundColor: '#FFFFFF', borderRadius: 15, paddingHorizontal: 15, marginBottom: 9, flexDirection: 'row', alignItems: 'center', gap: 13, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.035, shadowRadius: 8, elevation: 1 },
  siteIcon: { width: 40, height: 40, borderRadius: 11, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  siteTitle: { flex: 1, color: colors.ink, fontSize: 14, fontWeight: '700' },
  bottomSpace: { height: 20 },
});
