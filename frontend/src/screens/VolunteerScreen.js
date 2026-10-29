import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';

const VOLUNTEER_SIGN_IN_URL = 'https://rescue-mission.volunteerhub.com/account/signin?ReturnUrl=%2F';

const VOLUNTEER_OPTIONS = [
  {
    label: 'NEW VOLUNTEERS',
    title: 'Create Your TRM Volunteer Account',
    description: 'Visit the volunteer portal to sign-up and see opportunities to serve.',
    action: 'Get started',
    url: VOLUNTEER_SIGN_IN_URL,
    imageUrl: 'https://www.trm.org/wp-content/uploads/2023/05/TRM-Volunteers-03.jpg',
  },
  {
    label: 'WELCOME BACK',
    title: 'Returning Volunteers',
    description: 'View available volunteer shifts here.',
    action: 'View shifts',
    url: VOLUNTEER_SIGN_IN_URL,
    imageUrl: 'https://www.trm.org/wp-content/uploads/2025/02/Untitled-design-48.png',
  },
  {
    label: 'GROUPS OF 5+',
    title: 'Group Volunteering (5 or more people)',
    description: 'Friends, coworkers, military, churches, civic groups and classmates all welcome.',
    action: 'Explore group options',
    url: 'https://www.trm.org/group-volunteer-opportunities',
    imageUrl: 'https://www.trm.org/wp-content/uploads/2025/02/IMG_0153-scaled-e1738962096722.jpg',
  },
];

function VolunteerOptionCard({ option, onPress }) {
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`${option.title}. ${option.description}. ${option.action}`}
      onPress={onPress}
    >
      <View style={styles.cardInner}>
        <View style={styles.photoArea}>
          <Image
            source={{ uri: option.imageUrl }}
            style={styles.photo}
            resizeMode="cover"
            accessibilityLabel={`${option.title} photo`}
          />
          <View style={styles.photoShade} />
          <View style={styles.photoLabel}>
            <Text style={styles.photoLabelText}>{option.label}</Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{option.title}</Text>
          <Text style={styles.cardDescription} numberOfLines={1}>{option.description}</Text>
          <View style={styles.cardAction}>
            <Text style={styles.cardActionText}>{option.action}</Text>
            <View style={styles.arrowCircle}>
              <Icon name="arrow-forward" size={17} color="#FFFFFF" />
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function VolunteerScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Volunteer</Text>
        <Text style={styles.subtitle}>Choose how you'd like to serve with Tacoma Rescue Mission.</Text>

        <View style={styles.options}>
          {VOLUNTEER_OPTIONS.map((option) => (
            <VolunteerOptionCard
              key={option.title}
              option={option}
              onPress={() => navigation.navigate('WebView', { url: option.url, title: option.title })}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FDF6F0' },
  content: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 },
  title: { fontSize: 26, fontWeight: '800', color: '#2C1810', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, lineHeight: 18, color: '#8B6B5A', marginTop: 3 },
  options: { flexGrow: 1, marginTop: 14, gap: 10 },
  card: {
    flexGrow: 1,
    minHeight: 136,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#2C1810',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 4,
  },
  cardInner: {
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
  },
  photoArea: {
    flex: 1,
    minHeight: 40,
    backgroundColor: '#8B6B5A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photo: { width: '100%', height: '100%', position: 'absolute' },
  photoShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(44,24,16,0.18)',
  },
  photoLabel: {
    position: 'absolute',
    top: 9,
    left: 11,
    backgroundColor: '#FFFFFF',
    borderRadius: 100,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  photoLabelText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.8, color: '#7A271F' },
  cardContent: { paddingHorizontal: 14, paddingTop: 9, paddingBottom: 9 },
  cardTitle: { fontSize: 16, lineHeight: 20, fontWeight: '800', color: '#2C1810' },
  cardDescription: { fontSize: 11, lineHeight: 15, color: '#6F625B', marginTop: 3 },
  cardAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F2E8E1',
  },
  cardActionText: { fontSize: 12, fontWeight: '800', color: '#A32F24' },
  arrowCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#C0392B',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
