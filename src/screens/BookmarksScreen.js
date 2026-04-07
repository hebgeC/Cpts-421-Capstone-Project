//
//  BookmarksScreen.js
//  
//
//  Created by ethan frazier on 4/5/26.
//

import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ARTICLES } from '../data/content';

export default function BookmarksScreen({ navigation }) {
  const bookmarked = ARTICLES.slice(0, 3);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Saved Resources</Text>
          <Text style={styles.headerSub}>{bookmarked.length} items saved</Text>
        </View>

        <View style={styles.collectionCard}>
          <View style={styles.collectionHeader}>
            <Text style={styles.collectionTitle}>My Reading List</Text>
            <Icon name="folder-outline" size={18} color="#C0392B" />
          </View>
          {bookmarked.map((article, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.bookmarkItem, i < bookmarked.length - 1 && styles.bookmarkItemBorder]}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('Article', { article })}
            >
              <Text style={styles.bookmarkEmoji}>{article.emoji}</Text>
              <View style={styles.bookmarkInfo}>
                <Text style={styles.bookmarkCategory}>{article.category}</Text>
                <Text style={styles.bookmarkTitle} numberOfLines={2}>{article.title}</Text>
                <View style={styles.bookmarkMeta}>
                  <Icon name="time-outline" size={12} color="#AAAAAA" />
                  <Text style={styles.bookmarkMetaText}>{article.readTime} min read</Text>
                </View>
              </View>
              <Icon name="chevron-forward" size={16} color="#CCCCCC" />
            </TouchableOpacity>
          ))}
        </View>

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
  bookmarkEmoji: { fontSize: 30, width: 48, textAlign: 'center' },
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
