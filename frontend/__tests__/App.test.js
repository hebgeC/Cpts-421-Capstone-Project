import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import App from '../App';
import { article, mockApi } from '../test/helpers';

// Exercise the actual tab/stack navigators and hooks in this suite.
jest.unmock('@react-navigation/native');

beforeEach(() => mockApi());

test('Donate tab opens the giving form in the app WebView', async () => {
  render(<App />);
  expect(await screen.findByText('heart-outline')).toBeOnTheScreen();
  fireEvent.press(screen.getByText('Donate'));
  fireEvent.press(screen.getByRole('button', { name: 'Donate Here' }));
  await waitFor(() => {
    expect(screen.getByTestId('native-webview').props.source).toEqual({ uri: 'https://www.trm.org/donate/?form=FUNHYQKHUSS' });
  });
  expect(screen.getByText('Donate Here')).toBeOnTheScreen();
});

test.each(['android', 'ios'])(
  'App launches and exposes primary navigation on %s without Saved',
  async (platform) => {
    jest.replaceProperty(Platform, 'OS', platform);
    render(<App />);
    expect(await screen.findByText('Stories & news')).toBeOnTheScreen();
    expect(screen.getByText(article.title)).toBeOnTheScreen();
    expect(screen.queryByText('Saved')).toBeNull();
    expect(SecureStore.getItemAsync).not.toHaveBeenCalled();

    fireEvent.press(screen.getByText('Events'));
    expect(await screen.findByText('There are no upcoming events.')).toBeOnTheScreen();
    fireEvent.press(screen.getByText('Volunteer'));
    expect(await screen.findByText('Create Your TRM Volunteer Account')).toBeOnTheScreen();
    fireEvent.press(screen.getByText('Explore'));
    expect(await screen.findByText('Stories of hope and change')).toBeOnTheScreen();
    expect(screen.queryByText('Information')).toBeNull();
  },
);

test('Home opens an article without bookmark navigation or storage', async () => {
  render(<App />);
  fireEvent.press(await screen.findByText(article.title));
  await screen.findByText('Full story content');
  expect(screen.queryByLabelText('Save resource')).toBeNull();
  expect(screen.queryByText('Saved')).toBeNull();
  expect(SecureStore.getItemAsync).not.toHaveBeenCalled();
  expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
  fireEvent.press(screen.getByLabelText('Go back'));
  expect(await screen.findByText(article.title)).toBeOnTheScreen();
});

test('Explore opens programs and In-Kind Giving without save controls', async () => {
  render(<App />);
  await screen.findByText(article.title);
  fireEvent.press(screen.getByText('Explore'));
  fireEvent.press(await screen.findByText('What We Do'));
  fireEvent.press(await screen.findByText('Emergency Services'));
  await screen.findByText('Find help here');
  expect(screen.queryByLabelText('Save resource')).toBeNull();
  fireEvent.press(screen.getByLabelText('Go back'));
  fireEvent.press(screen.getByLabelText('Back to Explore'));
  fireEvent.press(await screen.findByText('Get Involved'));
  fireEvent.press(await screen.findByText('In-Kind Giving'));
  await screen.findByText('Find help here');
  fireEvent.press(screen.getByLabelText('Go back'));
  expect(await screen.findByText('In-Kind Giving')).toBeOnTheScreen();
});
