import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import HomeScreen from '../src/screens/HomeScreen';
import { navigation } from '../test/navigation';
import { article, update, mockApi } from '../test/helpers';

test('Home opens the featured article, latest update, and both contact pages', async () => {
  const olderUpdate = { ...update, id: 14, title: 'Earlier news', date: '2026-09-01T12:00:00' };
  const newerUpdate = { ...update, date: '2026-10-20T12:00:00' };
  mockApi({ '/wpUpdates': [olderUpdate, newerUpdate] });
  render(<HomeScreen navigation={navigation} />);
  fireEvent.press(await screen.findByText(article.title));
  expect(navigation.navigate).toHaveBeenLastCalledWith('Article', { article: expect.objectContaining(article) });
  expect(screen.queryByText('Second story')).toBeNull();
  expect(screen.queryByText('Earlier news')).toBeNull();
  fireEvent.press(screen.getByText(newerUpdate.title));
  expect(navigation.navigate).toHaveBeenLastCalledWith('Article', { article: expect.objectContaining(newerUpdate) });
  fireEvent.press(screen.getByText('Contact Us'));
  expect(navigation.navigate).toHaveBeenLastCalledWith('PageDetail', { slug: 'contact', title: 'Contact Us' });
  fireEvent.press(screen.getByText('Need Help?'));
  expect(navigation.navigate).toHaveBeenLastCalledWith('PageDetail', { slug: 'need-help', title: 'Need Help?' });
  fireEvent.press(screen.getByText('See all'));
  expect(navigation.navigate).toHaveBeenLastCalledWith('Explore', { section: 'articles' });
});

test('Home shows an empty state for no stories and excludes untitled updates', async () => {
  mockApi({ '/wpArticles': {}, '/wpUpdates': [{ id: 1 }] });
  render(<HomeScreen navigation={navigation} />);
  expect(await screen.findByText('No stories available right now.')).toBeOnTheScreen();
  expect(screen.getByText('No updates available right now.')).toBeOnTheScreen();
  expect(screen.getByText('Contact Us')).toBeOnTheScreen();
  expect(screen.getByText('Need Help?')).toBeOnTheScreen();
});

test('Home recovers from a network error with Retry', async () => {
  fetch.mockRejectedValue(new Error('Offline'));
  render(<HomeScreen navigation={navigation} />);
  expect(await screen.findByText(/Could not load content/)).toBeOnTheScreen();
  expect(screen.getByText('Need Help?')).toBeOnTheScreen();
  mockApi();
  fireEvent.press(screen.getByText('Retry'));
  expect(await screen.findByText(article.title)).toBeOnTheScreen();
  expect(screen.queryByText(/Could not load content/)).toBeNull();
});
