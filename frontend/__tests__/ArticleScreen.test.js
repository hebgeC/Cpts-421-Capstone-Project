import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { Linking } from 'react-native';
import ArticleScreen from '../src/screens/ArticleScreen';
import { navigation } from '../test/navigation';
import { article, mockApi, response } from '../test/helpers';

test('Article fetches the full story, opens its source and goes back', async () => {
  mockApi();
  render(<ArticleScreen navigation={navigation} route={{ params: { article } }} />);
  const page = await screen.findByTestId('wordpress-webview');
  await waitFor(() => expect(page.props.source.html).toContain('Full story content'));
  expect(screen.queryByLabelText('Save resource')).toBeNull();
  page.props.onShouldStartLoadWithRequest({ navigationType: 'click', url: article.link });
  expect(Linking.openURL).toHaveBeenCalledWith(article.link);
  fireEvent.press(screen.getByLabelText('Go back'));
  expect(navigation.goBack).toHaveBeenCalled();
});

test('Article uses supplied HTML without fetching and identifies updates', async () => {
  render(<ArticleScreen navigation={navigation} route={{ params: { article: { ...article, kind: 'updates', author: 'TRM staff', contentHtml: '<p>Provided content</p>' } } }} />);
  const html = (await screen.findByTestId('wordpress-webview')).props.source.html;
  expect(html).toContain('Provided content');
  expect(html).toContain('TRM staff');
  expect(html).toContain('Update');
  expect(fetch).not.toHaveBeenCalled();
});

test.each(['network', 'http'])('Article keeps its excerpt when the detail request fails (%s)', async (failure) => {
  if (failure === 'network') fetch.mockRejectedValue(new Error('Offline'));
  else fetch.mockResolvedValue(response({}, false));
  render(<ArticleScreen navigation={navigation} route={{ params: { article } }} />);
  expect((await screen.findByTestId('wordpress-webview')).props.source.html).toContain(article.excerpt);
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
  expect(screen.getByTestId('wordpress-webview').props.source.html).toContain(article.title);
});

test('Article handles a resource without an id, title or source link', async () => {
  render(<ArticleScreen navigation={navigation} route={{ params: { article: { excerpt: 'Summary only' } } }} />);
  const html = (await screen.findByTestId('wordpress-webview')).props.source.html;
  expect(html).toContain('Summary only');
  expect(html).toContain('Untitled');
  expect(html).not.toContain('Open on trm.org');
  expect(fetch).not.toHaveBeenCalled();
});
