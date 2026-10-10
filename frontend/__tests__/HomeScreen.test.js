import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import HomeScreen from '../src/screens/HomeScreen';
import { navigation } from '../test/navigation';
import { article, update, mockApi } from '../test/helpers';

test('Home loads featured stories, recent stories and updates and opens each', async () => {
  mockApi();
  render(<HomeScreen navigation={navigation} />);
  fireEvent.press(await screen.findByText(article.title));
  expect(navigation.navigate).toHaveBeenLastCalledWith('Article', { article });
  fireEvent.press(screen.getByText('Second story'));
  expect(navigation.navigate).toHaveBeenLastCalledWith('Article', { article: expect.objectContaining({ id: 13 }) });
  fireEvent.press(screen.getByText(update.title));
  expect(navigation.navigate).toHaveBeenLastCalledWith('Article', { article: update });
  fireEvent.press(screen.getAllByText('See all')[0]);
  expect(navigation.navigate).toHaveBeenLastCalledWith('Explore');
});

test('Home shows an empty state for no stories and excludes untitled updates', async () => {
  mockApi({ '/wpArticles': {}, '/wpUpdates': [{ id: 1 }] });
  render(<HomeScreen navigation={navigation} />);
  expect(await screen.findByText('No stories available right now.')).toBeOnTheScreen();
  expect(screen.queryByText('Updates')).toBeNull();
});

test('Home recovers from a network error with Retry', async () => {
  fetch.mockRejectedValue(new Error('Offline'));
  render(<HomeScreen navigation={navigation} />);
  expect(await screen.findByText(/Could not load content/)).toBeOnTheScreen();
  mockApi();
  fireEvent.press(screen.getByText('Retry'));
  expect(await screen.findByText(article.title)).toBeOnTheScreen();
  expect(screen.queryByText(/Could not load content/)).toBeNull();
});
