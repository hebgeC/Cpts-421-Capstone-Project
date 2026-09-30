import React from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView,
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';

const RESOURCES = [
  { icon: 'heart-outline', label: 'Donation Portal', color: '#C0392B', url: 'https://support.trm.org' },
  { icon: 'gift-outline', label: 'In-Kind Giving', color: '#27AE60', url: 'https://www.trm.org/inkind/' },
  { icon: 'people-outline', label: 'About TRM', color: '#8B6B5A', url: 'https://www.trm.org/about/' },
  { icon: 'help-circle-outline', label: 'Help & Support', color: '#E67E22', url: 'https://www.trm.org/contact/' },
];

export default function InformationScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Information</Text>
          <Text style={styles.headerSub}>Helpful links from Tacoma Rescue Mission</Text>
        </View>

        <View style={styles.menuCard}>
          {RESOURCES.map((item, i) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.menuRow, i < RESOURCES.length - 1 && styles.menuRowBorder]}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('WebView', { url: item.url, title: item.label })}
            >
              <View style={[styles.menuIcon, { backgroundColor: item.color + '18' }]}>
                <Icon name={item.icon} size={18} color={item.color} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Icon name="chevron-forward" size={16} color="#CCCCCC" />
            </TouchableOpacity>
          ))}
        </View>

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
  menuCard: {
    backgroundColor: '#FFFFFF', marginHorizontal: 20, borderRadius: 16, marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    overflow: 'hidden',
  },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 14 },
  menuRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  menuIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: 15, color: '#2C1810', fontWeight: '500' },
});
