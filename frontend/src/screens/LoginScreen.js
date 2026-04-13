import React, { useState, useContext } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, ActivityIndicator, Alert,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons as Icon } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';

// TRM's specific VolunteerHub login URL — found on trm.org/volunteer
const LOGIN_URL = 'https://rescue-mission.volunteerhub.com/account/signin?ReturnUrl=%2f';

export default function LoginScreen() {
  const { setIsLoggedIn, setUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      await WebBrowser.openBrowserAsync(LOGIN_URL);
      // Browser has closed — ask the user if they completed sign-in
      Alert.alert(
        'Did you sign in?',
        'If you completed sign-in on the VolunteerHub page, tap Continue to access your account.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Continue',
            onPress: () => {
              setUser({
                token: 'volunteerhub-session',
                displayName: 'Volunteer',
                source: 'volunteerhub',
                portalUrl: LOGIN_URL,
              });
              setIsLoggedIn(true);
            },
          },
        ]
      );
    } catch (e) {
      Alert.alert(
        'Connection Error',
        'Could not load the sign in page. Please check your internet connection.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.accentBar} />

      <View style={styles.topSection}>
        <View style={styles.logoCircle}>
          <Icon name="heart" size={32} color="#C0392B" />
        </View>
        <Text style={styles.appName}>Tacoma Rescue Mission</Text>
        <Text style={styles.tagline}>Serving our neighbors in need since 1912</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Welcome back</Text>
        <Text style={styles.cardSubtitle}>
          Sign in with your TRM VolunteerHub account to access your schedule and volunteer resources.
        </Text>

        <TouchableOpacity
          style={styles.loginBtn}
          onPress={handleSignIn}
          activeOpacity={0.9}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Icon name="log-in-outline" size={18} color="#FFFFFF" />
              <Text style={styles.loginBtnText}>Sign In with VolunteerHub</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={styles.guestBtn}
          onPress={() => setIsLoggedIn(true)}
        >
          <Text style={styles.guestBtnText}>Continue as Guest</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footerText}>
        Need an account?{'  '}
        <Text style={styles.footerLink}>Contact your coordinator</Text>
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FDF6F0' },
  accentBar: { height: 4, backgroundColor: '#C0392B' },
  topSection: {
    alignItems: 'center', paddingTop: 60, paddingBottom: 36, paddingHorizontal: 24,
  },
  logoCircle: {
    width: 72, height: 72, borderRadius: 22, backgroundColor: '#FDECEA',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
    shadowColor: '#C0392B', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 12, elevation: 4,
  },
  appName: {
    fontSize: 24, fontWeight: '800', color: '#2C1810',
    letterSpacing: -0.5, textAlign: 'center',
  },
  tagline: {
    fontSize: 13, color: '#8B6B5A', marginTop: 6,
    textAlign: 'center', lineHeight: 20,
  },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 24, padding: 28, marginHorizontal: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07, shadowRadius: 20, elevation: 5,
  },
  cardTitle: { fontSize: 22, fontWeight: '700', color: '#2C1810', marginBottom: 6 },
  cardSubtitle: { fontSize: 14, color: '#8B6B5A', marginBottom: 28, lineHeight: 21 },
  loginBtn: {
    backgroundColor: '#C0392B', borderRadius: 14, height: 52,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    shadowColor: '#C0392B', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  loginBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#F0F0F0' },
  dividerText: { marginHorizontal: 12, color: '#BBBBBB', fontSize: 13 },
  guestBtn: {
    borderRadius: 14, height: 52, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: '#EBEBEB', backgroundColor: '#FAFAFA',
  },
  guestBtnText: { color: '#555', fontSize: 15, fontWeight: '600' },
  footerText: {
    textAlign: 'center', color: '#AAAAAA', fontSize: 13,
    marginTop: 28, paddingHorizontal: 24,
  },
  footerLink: { color: '#C0392B', fontWeight: '700' },
});
