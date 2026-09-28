import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView,
  Image, Linking, useWindowDimensions,
} from 'react-native';
import RenderHTML from 'react-native-render-html';
import { Ionicons as Icon } from '@expo/vector-icons';

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function ArticleScreen({ route, navigation }) {
  const { article } = route.params;
  const { width } = useWindowDimensions();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={20} color="#2C1810" />
        </TouchableOpacity>
        {article.link ? (
          <TouchableOpacity style={styles.actionBtn} onPress={() => Linking.openURL(article.link)}>
            <Icon name="open-outline" size={20} color="#2C1810" />
          </TouchableOpacity>
        ) : <View style={styles.actionBtn} />}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {article.image ? (
          <Image source={{ uri: article.image }} style={styles.hero} resizeMode="cover" />
        ) : (
          <View style={[styles.hero, styles.heroFallback]}>
            <Icon name="heart" size={64} color="#C0392B" />
          </View>
        )}

        <View style={styles.metaRow}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>
              {article.kind === 'updates' ? 'Update' : 'Client Story'}
            </Text>
          </View>
          <View style={styles.metaInfo}>
            <Icon name="time-outline" size={13} color="#AAAAAA" />
            <Text style={styles.metaText}>{formatDate(article.date)}</Text>
          </View>
        </View>

        <Text style={styles.title}>{article.title || 'Untitled'}</Text>

        {article.author ? (
          <View style={styles.authorRow}>
            <View style={styles.authorAvatar}>
              <Icon name="person" size={16} color="#8B6B5A" />
            </View>
            <Text style={styles.authorName}>{article.author}</Text>
          </View>
        ) : null}

        <View style={styles.divider} />

        <View style={styles.section}>
          <RenderHTML
            contentWidth={width - 40}
            source={{ html: article.contentHtml || `<p>${article.excerpt || ''}</p>` }}
            baseStyle={styles.bodyText}
          />
        </View>

        {article.link ? (
          <TouchableOpacity style={styles.ctaBox} onPress={() => Linking.openURL(article.link)} activeOpacity={0.9}>
            <Text style={styles.ctaTitle}>Read the full story on trm.org</Text>
            <View style={styles.ctaBtn}>
              <Icon name="open-outline" size={16} color="#FFFFFF" />
              <Text style={styles.ctaBtnText}>Open on trm.org</Text>
            </View>
          </TouchableOpacity>
        ) : null}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  backBtn: { padding: 8, backgroundColor: '#FDF6F0', borderRadius: 12 },
  actionBtn: { padding: 8, backgroundColor: '#FDF6F0', borderRadius: 12 },
  scrollContent: { paddingBottom: 20 },
  hero: { height: 220, backgroundColor: '#FDECEA' },
  heroFallback: { alignItems: 'center', justifyContent: 'center' },
  metaRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 20, marginBottom: 12,
  },
  categoryBadge: { backgroundColor: '#FDECEA', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  categoryBadgeText: { color: '#C0392B', fontSize: 12, fontWeight: '700', letterSpacing: 0.4 },
  metaInfo: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { color: '#AAAAAA', fontSize: 12 },
  title: { fontSize: 24, fontWeight: '800', color: '#2C1810', paddingHorizontal: 20, lineHeight: 32, marginBottom: 12 },
  authorRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, gap: 10, marginBottom: 16 },
  authorAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F0F0F0', alignItems: 'center', justifyContent: 'center' },
  authorName: { fontSize: 14, fontWeight: '700', color: '#2C1810' },
  divider: { height: 1, backgroundColor: '#F5F5F5', marginHorizontal: 20, marginBottom: 20 },
  section: { paddingHorizontal: 20, marginBottom: 20 },
  bodyText: { fontSize: 15, color: '#4A3728', lineHeight: 25 },
  ctaBox: {
    backgroundColor: '#C0392B', marginHorizontal: 20, borderRadius: 16,
    padding: 20, marginBottom: 20,
  },
  ctaTitle: { fontSize: 16, fontWeight: '800', color: '#FFFFFF', marginBottom: 14 },
  ctaBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10, paddingVertical: 10,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.4)',
  },
  ctaBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
});
