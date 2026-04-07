//
//  ArticleScreen.js
//  
//
//  Created by ethan frazier on 4/5/26.
//

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export default function ArticleScreen({ route, navigation }) {
  const { article } = route.params;
  const [bookmarked, setBookmarked] = useState(false);
  const [liked, setLiked] = useState(false);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={20} color="#2C1810" />
        </TouchableOpacity>
        <View style={styles.topActions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => setBookmarked(!bookmarked)}>
            <Icon
              name={bookmarked ? 'bookmark' : 'bookmark-outline'}
              size={20}
              color={bookmarked ? '#C0392B' : '#2C1810'}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Icon name="share-outline" size={20} color="#2C1810" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>{article.emoji}</Text>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{article.category}</Text>
          </View>
          <View style={styles.metaInfo}>
            <Icon name="time-outline" size={13} color="#AAAAAA" />
            <Text style={styles.metaText}>{article.readTime} min read Â· {article.date}</Text>
          </View>
        </View>

        <Text style={styles.title}>{article.title}</Text>

        <View style={styles.authorRow}>
          <View style={styles.authorAvatar}>
            <Text style={{ fontSize: 16 }}>ðŸ‘¤</Text>
          </View>
          <View>
            <Text style={styles.authorName}>{article.author}</Text>
            <Text style={styles.authorRole}>{article.authorRole}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {article.content.map((section, i) => (
          <View key={i} style={styles.section}>
            {section.heading ? (
              <Text style={styles.sectionHeading}>{section.heading}</Text>
            ) : null}
            <Text style={styles.bodyText}>{section.body}</Text>
          </View>
        ))}

        <View style={styles.takeawaysBox}>
          <View style={styles.takeawaysHeader}>
            <Icon name="heart-outline" size={18} color="#C0392B" />
            <Text style={styles.takeawaysTitle}>Key Points</Text>
          </View>
          {article.takeaways.map((t, i) => (
            <View key={i} style={styles.takeawayRow}>
              <View style={styles.takeawayDot} />
              <Text style={styles.takeawayText}>{t}</Text>
            </View>
          ))}
        </View>

        {/* Donate / Volunteer CTA */}
        <View style={styles.ctaBox}>
          <Text style={styles.ctaTitle}>Ready to make a difference?</Text>
          <Text style={styles.ctaBody}>Your time and donations directly serve Tacoma's most vulnerable neighbors.</Text>
          <TouchableOpacity style={styles.ctaBtn}>
            <Icon name="hand-left-outline" size={16} color="#FFFFFF" />
            <Text style={styles.ctaBtnText}>Volunteer Now</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.likeRow}>
          <Text style={styles.likePrompt}>Was this helpful?</Text>
          <TouchableOpacity
            style={[styles.likeBtn, liked && styles.likeBtnActive]}
            onPress={() => setLiked(!liked)}
          >
            <Icon
              name={liked ? 'heart' : 'heart-outline'}
              size={18}
              color={liked ? '#FFFFFF' : '#C0392B'}
            />
            <Text style={[styles.likeBtnText, liked && styles.likeBtnTextActive]}>
              {liked ? 'Thank you!' : 'Helpful'}
            </Text>
          </TouchableOpacity>
        </View>

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
  topActions: { flexDirection: 'row', gap: 8 },
  actionBtn: { padding: 8, backgroundColor: '#FDF6F0', borderRadius: 12 },
  scrollContent: { paddingBottom: 20 },
  hero: { height: 200, backgroundColor: '#FDECEA', alignItems: 'center', justifyContent: 'center' },
  heroEmoji: { fontSize: 90 },
  metaRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 20, marginBottom: 12,
  },
  categoryBadge: { backgroundColor: '#FDECEA', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  categoryBadgeText: { color: '#C0392B', fontSize: 12, fontWeight: '700', letterSpacing: 0.4 },
  metaInfo: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { color: '#AAAAAA', fontSize: 12 },
  title: { fontSize: 24, fontWeight: '800', color: '#2C1810', paddingHorizontal: 20, lineHeight: 32, marginBottom: 16 },
  authorRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, gap: 12, marginBottom: 20 },
  authorAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F0F0F0', alignItems: 'center', justifyContent: 'center' },
  authorName: { fontSize: 14, fontWeight: '700', color: '#2C1810' },
  authorRole: { fontSize: 12, color: '#8B6B5A' },
  divider: { height: 1, backgroundColor: '#F5F5F5', marginHorizontal: 20, marginBottom: 24 },
  section: { paddingHorizontal: 20, marginBottom: 20 },
  sectionHeading: { fontSize: 17, fontWeight: '700', color: '#2C1810', marginBottom: 8 },
  bodyText: { fontSize: 15, color: '#4A3728', lineHeight: 25 },
  takeawaysBox: {
    backgroundColor: '#FEF0EE', marginHorizontal: 20, borderRadius: 16,
    padding: 18, marginTop: 8, marginBottom: 16,
    borderLeftWidth: 4, borderLeftColor: '#C0392B',
  },
  takeawaysHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  takeawaysTitle: { fontSize: 15, fontWeight: '700', color: '#C0392B' },
  takeawayRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  takeawayDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#C0392B', marginTop: 8 },
  takeawayText: { flex: 1, fontSize: 14, color: '#4A3728', lineHeight: 22 },
  ctaBox: {
    backgroundColor: '#C0392B', marginHorizontal: 20, borderRadius: 16,
    padding: 20, marginBottom: 20,
  },
  ctaTitle: { fontSize: 16, fontWeight: '800', color: '#FFFFFF', marginBottom: 6 },
  ctaBody: { fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 20, marginBottom: 14 },
  ctaBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10, paddingVertical: 10,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.4)',
  },
  ctaBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  likeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 },
  likePrompt: { fontSize: 15, color: '#8B6B5A', fontWeight: '500' },
  likeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1.5, borderColor: '#C0392B', borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 8,
  },
  likeBtnActive: { backgroundColor: '#C0392B', borderColor: '#C0392B' },
  likeBtnText: { color: '#C0392B', fontWeight: '600', fontSize: 14 },
  likeBtnTextActive: { color: '#FFFFFF' },
});
