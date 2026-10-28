import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react-native';
import { Linking } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import ArticleScreen from '../src/screens/ArticleScreen';
import { navigation } from '../test/navigation';
import { article, mockApi, renderSaved, response } from '../test/helpers';

test('Article fetches the full story, bookmarks and unbookmarks it, opens its source and goes back', async () => {
  mockApi();
  renderSaved(<ArticleScreen navigation={navigation} route={{ params: { article } }} />);
  expect(await screen.findByText('Full story content')).toBeOnTheScreen();
  fireEvent.press(screen.getByLabelText('Save resource'));
  fireEvent.press(screen.getByLabelText('Remove from saved resources'));
  expect(screen.getByLabelText('Save resource')).toBeOnTheScreen();
  fireEvent.press(screen.getByText('Open on trm.org'));
  expect(Linking.openURL).toHaveBeenCalledWith(article.link);
  fireEvent.press(screen.getByLabelText('Go back'));
  expect(navigation.goBack).toHaveBeenCalled();
});

test('Article uses supplied HTML without fetching and identifies updates', async () => {
  renderSaved(<ArticleScreen navigation={navigation} route={{ params: { article: { ...article, kind: 'updates', author: 'TRM staff', contentHtml: '<p>Provided content</p>' } } }} />);
  expect(await screen.findByText('Provided content')).toBeOnTheScreen();
  expect(screen.getByText('TRM staff')).toBeOnTheScreen();
  expect(screen.getByText('Update')).toBeOnTheScreen();
  expect(fetch).not.toHaveBeenCalled();
});

test.each(['network', 'http'])('Article keeps its excerpt when the detail request fails (%s)', async (failure) => {
  if (failure === 'network') fetch.mockRejectedValue(new Error('Offline'));
  else fetch.mockResolvedValue(response({}, false));
  renderSaved(<ArticleScreen navigation={navigation} route={{ params: { article } }} />);
  expect(await screen.findByText(article.excerpt)).toBeOnTheScreen();
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
  expect(screen.getByText(article.title)).toBeOnTheScreen();
});

test('Article handles a resource without an id, title or source link', async () => {
  renderSaved(<ArticleScreen navigation={navigation} route={{ params: { article: { excerpt: 'Summary only' } } }} />);
  expect(await screen.findByText('Summary only')).toBeOnTheScreen();
  expect(screen.getByText('Untitled')).toBeOnTheScreen();
  expect(screen.queryByText('Open on trm.org')).toBeNull();
  expect(fetch).not.toHaveBeenCalled();
});

test('Article can still be saved for the current session if storage writing fails', async () => {
  SecureStore.setItemAsync.mockRejectedValue(new Error('Storage unavailable'));
  mockApi();
  renderSaved(<ArticleScreen navigation={navigation} route={{ params: { article } }} />);
  await screen.findByText('Full story content');
  fireEvent.press(screen.getByLabelText('Save resource'));
  expect(screen.getByLabelText('Remove from saved resources')).toBeOnTheScreen();
});
