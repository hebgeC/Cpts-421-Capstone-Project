import React, { useState, useContext, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, ActivityIndicator, Modal, Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons as Icon } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import * as WebBrowser from 'expo-web-browser';

const LOGIN_URL = 'https://rescue-mission.volunteerhub.com/account/signin?ReturnUrl=%2f';
const LOGIN_SUCCESS_URL = 'https://rescue-mission.volunteerhub.com/vv2';

// Injected after page load to read the logged-in user's display name from the VH nav bar
const EXTRACT_USER_JS = `
  (function() {
    const nameEl = document.querySelector('.user-name, .volunteer-name, [data-user-name], .nav-user .name, .header-user-name');
    const name = nameEl ? nameEl.innerText.trim() : null;
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'USER_INFO', name }));
  })();
  true;
`;

function isLoginSuccess(url) {
  if (!url) return false;
  // Logged in when we're on the VH domain and NOT on a sign-in or BetterGood page
  return url.includes('https://rescue-mission.volunteerhub.com/vv2');
}

export default function LoginScreen() {
  const { setIsLoggedIn, setUser } = useContext(AuthContext);
  const [webViewVisible, setWebViewVisible] = useState(false);
  const [webViewLoading, setWebViewLoading] = useState(true);
  const webViewRef = useRef(null);

  const handleWebLogin = async () => {
    const result = await WebBrowser.openAuthSessionAsync(LOGIN_URL, LOGIN_SUCCESS_URL);
    if (result.type === 'success') {
      setUser({ displayName: 'Volunteer', source: 'volunteerhub' });
      setIsLoggedIn(true);
    }
  };

  const handleNavigationChange = (navState) => {
    if (isLoginSuccess(navState.url)) {
      // Inject JS to try to read the user's name from the page
      webViewRef.current?.injectJavaScript(EXTRACT_USER_JS);
    }
  };

  const handleMessage = (event) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'USER_INFO') {
        setWebViewVisible(false);
        setUser({
          displayName: msg.name || 'Volunteer',
          source: 'volunteerhub',
        });
        setIsLoggedIn(true);
      }
    } catch (_) {}
  };

  // Fallback: if JS message never fires but URL is already the dashboard, complete login
  const handleLoadEnd = (syntheticEvent) => {
    setWebViewLoading(false);
    const { url } = syntheticEvent.nativeEvent;
    if (isLoginSuccess(url)) {
      webViewRef.current?.injectJavaScript(EXTRACT_USER_JS);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* ── Login WebView Modal ── */}
      <Modal
        visible={webViewVisible}
        animationType="slide"
        onRequestClose={() => setWebViewVisible(false)}
      >
        <SafeAreaView style={styles.webViewSafe}>
          {/* Header bar */}
          <View style={styles.webViewHeader}>
            <TouchableOpacity
              onPress={() => setWebViewVisible(false)}
              style={styles.webViewCancelBtn}
            >
              <Icon name="close" size={22} color="#2C1810" />
            </TouchableOpacity>
            <Text style={styles.webViewTitle}>Sign In to VolunteerHub</Text>
            <View style={{ width: 38 }} />
          </View>

          {webViewLoading && (
            <View style={styles.webViewLoadingOverlay}>
              <ActivityIndicator size="large" color="#C0392B" />
            </View>
          )}

          <WebView
            ref={webViewRef}
            source={{ uri: LOGIN_URL }}
            onNavigationStateChange={handleNavigationChange}
            onLoadEnd={handleLoadEnd}
            onMessage={handleMessage}
            onLoadStart={() => setWebViewLoading(true)}
            sharedCookiesEnabled={true}
            thirdPartyCookiesEnabled={true}
            userAgent={
              Platform.OS === 'android'
                ? 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36'
                : 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1'
            }
            style={{ flex: 1 }}
          />
        </SafeAreaView>
      </Modal>

      {/* ── Landing screen ── */}
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
          onPress={Platform.OS === 'web' ? handleWebLogin : () => { setWebViewLoading(true); setWebViewVisible(true); }}
          activeOpacity={0.9}
        >
          <Icon name="log-in-outline" size={18} color="#FFFFFF" />
          <Text style={styles.loginBtnText}>Sign In with VolunteerHub</Text>
        </TouchableOpacity>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={styles.guestBtn}
          onPress={() => { setUser({ displayName: 'Guest', source: 'guest' }); setIsLoggedIn(true); }}
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

  // ── WebView Modal ──
  webViewSafe: { flex: 1, backgroundColor: '#FFFFFF' },
  webViewHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#EBEBEB',
    backgroundColor: '#FFFFFF',
  },
  webViewCancelBtn: { padding: 6 },
  webViewTitle: { fontSize: 15, fontWeight: '700', color: '#2C1810' },
  webViewLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center', justifyContent: 'center',
    zIndex: 10,
  },
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
