import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ActivityIndicator } from 'react-native';
import WebViewScreen from '../src/screens/WebViewScreen';
import { navigation, route } from '../test/navigation';

test('WebView shows the supplied title, loads the URL, renders a loading indicator and returns', () => {
  route.params = { title: 'Donation Portal', url: 'https://www.trm.org/donate/' };
  const view = render(<WebViewScreen />);
  expect(screen.getByText('Donation Portal')).toBeOnTheScreen();
  const webview = screen.getByTestId('native-webview');
  expect(webview.props.source).toEqual({ uri: route.params.url });
  expect(webview.props.startInLoadingState).toBe(true);
  fireEvent.press(view.getByLabelText('Go back'));
  expect(navigation.goBack).toHaveBeenCalled();
  const loading = render(webview.props.renderLoading());
  expect(loading.UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
  loading.unmount();
});

test('WebView tolerates missing route parameters', () => {
  route.params = undefined;
  render(<WebViewScreen />);
  expect(screen.getByTestId('native-webview').props.source).toEqual({ uri: undefined });
});
