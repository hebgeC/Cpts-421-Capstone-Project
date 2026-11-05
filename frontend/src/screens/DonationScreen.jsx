import { colors } from '../theme/colors';
import React from 'react';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const DONATE_URL = 'https://www.trm.org/donate/?form=FUNHYQKHUSS';
const PORTAL_URL = 'https://support.trm.org/login';

export default function DonationScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.intro}>
          <View style={styles.heartIcon}>
            <Icon name="heart" size={26} color={colors.donate} />
          </View>
          <Text style={styles.title}>Donate</Text>
          <Text style={styles.subtitle}>Support Tacoma Rescue Mission in the way that works for you.</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Donate Here"
            onPress={() => navigation.navigate('WebView', { url: DONATE_URL, title: 'Donate Here' })}
          >
            <View style={styles.buttonCopy}>
              <Text style={styles.primaryLabel}>Donate Here</Text>
              <Text style={styles.primaryDetail}>Make a gift online</Text>
            </View>
            <Icon name="arrow-forward-circle" size={30} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Donation Portal"
            onPress={() => navigation.navigate('WebView', { url: PORTAL_URL, title: 'Donation Portal' })}
          >
            <View style={styles.buttonCopy}>
              <Text style={styles.secondaryLabel}>Donation Portal</Text>
              <Text style={styles.secondaryDetail}>Sign in to your account</Text>
            </View>
            <Icon name="arrow-forward-circle-outline" size={30} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 32 },
  intro: { alignItems: 'center', marginBottom: 32 },
  heartIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.donateSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  title: { fontSize: 30, fontWeight: '800', color: colors.ink, letterSpacing: -0.5 },
  subtitle: {
    maxWidth: 290,
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    color: colors.muted,
    textAlign: 'center',
  },
  actions: { gap: 14 },
  primaryButton: {
    minHeight: 86,
    borderRadius: 18,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.donate,
    shadowColor: colors.donate,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 4,
  },
  secondaryButton: {
    minHeight: 86,
    borderRadius: 18,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  buttonCopy: { flex: 1 },
  primaryLabel: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  primaryDetail: { marginTop: 4, fontSize: 13, color: colors.donateSoft },
  secondaryLabel: { fontSize: 18, fontWeight: '800', color: colors.ink },
  secondaryDetail: { marginTop: 4, fontSize: 13, color: colors.muted },
});
