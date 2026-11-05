import { colors } from '../theme/colors';
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import ScreenHeader from '../components/ScreenHeader';

const VOLUNTEER_SIGN_IN_URL = 'https://rescue-mission.volunteerhub.com/account/signin?ReturnUrl=%2F';

const VOLUNTEER_OPTIONS = [
  {
    title: 'Create Your TRM Volunteer Account',
    description: 'Visit the volunteer portal to sign-up and see opportunities to serve.',
    url: VOLUNTEER_SIGN_IN_URL,
    imageUrl: 'https://www.trm.org/wp-content/uploads/2023/05/TRM-Volunteers-03.jpg',
  },
  {
    title: 'Returning Volunteers',
    description: 'View available volunteer shifts here.',
    url: VOLUNTEER_SIGN_IN_URL,
    imageUrl: 'https://www.trm.org/wp-content/uploads/2025/02/Untitled-design-48.png',
  },
  {
    title: 'Group Volunteering (5 or more people)',
    description: 'Friends, coworkers, military, churches, civic groups and classmates all welcome.',
    url: 'https://www.trm.org/group-volunteer-opportunities',
    imageUrl: 'https://www.trm.org/wp-content/uploads/2025/02/IMG_0153-scaled-e1738962096722.jpg',
  },
  {
    title: 'Court-Ordered Community Service',
    description: 'Learn how to complete your community service hours with TRM.',
    url: 'https://www.trm.org/communityservice/',
    imageUrl: 'https://www.trm.org/wp-content/uploads/2023/05/TRM-Volunteers-01.jpg',
  },
];

function VolunteerOptionCard({ option, onPress }) {
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`${option.title}. ${option.description}`}
      onPress={onPress}
    >
      <View style={styles.cardInner}>
        <Image
          source={{ uri: option.imageUrl }}
          style={styles.photo}
          resizeMode="cover"
          accessibilityLabel={`${option.title} photo`}
        />

        <View style={styles.cardContent}>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>{option.title}</Text>
            <Text style={styles.cardDescription} numberOfLines={1}>{option.description}</Text>
          </View>
          <Icon name="chevron-forward" size={20} color={colors.primary} style={styles.arrow} />
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
        <ScreenHeader title="Volunteer" />

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
  safe: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, paddingBottom: 10 },
  options: { flexGrow: 1, paddingHorizontal: 20, marginTop: 8, gap: 8 },
  card: {
    flex: 1,
    minHeight: 88,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 4,
  },
  cardInner: {
    flex: 1,
    justifyContent: 'flex-end',
    minHeight: 88,
    borderRadius: 20,
    overflow: 'hidden',
  },
  photo: StyleSheet.absoluteFillObject,
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 14, lineHeight: 17, fontWeight: '800', color: colors.ink },
  cardDescription: { fontSize: 11, lineHeight: 14, color: colors.muted, marginTop: 2 },
  arrow: { marginLeft: 10 },
});
