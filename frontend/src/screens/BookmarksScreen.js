import React, { useContext } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView,
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { SavedResourcesContext } from '../context/SavedResourcesContext';

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function BookmarksScreen({ navigation }) {
  const { savedResources, removeSaved } = useContext(SavedResourcesContext);

  const openResource = (resource) => {
    if (resource.resourceType === 'page') {
      navigation.navigate('PageDetail', { slug: resource.slug, title: resource.title });
      return;
    }
    if (resource.resourceType === 'external') {
      navigation.navigate('WebView', { url: resource.url, title: resource.title });
      return;
    }
    navigation.navigate('Article', { article: resource });
  };

  const getCategory = (resource) => {
    if (resource.resourceType === 'page') return resource.categoryTitle || 'Resource';
    if (resource.resourceType === 'external') return 'On trm.org';
    return resource.kind === 'updates' ? 'Update' : 'Client Story';
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Saved Resources</Text>
          <Text style={styles.headerSub}>{savedResources.length} items saved</Text>
        </View>

        {savedResources.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="bookmark-outline" size={34} color="#C0392B" />
            <Text style={styles.emptyTitle}>No saved resources yet</Text>
            <Text style={styles.emptyText}>Use the bookmark icon on a resource to add it here.</Text>
          </View>
        ) : (
          <View style={styles.collectionCard}>
            <View style={styles.collectionHeader}>
              <Text style={styles.collectionTitle}>My Resources</Text>
              <Icon name="folder-outline" size={18} color="#C0392B" />
            </View>
            {savedResources.map((resource, i) => (
              <View
                key={resource.savedKey}
                style={[styles.bookmarkItem, i < savedResources.length - 1 && styles.bookmarkItemBorder]}
              >
                <TouchableOpacity
                  style={styles.bookmarkMain}
                  activeOpacity={0.85}
                  onPress={() => openResource(resource)}
                >
                  <View style={styles.bookmarkIcon}>
                    <Icon
                      name={resource.icon || (resource.resourceType === 'external' ? 'open-outline' : 'document-text-outline')}
                      size={22}
                      color="#C0392B"
                    />
                  </View>
                  <View style={styles.bookmarkInfo}>
                    <Text style={styles.bookmarkCategory}>{getCategory(resource)}</Text>
                    <Text style={styles.bookmarkTitle} numberOfLines={2}>{resource.title}</Text>
                    {resource.date ? (
                      <View style={styles.bookmarkMeta}>
                        <Icon name="time-outline" size={12} color="#AAAAAA" />
                        <Text style={styles.bookmarkMetaText}>{formatDate(resource.date)}</Text>
                      </View>
                    ) : null}
                  </View>
                  <Icon name="chevron-forward" size={16} color="#CCCCCC" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeSaved(resource)}
                  accessibilityLabel={`Remove ${resource.title} from saved resources`}
                >
                  <Icon name="trash-outline" size={19} color="#C0392B" />
                </TouchableOpacity>
              </View>
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
  emptyState: { alignItems: 'center', paddingHorizontal: 40, paddingVertical: 64, gap: 8 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#2C1810', marginTop: 6 },
  emptyText: { fontSize: 13, color: '#8B6B5A', lineHeight: 19, textAlign: 'center' },
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
  bookmarkItem: { flexDirection: 'row', alignItems: 'center' },
  bookmarkItemBorder: { borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  bookmarkMain: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  bookmarkIcon: {
    width: 48, height: 48, borderRadius: 14, backgroundColor: '#FDF6F0',
    alignItems: 'center', justifyContent: 'center',
  },
  bookmarkInfo: { flex: 1 },
  bookmarkCategory: { fontSize: 11, color: '#C0392B', fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 3 },
  bookmarkTitle: { fontSize: 14, fontWeight: '700', color: '#2C1810', lineHeight: 20, marginBottom: 5 },
  bookmarkMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  bookmarkMetaText: { fontSize: 12, color: '#AAAAAA' },
  removeButton: { paddingHorizontal: 16, paddingVertical: 24 },
  tipBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 20, marginTop: 16, padding: 14,
    backgroundColor: '#FFFFFF', borderRadius: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  tipText: { fontSize: 13, color: '#8B6B5A', flex: 1 },
});
