// Use the deployed API by default across Expo Go, simulators, and release builds.
// Override it for local development or staging with EXPO_PUBLIC_API_BASE_URL.
// EXPO_PUBLIC_API_URL remains supported for existing TestFlight workflows.
const DEFAULT_API_URL = 'https://trm-backend-0r6s.onrender.com';

const configuredApiUrl =
  process.env.EXPO_PUBLIC_API_BASE_URL || process.env.EXPO_PUBLIC_API_URL;

export const API_BASE_URL = (configuredApiUrl || DEFAULT_API_URL).replace(/\/+$/, '');
