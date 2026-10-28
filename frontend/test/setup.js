import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { Linking } from 'react-native';
import { navigation, route } from './navigation';

const dateTimerOptions = {
  now: new Date(2026, 9, 8, 12),
  doNotFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'setImmediate', 'clearImmediate', 'nextTick', 'queueMicrotask', 'performance'],
};
// Also freeze module-level TODAY constants before screen imports are evaluated.
jest.useFakeTimers(dateTimerOptions);

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  const Icon = ({ name }) => <Text>{name}</Text>;
  return { Ionicons: Icon, FontAwesome5: Icon };
});
jest.mock('react-native-webview', () => {
  const React = require('react');
  const { View } = require('react-native');
  const injectJavaScript = jest.fn();
  return {
    injectJavaScript,
    WebView: React.forwardRef((props, ref) => {
      React.useImperativeHandle(ref, () => ({ injectJavaScript }));
      return <View {...props} testID="native-webview" />;
    }),
  };
});
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(), setItemAsync: jest.fn(),
}));
jest.mock('axios');
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => require('./navigation').navigation,
  useRoute: () => require('./navigation').route,
}));

beforeEach(() => {
  jest.useFakeTimers(dateTimerOptions);
  // Unexpected fetches fail locally instead of reaching a live service.
  global.fetch = jest.fn(() => Promise.reject(new Error('No fixture for fetch')));
  SecureStore.getItemAsync.mockReset().mockResolvedValue(null);
  SecureStore.setItemAsync.mockReset().mockResolvedValue(undefined);
  axios.get.mockReset().mockResolvedValue({ data: [] });
  jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
  navigation.navigate.mockReset();
  navigation.goBack.mockReset();
  route.params = {};
});

afterEach(() => {
  jest.restoreAllMocks();
  jest.useRealTimers();
});
