import { colors } from '../theme/colors';
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView,
  ActivityIndicator, Image as NativeImage, Linking, Platform,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { Ionicons as Icon } from '@expo/vector-icons';
import { getArticles, getUpdates, getSiteMap } from '../services/wordpress';
import { getEvents } from '../services/events';
import ScreenHeader from '../components/ScreenHeader';

const contactPages = getSiteMap().items.filter((item) => item.category === 'contact');
const UPDATE_FRESHNESS_MS = 90 * 24 * 60 * 60 * 1000;

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function eventDate(value) {
  return new Date((value || '').replace(' ', 'T'));
}

function localDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function FeaturedStoryImage({ article }) {
  const [uri, setUri] = useState(article.image);

  useEffect(() => { setUri(article.image); }, [article.id, article.image]);

  if (!uri) {
    return (
      <View style={styles.featuredImageBg}>
        <Icon name="heart" size={100} color="rgba(255,255,255,0.4)" />
      </View>
    );
  }

  return (
    <NativeImage
      testID="featured-story-image"
      source={{ uri }}
      style={styles.featuredImage}
      resizeMode="cover"
      onError={({ nativeEvent }) => {
        console.warn('Featured story photo failed to load:', uri, nativeEvent?.error);
        setUri(uri === article.image && article.imageOriginal && article.imageOriginal !== uri
          ? article.imageOriginal : null);
      }}
    />
  );
}

export default function HomeScreen({ navigation }) {
  const [articles, setArticles] = useState([]);
  const [latestUpdate, setLatestUpdate] = useState(null);
  const [upcomingEvent, setUpcomingEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      setUpcomingEvent(null);
      const [articlesData, updatesData] = await Promise.all([getArticles(1, 1), getUpdates()]);
      setArticles((articlesData.articles || []).map((a) => ({ ...a, kind: 'articles' })));
      const newest = (updatesData || []).filter((u) => u.title)
        .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))[0];
      setLatestUpdate(newest ? { ...newest, kind: 'updates' } : null);
      const now = new Date();
      const updateDate = new Date(newest?.date || '').getTime();
      if (!Number.isFinite(updateDate) || now.getTime() - updateDate > UPDATE_FRESHNESS_MS) {
        // Events are optional: a failed feed should not hide stories or updates.
        const eventsData = await getEvents({ perPage: 20, startDate: localDateKey(now) })
          .catch(() => ({ events: [] }));
        const nextEvent = (eventsData.events || [])
          .filter((event) => {
            const start = eventDate(event.startDate);
            return event.title && event.url && Number.isFinite(start.getTime())
              && (event.allDay ? localDateKey(start) >= localDateKey(now) : start >= now);
          })
          .sort((a, b) => eventDate(a.startDate) - eventDate(b.startDate))[0];
        setUpcomingEvent(nextEvent || null);
      }
    } catch (e) {
      setError('Could not load content. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const featured = articles[0];
  const spotlight = upcomingEvent || latestUpdate;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Stories & news" />
        {Platform.OS === 'web' && <a href="#XRZQFLRF" />}

        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}

        {!loading && error && (
          <View testID="home-error" style={styles.errorBox}>
            <Icon name="wifi-outline" size={24} color={colors.primary} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={load}>
              <Text style={styles.retryBtnText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && !error && (
          <View testID="home-ready">
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured Article</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Explore', { section: 'articles' })}>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>

            {featured ? (
              <TouchableOpacity
                style={styles.featuredCard}
                activeOpacity={0.92}
                onPress={() => navigation.navigate('Article', { article: featured })}
              >
                <FeaturedStoryImage article={featured} />
                <View style={styles.featuredOverlay}>
                  <View style={styles.featuredTag}>
                    <Text style={styles.featuredTagText}>FEATURED</Text>
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

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{upcomingEvent ? 'Upcoming event' : 'Latest from TRM'}</Text>
              {upcomingEvent && (
                <TouchableOpacity onPress={() => navigation.navigate('Events')}>
                  <Text style={styles.seeAll}>See all events</Text>
                </TouchableOpacity>
              )}
            </View>
            {spotlight ? (
              <TouchableOpacity
                style={styles.articleCard}
                activeOpacity={0.88}
                accessibilityRole="button"
                onPress={() => upcomingEvent
                  ? Linking.openURL(upcomingEvent.url)
                  : navigation.navigate('Article', { article: latestUpdate })}
              >
                {!upcomingEvent && latestUpdate?.image ? (
                  <ExpoImage source={{ uri: latestUpdate.imageThumbnail || latestUpdate.image }} style={styles.articleEmoji} contentFit="cover" cachePolicy="memory-disk" />
                ) : (
                  <View style={styles.articleEmoji}>
                    <Icon name={upcomingEvent ? 'calendar-outline' : 'megaphone-outline'} size={24} color={colors.primary} />
                  </View>
                )}
                <View style={styles.articleInfo}>
                  <Text style={styles.articleCategory}>{upcomingEvent ? 'Event' : 'Update'}</Text>
                  <Text style={styles.articleTitle} numberOfLines={2}>{spotlight.title}</Text>
                  <View style={styles.articleMeta}>
                    <Icon name="time-outline" size={12} color={colors.muted} />
                    <Text style={styles.articleMetaText}>
                      {upcomingEvent ? formatDate(eventDate(upcomingEvent.startDate)) : formatDate(latestUpdate.date)}
                    </Text>
                  </View>
                  {upcomingEvent?.venue ? (
                    <Text style={styles.eventVenue} numberOfLines={1}>{upcomingEvent.venue}</Text>
                  ) : null}
                </View>
                <Icon name="chevron-forward" size={16} color={colors.muted} />
              </TouchableOpacity>
            ) : (
              <View style={styles.updateEmpty}>
                <Text style={styles.emptyStateText}>No updates available right now.</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Get in touch</Text>
        </View>
        <View style={styles.contactRow}>
          {contactPages.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={styles.contactButton}
              activeOpacity={0.88}
              accessibilityRole="button"
              accessibilityLabel={item.title}
              onPress={() => navigation.navigate('PageDetail', { slug: item.slug, title: item.title })}
            >
              <View style={styles.contactIcon}>
                <Icon name={item.icon} size={22} color={colors.primary} />
              </View>
              <Text style={styles.contactTitle}>{item.title}</Text>
              <Icon name="arrow-forward" size={16} color={colors.primary} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  loadingBox: { alignItems: 'center', paddingVertical: 50, gap: 14 },
  errorBox: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 30, gap: 12 },
  errorText: { fontSize: 14, color: colors.muted, textAlign: 'center', lineHeight: 20 },
  retryBtn: { backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 24, paddingVertical: 10 },
  retryBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, marginTop: 20, marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18, fontWeight: '700', color: colors.ink,
    borderBottomWidth: 3, borderBottomColor: colors.accent, paddingBottom: 4,
  },
  seeAll: { fontSize: 13, color: colors.primary, fontWeight: '600' },
  featuredCard: {
    marginHorizontal: 20, borderRadius: 20, overflow: 'hidden',
    height: 220, backgroundColor: colors.primary,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 8,
  },
  featuredImage: { width: '100%', height: 220 },
  featuredImageBg: {
    ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center',
  },
  featuredOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  featuredTag: {
    backgroundColor: colors.primary, borderLeftWidth: 4, borderLeftColor: colors.secondary,
    alignSelf: 'flex-start',
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
    width: 56, height: 56, borderRadius: 14, backgroundColor: colors.background,
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  articleInfo: { flex: 1 },
  articleCategory: { fontSize: 11, color: colors.primary, fontWeight: '700', letterSpacing: 0.5, marginBottom: 3, textTransform: 'uppercase' },
  articleTitle: { fontSize: 14, fontWeight: '700', color: colors.ink, lineHeight: 20, marginBottom: 6 },
  articleMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  articleMetaText: { fontSize: 12, color: colors.muted },
  eventVenue: { fontSize: 12, color: colors.muted, marginTop: 4 },
  emptyState: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20 },
  emptyStateText: { fontSize: 14, color: colors.muted, fontStyle: 'italic' },
  updateEmpty: { marginHorizontal: 20, paddingVertical: 20, alignItems: 'center' },
  contactRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 10 },
  contactButton: {
    flex: 1, minHeight: 118, backgroundColor: colors.primarySoft, borderRadius: 16,
    padding: 14, justifyContent: 'space-between', alignItems: 'flex-start',
    borderBottomWidth: 3, borderBottomColor: colors.secondary,
  },
  contactIcon: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center',
  },
  contactTitle: { fontSize: 15, fontWeight: '700', color: colors.ink },
});
