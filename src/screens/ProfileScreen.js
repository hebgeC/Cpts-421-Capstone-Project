//
//  ProfileScreen.js
//  
//
//  Created by ethan frazier on 4/5/26.
//

import React, { useContext } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { AuthContext } from '../context/AuthContext';

const SETTINGS = [
  { icon: 'notifications-outline', label: 'Notifications', color: '#C0392B' },
  { icon: 'calendar-outline', label: 'Volunteer Schedule', color: '#E67E22' },
  { icon: 'location-outline', label: 'Nearby Shelters', color: '#27AE60' },
  { icon: 'download-outline', label: 'Offline Access', color: '#2980B9' },
];

const INFO = [
  { icon: 'heart-outline', label: 'Donation Portal', color: '#C0392B' },
  { icon: 'people-outline', label: 'About TRM', color: '#8B6B5A' },
  { icon: 'help-circle-outline', label: 'Help & Support', color: '#E67E22' },
  { icon: 'call-outline', label: 'Emergency Contacts', color: '#27AE60' },
];

const STATS = [
  { label: 'Hours Served', value: '14' },
  { label: 'Drives Joined', value: '3' },
  { label: 'Meals Helped', value: '120' },
];

export default function ProfileScreen() {
  const { setIsLoggedIn } = useContext(AuthContext);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => setIsLoggedIn(false) },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Profile</Text>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>ðŸ™</Text>
          </View>
          <Text style={styles.userName}>Alex Volunteer</Text>
          <Text style={styles.userEmail}>alex@tacomarescue.org</Text>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Icon name="ribbon-outline" size={13} color="#C0392B" />
              <Text style={styles.badgeText}>Active Volunteer</Text>
            </View>
          </View>
        </View>

        <View style={styles.statsRow}>
          {STATS.map((s, i) => (
            <View key={i} style={[styles.statBox, i < STATS.length - 1 && styles.statBorder]}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionLabel}>VOLUNTEER TOOLS</Text>
        <View style={styles.menuCard}>
          {SETTINGS.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.menuRow, i < SETTINGS.length - 1 && styles.menuRowBorder]}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIcon, { backgroundColor: item.color + '18' }]}>
                <Icon name={item.icon} size={18} color={item.color} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Icon name="chevron-forward" size={16} color="#CCCCCC" />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>RESOURCES</Text>
        <View style={styles.menuCard}>
          {INFO.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.menuRow, i < INFO.length - 1 && styles.menuRowBorder]}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIcon, { backgroundColor: item.color + '18' }]}>
                <Icon name={item.icon} size={18} color={item.color} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Icon name="chevron-forward" size={16} color="#CCCCCC" />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.signOutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <Icon name="log-out-outline" size={18} color="#C0392B" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Tacoma Rescue Mission v1.0.0</Text>
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FDF6F0' },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#2C1810', letterSpacing: -0.5 },
  profileCard: {
    alignItems: 'center', backgroundColor: '#FFFFFF',
    marginHorizontal: 20, borderRadius: 20, paddingVertical: 28,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
    marginBottom: 16,
  },
  avatarCircle: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#FDECEA',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    borderWidth: 3, borderColor: '#C0392B',
  },
  avatarEmoji: { fontSize: 38 },
  userName: { fontSize: 20, fontWeight: '800', color: '#2C1810' },
  userEmail: { fontSize: 13, color: '#8B6B5A', marginTop: 2, marginBottom: 12 },
  badgeRow: { flexDirection: 'row', gap: 8 },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#FDECEA', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5,
  },
  badgeText: { fontSize: 12, color: '#C0392B', fontWeight: '700' },
  statsRow: {
    flexDirection: 'row', backgroundColor: '#FFFFFF',
    marginHorizontal: 20, borderRadius: 16, marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  statBox: { flex: 1, alignItems: 'center', paddingVertical: 16 },
  statBorder: { borderRightWidth: 1, borderRightColor: '#F0F0F0' },
  statValue: { fontSize: 22, fontWeight: '800', color: '#C0392B' },
  statLabel: { fontSize: 11, color: '#8B6B5A', marginTop: 2, fontWeight: '600' },
  sectionLabel: { fontSize: 11, color: '#AAAAAA', fontWeight: '700', letterSpacing: 1, paddingHorizontal: 20, marginBottom: 8 },
  menuCard: {
    backgroundColor: '#FFFFFF', marginHorizontal: 20, borderRadius: 16, marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    overflow: 'hidden',
  },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 14 },
  menuRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  menuIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: 15, color: '#2C1810', fontWeight: '500' },
  signOutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#FEF0EE', marginHorizontal: 20, borderRadius: 14, paddingVertical: 14,
    marginBottom: 12, borderWidth: 1, borderColor: '#FABAD5',
  },
  signOutText: { color: '#C0392B', fontWeight: '700', fontSize: 15 },
  version: { textAlign: 'center', fontSize: 12, color: '#CCCCCC', marginBottom: 8 },
});
