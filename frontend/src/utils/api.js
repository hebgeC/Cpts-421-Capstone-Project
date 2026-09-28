import { Platform } from 'react-native';
import Constants from 'expo-constants';

// On a physical device in Expo Go, "localhost" refers to the phone itself,
// not the dev machine — so we read the Metro bundler's actual LAN host
// (the same address Expo Go used to load the app) and hit the backend there.
// Simulators/emulators fall back to the old localhost/10.0.2.2 behavior since
// they don't get a real hostUri.
function getDevHost() {
  const hostUri = Constants.expoConfig?.hostUri || Constants.expoGoConfig?.debuggerHost;
  const host = hostUri ? hostUri.split(':')[0] : null;
  if (host) return host;
  return Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
}

// TODO: replace with the real Railway URL once the backend is deployed (see plan).
const PRODUCTION_API_URL = 'https://REPLACE-WITH-YOUR-RAILWAY-URL.up.railway.app';

export const API_BASE_URL = __DEV__ ? `http://${getDevHost()}:3000` : PRODUCTION_API_URL;
