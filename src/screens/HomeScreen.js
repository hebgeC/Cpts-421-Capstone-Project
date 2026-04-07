//
//  HomeScreen.js
//  
//
//  Created by ethan frazier on 4/5/26.
//

import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ARTICLES, CATEGORIES } from '../data/content';

export default function HomeScreen({ navigation }) {
  const featured = ARTICLES[0];
  const recent = ARTICLES.slice(1, 5);

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

        {/* Urgent needs banner */}
        <View style={styles.urgentBanner}>
          <Icon name="alert-circle" size={16} color="#C0392B" />
          <Text style={styles.urgentText}>Urgent: Winter shelter drive needs volunteers this weekend</Text>
        </View>

        {/* Search bar */}
        <TouchableOpacity style={styles.searchBar} activeOpacity={0.8}>
          <Icon name="search-outline" size={18} color="#AAAAAA" />
          <Text style={styles.searchText}>Search drives, events, resources...</Text>
        </TouchableOpacity>

        {/* Category pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={{ paddingHorizontal: 20 }}
        >
          {CATEGORIES.map((cat, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.categoryPill, i === 0 && styles.categoryPillActive]}
            >
              <Text style={[styles.categoryText, i === 0 && styles.categoryTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured</Text>
          <TouchableOpacity><Text style={styles.seeAll}>See all</Text></TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.featuredCard}
          activeOpacity={0.92}
          onPress={() => navigation.navigate('Article', { article: featured })}
        >
          <View style={styles.featuredImageBg}>
            <Text style={styles.featuredEmoji}>{featured.emoji}</Text>
          </View>
          <View style={styles.featuredOverlay}>
            <View style={styles.featuredTag}>
              <Text style={styles.featuredTagText}>{featured.category}</Text>
            </View>
            <Text style={styles.featuredTitle}>{featured.title}</Text>
            <View style={styles.featuredMeta}>
              <Icon name="time-outline" size={13} color="rgba(255,255,255,0.8)" />
              <Text style={styles.featuredMetaText}>
                {featured.readTime} min read Â· {featured.date}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Recent */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Latest Updates</Text>
          <TouchableOpacity><Text style={styles.seeAll}>See all</Text></TouchableOpacity>
        </View>

        {recent.map((article, i) => (
          <TouchableOpacity
            key={i}
            style={styles.articleCard}
            activeOpacity={0.88}
            onPress={() => navigation.navigate('Article', { article })}
          >
            <View style={styles.articleEmoji}>
              <Text style={{ fontSize: 28 }}>{article.emoji}</Text>
            </View>
            <View style={styles.articleInfo}>
              <Text style={styles.articleCategory}>{article.category}</Text>
              <Text style={styles.articleTitle} numberOfLines={2}>{article.title}</Text>
              <View style={styles.articleMeta}>
                <Icon name="time-outline" size={12} color="#AAAAAA" />
                <Text style={styles.articleMetaText}>
                  {article.readTime} min Â· {article.date}
                </Text>
              </View>
            </View>
            <Icon name="chevron-forward" size={16} color="#CCCCCC" />
          </TouchableOpacity>
        ))}

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
  categoryScroll: { marginBottom: 8 },
  categoryPill: {
    backgroundColor: '#FFFFFF', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8,
    marginRight: 8, borderWidth: 1.5, borderColor: '#EBEBEB',
  },
  categoryPillActive: { backgroundColor: '#C0392B', borderColor: '#C0392B' },
  categoryText: { fontSize: 13, color: '#555', fontWeight: '600' },
  categoryTextActive: { color: '#FFFFFF' },
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
  featuredImageBg: {
    ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', opacity: 0.15,
  },
  featuredEmoji: { fontSize: 120 },
  featuredOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20 },
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
  articleInfo: { flex: 1 },
  articleCategory: { fontSize: 11, color: '#C0392B', fontWeight: '700', letterSpacing: 0.5, marginBottom: 3, textTransform: 'uppercase' },
  articleTitle: { fontSize: 14, fontWeight: '700', color: '#2C1810', lineHeight: 20, marginBottom: 6 },
  articleMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  articleMetaText: { fontSize: 12, color: '#AAAAAA' },
});
