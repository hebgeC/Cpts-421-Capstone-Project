// Backend lives on Render, so every build target (simulator, Expo Go on a
// physical device, or a production build) hits the same URL — no more
// chasing LAN IPs or USB link-local addresses for local dev.
// Override locally by running Expo with EXPO_PUBLIC_API_URL set, e.g.:
//   EXPO_PUBLIC_API_URL=http://192.168.1.23:3000 npx expo start
const RENDER_API_URL = 'https://trm-backend-0r6s.onrender.com';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || RENDER_API_URL;
