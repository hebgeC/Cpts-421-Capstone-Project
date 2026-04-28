import { Platform } from 'react-native';

export function getApiBaseUrl() {
  const configured = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (configured && configured.trim().length > 0) {
    return configured.replace(/\/$/, '');
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000';
  }

  if (Platform.OS === 'ios') {
    return 'http://localhost:3000';
  }

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:3000';
    }

    return window.location.origin;
  }

  return 'http://localhost:3000';
}
