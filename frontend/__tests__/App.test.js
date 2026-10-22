import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import App from '../App';
import { article, mockApi } from '../test/helpers';

// Exercise the actual tab/stack navigators and hooks in this suite.
jest.unmock('@react-navigation/native');

beforeEach(() => mockApi());

test.each(['android', 'ios'])(
  'App launches without logging in and exposes primary navigation on %s',
  async (platform) => {
    jest.replaceProperty(Platform, 'OS', platform);
    render(<App />);

    expect(await screen.findByText('How can you help today?')).toBeOnTheScreen();
    expect(screen.getByText(article.title)).toBeOnTheScreen();
    expect(screen.queryByText('Welcome back')).toBeNull();

    fireEvent.press(screen.getByText('Events'));
    expect(await screen.findByText('There are no upcoming events.')).toBeOnTheScreen();
    fireEvent.press(screen.getByText('Volunteer'));
    expect(await screen.findByText('Volunteer Shifts')).toBeOnTheScreen();
    fireEvent.press(screen.getByText('Information'));
    expect(await screen.findByText('Helpful links from Tacoma Rescue Mission')).toBeOnTheScreen();
  },
);

test('Home → Article → save → back → Saved → reopen → remove', async () => {
  render(<App />);
  fireEvent.press(await screen.findByText(article.title));
  await screen.findByText('Full story content');
  fireEvent.press(screen.getByLabelText('Save resource'));
  expect(SecureStore.setItemAsync).toHaveBeenCalledWith('trm.savedResources.v1', expect.stringContaining(article.title));
  fireEvent.press(screen.getByLabelText('Go back'));
  fireEvent.press(await screen.findByText('Saved'));
  await screen.findByText('1 items saved');
  fireEvent.press(screen.getByText(article.title));
  await screen.findByText('Full story content');
  fireEvent.press(screen.getByLabelText('Remove from saved resources'));
  fireEvent.press(screen.getByLabelText('Go back'));
  expect(await screen.findByText('No saved resources yet')).toBeOnTheScreen();
});

test('Explore → category → PageDetail → save → back → external WebView → back', async () => {
  render(<App />);
  await screen.findByText(article.title);
  fireEvent.press(screen.getByText('Explore'));
  fireEvent.press(await screen.findByText('Get Help'));
  fireEvent.press(await screen.findByText('Shelter'));
  await screen.findByText('Find help here');
  fireEvent.press(screen.getByLabelText('Save resource'));
  fireEvent.press(screen.getByLabelText('Go back'));
  fireEvent.press(await screen.findByText('Donate'));
  await waitFor(() => expect(screen.getByTestId('native-webview').props.source.uri).toBe('https://support.trm.org'));
  fireEvent.press(screen.getByLabelText('Go back'));
  expect(await screen.findByText('Shelter')).toBeOnTheScreen();
});

test('Tab navigation reaches Events, Volunteer and Information; Information opens and returns from WebView', async () => {
  render(<App />);
  await screen.findByText(article.title);
  fireEvent.press(screen.getByText('Events'));
  await screen.findByText('There are no upcoming events.');
  fireEvent.press(screen.getByText('Volunteer'));
  await screen.findByText('Volunteer Shifts');
  fireEvent.press(screen.getByText('Information'));
  expect(await screen.findByText('Helpful links from Tacoma Rescue Mission')).toBeOnTheScreen();
  expect(screen.getByText('Donation Portal')).toBeOnTheScreen();
  expect(screen.getByText('In-Kind Giving')).toBeOnTheScreen();
  expect(screen.getByText('About TRM')).toBeOnTheScreen();
  expect(screen.getByText('Help & Support')).toBeOnTheScreen();
  fireEvent.press(await screen.findByText('Donation Portal'));
  await waitFor(() => expect(screen.getByTestId('native-webview').props.source.uri).toBe('https://support.trm.org'));
  fireEvent.press(screen.getByLabelText('Go back'));
  expect(await screen.findByText('Helpful links from Tacoma Rescue Mission')).toBeOnTheScreen();
  expect(screen.getByText('Help & Support')).toBeOnTheScreen();
});

test('Bookmarks survive unmount and remount of the app', async () => {
  const first = render(<App />);
  fireEvent.press(await screen.findByText(article.title));
  await screen.findByText('Full story content');
  fireEvent.press(screen.getByLabelText('Save resource'));
  const [, stored] = SecureStore.setItemAsync.mock.calls.at(-1);
  first.unmount();
  SecureStore.getItemAsync.mockResolvedValue(stored);
  render(<App />);
  await screen.findByText(article.title);
  fireEvent.press(screen.getByText('Saved'));
  expect(await screen.findByText('1 items saved')).toBeOnTheScreen();
  expect(screen.getByText(article.title)).toBeOnTheScreen();
  fireEvent.press(screen.getByText(article.title));
  await screen.findByText('Full story content');
  fireEvent.press(screen.getByLabelText('Remove from saved resources'));
  fireEvent.press(screen.getByLabelText('Go back'));
  expect(await screen.findByText('No saved resources yet')).toBeOnTheScreen();
});
