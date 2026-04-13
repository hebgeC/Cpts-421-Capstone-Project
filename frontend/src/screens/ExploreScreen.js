//
//  ExploreScreen.js
//  
//
//  Created by ethan frazier on 4/5/26.
//

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView,
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { ARTICLES, CATEGORY_DATA } from '../data/content';

export default function ExploreScreen({ navigation }) {
  const [activeCategory, setActiveCategory] = useState(null);

  const filtered = activeCategory
    ? ARTICLES.filter(a => a.category === activeCategory)
    : ARTICLES;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Get Involved</Text>
          <Text style={styles.headerSub}>Find ways to serve your community</Text>
        </View>

        {!activeCategory && (
          <View style={styles.categoryGrid}>
            {CATEGORY_DATA.map((cat, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.categoryCard, { backgroundColor: cat.bg }]}
                onPress={() => setActiveCategory(cat.name)}
                activeOpacity={0.88}
              >
                <Text style={styles.catEmoji}>{cat.icon}</Text>
                <Text style={[styles.catName, { color: cat.color }]}>{cat.name}</Text>
                <Text style={[styles.catCount, { color: cat.color + 'AA' }]}>
                  {cat.count} resources
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {activeCategory && (
          <View style={styles.filterHeader}>
            <TouchableOpacity style={styles.backPill} onPress={() => setActiveCategory(null)}>
              <Icon name="arrow-back" size={16} color="#C0392B" />
              <Text style={styles.backPillText}>All Categories</Text>
            </TouchableOpacity>
            <Text style={styles.filterTitle}>{activeCategory}</Text>
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {activeCategory ? `${activeCategory} Resources` : 'All Resources'}
          </Text>
        </View>

        {filtered.map((article, i) => (
          <TouchableOpacity
            key={i}
            style={styles.listCard}
            activeOpacity={0.88}
            onPress={() => navigation.navigate('Article', { article })}
          >
            <View style={styles.listNumber}>
              <Text style={styles.listNumberText}>{i + 1}</Text>
            </View>
            <View style={styles.listEmoji}>
              <Text style={{ fontSize: 26 }}>{article.emoji}</Text>
            </View>
            <View style={styles.listInfo}>
              <Text style={styles.listCategory}>{article.category}</Text>
              <Text style={styles.listTitle} numberOfLines={2}>{article.title}</Text>
              <View style={styles.listMeta}>
                <Icon name="time-outline" size={12} color="#AAAAAA" />
                <Text style={styles.listMetaText}>{article.readTime} min read</Text>
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
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#2C1810', letterSpacing: -0.5 },
  headerSub: { fontSize: 14, color: '#8B6B5A', marginTop: 2 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 14, gap: 10, marginBottom: 24 },
  categoryCard: {
    width: '47%', borderRadius: 18, padding: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  catEmoji: { fontSize: 32, marginBottom: 10 },
  catName: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  catCount: { fontSize: 12, fontWeight: '500' },
  filterHeader: { paddingHorizontal: 20, marginBottom: 8 },
  backPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-start', backgroundColor: '#FDECEA', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6, marginBottom: 12,
  },
  backPillText: { color: '#C0392B', fontWeight: '600', fontSize: 13 },
  filterTitle: { fontSize: 22, fontWeight: '800', color: '#2C1810' },
  sectionHeader: { paddingHorizontal: 20, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#2C1810' },
  listCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFFFF', marginHorizontal: 20, marginBottom: 10,
    borderRadius: 16, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  listNumber: { width: 24, alignItems: 'center', marginRight: 8 },
  listNumberText: { fontSize: 12, color: '#CCCCCC', fontWeight: '700' },
  listEmoji: {
    width: 52, height: 52, borderRadius: 14, backgroundColor: '#FDF6F0',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  listInfo: { flex: 1 },
  listCategory: { fontSize: 11, color: '#C0392B', fontWeight: '700', letterSpacing: 0.5, marginBottom: 3, textTransform: 'uppercase' },
  listTitle: { fontSize: 14, fontWeight: '700', color: '#2C1810', lineHeight: 20, marginBottom: 5 },
  listMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  listMetaText: { fontSize: 12, color: '#AAAAAA' },
});
