import React from 'react';
import { screen, fireEvent } from '@testing-library/react-native';
import { Linking } from 'react-native';
import PageDetailScreen from '../src/screens/PageDetailScreen';
import { navigation, route } from '../test/navigation';
import { mockApi, renderSaved, response } from '../test/helpers';

beforeEach(() => { route.params = { slug: 'emergency-services', title: 'Shelter' }; });

test('PageDetail loads HTML, saves and removes the page, calls the shelter, opens the source and goes back', async () => {
  mockApi({ '/wpPage/': { title: 'Shelter details', contentHtml: '<p>Find help here</p>', modified: '2026-10-08', link: 'https://www.trm.org/shelter/' } });
  renderSaved(<PageDetailScreen />);
  await screen.findByText('Find help here');
  expect(screen.getByText(/Last updated/)).toBeOnTheScreen();
  fireEvent.press(screen.getByLabelText('Save resource'));
  fireEvent.press(screen.getByLabelText('Remove from saved resources'));
  fireEvent.press(screen.getByText('253-383-4493'));
  expect(Linking.openURL).toHaveBeenLastCalledWith('tel:2533834493');
  fireEvent.press(screen.getByText('View full page on trm.org'));
  expect(Linking.openURL).toHaveBeenLastCalledWith('https://www.trm.org/shelter/');
  fireEvent.press(screen.getByLabelText('Go back'));
  expect(navigation.goBack).toHaveBeenCalled();
});

test('PageDetail routes HTML web links internally and telephone/email links to the OS', async () => {
  mockApi({ '/wpPage/': { title: 'Contact', contentHtml: '<p><a href="https://www.trm.org/help">Help online</a> <a href="tel:123">Call us</a> <a href="mailto:help@trm.org">Email us</a></p>' } });
  renderSaved(<PageDetailScreen />);
  fireEvent.press(await screen.findByText('Help online'));
  expect(navigation.navigate).toHaveBeenCalledWith('WebView', { url: 'https://www.trm.org/help', title: 'Contact' });
  fireEvent.press(screen.getByText('Call us'));
  expect(Linking.openURL).toHaveBeenLastCalledWith('tel:123');
  fireEvent.press(screen.getByText('Email us'));
  expect(Linking.openURL).toHaveBeenLastCalledWith('mailto:help@trm.org');
});

test.each(['network', 'http'])('PageDetail retries a failed request (%s)', async (failure) => {
  if (failure === 'network') fetch.mockRejectedValue(new Error('Offline'));
  else fetch.mockResolvedValue(response({}, false));
  renderSaved(<PageDetailScreen />);
  await screen.findByText(/Could not load this page/);
  mockApi();
  fireEvent.press(screen.getByText('Retry'));
  expect(await screen.findByText('Find help here')).toBeOnTheScreen();
});

test('PageDetail omits the emergency phone shortcut and source button on other pages', async () => {
  route.params = { slug: 'about', title: 'About' };
  mockApi();
  renderSaved(<PageDetailScreen />);
  await screen.findByText('Find help here');
  expect(screen.queryByText('253-383-4493')).toBeNull();
  expect(screen.queryByText('View full page on trm.org')).toBeNull();
});
