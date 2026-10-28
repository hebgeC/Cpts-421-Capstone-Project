import React from 'react';
import { screen, fireEvent } from '@testing-library/react-native';
import * as SecureStore from 'expo-secure-store';
import BookmarksScreen from '../src/screens/BookmarksScreen';
import { navigation } from '../test/navigation';
import { article, renderSaved } from '../test/helpers';

test('Bookmarks shows its empty state', async () => {
  renderSaved(<BookmarksScreen navigation={navigation} />);
  expect(await screen.findByText('No saved resources yet')).toBeOnTheScreen();
  expect(screen.getByText('0 items saved')).toBeOnTheScreen();
});

test('Bookmarks restores all resource types and opens the correct destinations', async () => {
  const resources = [
    { ...article, resourceType: 'article', savedKey: 'article:articles:11' },
    { resourceType: 'page', savedKey: 'page:help', slug: 'help', title: 'Help page' },
    { resourceType: 'external', savedKey: 'external:donate', url: 'https://support.trm.org', title: 'Donate' },
  ];
  SecureStore.getItemAsync.mockResolvedValue(JSON.stringify(resources));
  renderSaved(<BookmarksScreen navigation={navigation} />);
  await screen.findByText('3 items saved');
  fireEvent.press(screen.getByText(article.title));
  expect(navigation.navigate).toHaveBeenLastCalledWith('Article', { article: resources[0] });
  fireEvent.press(screen.getByText('Help page'));
  expect(navigation.navigate).toHaveBeenLastCalledWith('PageDetail', { slug: 'help', title: 'Help page' });
  fireEvent.press(screen.getByText('Donate'));
  expect(navigation.navigate).toHaveBeenLastCalledWith('WebView', { url: 'https://support.trm.org', title: 'Donate' });
});

test('Bookmarks removes a restored resource and persists the empty collection', async () => {
  SecureStore.getItemAsync.mockResolvedValue(JSON.stringify([{ ...article, savedKey: 'article:articles:11' }]));
  renderSaved(<BookmarksScreen navigation={navigation} />);
  fireEvent.press(await screen.findByLabelText(`Remove ${article.title} from saved resources`));
  expect(screen.getByText('No saved resources yet')).toBeOnTheScreen();
  expect(SecureStore.setItemAsync).toHaveBeenCalledWith('trm.savedResources.v1', '[]');
});

test.each(['invalid JSON', '{}'])('Bookmarks tolerates malformed stored data: %s', async (value) => {
  SecureStore.getItemAsync.mockResolvedValue(value);
  renderSaved(<BookmarksScreen navigation={navigation} />);
  expect(await screen.findByText('No saved resources yet')).toBeOnTheScreen();
});

test('Bookmarks tolerates a storage read failure', async () => {
  SecureStore.getItemAsync.mockRejectedValue(new Error('Unavailable'));
  renderSaved(<BookmarksScreen navigation={navigation} />);
  expect(await screen.findByText('No saved resources yet')).toBeOnTheScreen();
});
