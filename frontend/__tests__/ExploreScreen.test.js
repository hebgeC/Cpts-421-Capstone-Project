import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { ScrollView } from 'react-native';
import ExploreScreen from '../src/screens/ExploreScreen';
import { navigation } from '../test/navigation';
import { article, mockApi, response, wpPost } from '../test/helpers';

test('Explore shows the four guided paths without updates, contact, or an initial article request', () => {
  render(<ExploreScreen navigation={navigation} />);
  expect(screen.getByText('Stories of hope and change')).toBeOnTheScreen();
  expect(screen.getByRole('button', { name: 'Browse articles' })).toBeOnTheScreen();
  expect(screen.getByRole('button', { name: 'What We Do' })).toBeOnTheScreen();
  expect(screen.getByRole('button', { name: 'Get Involved' })).toBeOnTheScreen();
  expect(screen.getByRole('button', { name: 'About' })).toBeOnTheScreen();
  expect(screen.queryByText('Updates')).toBeNull();
  expect(screen.queryByText('Contact')).toBeNull();
  expect(fetch).not.toHaveBeenCalled();
});

test('Articles opens an article-only list and returns to the landing screen', async () => {
  mockApi({ '/wpResources': { resources: [article], totalPages: 1 } });
  render(<ExploreScreen navigation={navigation} />);
  fireEvent.press(screen.getByRole('button', { name: 'Browse articles' }));
  fireEvent.press(await screen.findByText(article.title));
  expect(navigation.navigate).toHaveBeenCalledWith('Article', { article: expect.objectContaining(article) });
  expect(fetch).toHaveBeenCalledWith(expect.stringContaining('categories=1'));
  expect(screen.queryByText('Mission news')).toBeNull();
  fireEvent.press(screen.getByRole('button', { name: 'Back to Explore' }));
  expect(screen.getByText('Stories of hope and change')).toBeOnTheScreen();
});

test('Explore opens existing program, giving, and about pages', () => {
  render(<ExploreScreen navigation={navigation} />);
  fireEvent.press(screen.getByRole('button', { name: 'What We Do' }));
  fireEvent.press(screen.getByText('Emergency Services'));
  expect(navigation.navigate).toHaveBeenLastCalledWith('PageDetail', { slug: 'emergency-services', title: 'Emergency Services' });
  fireEvent.press(screen.getByRole('button', { name: 'Back to Explore' }));
  fireEvent.press(screen.getByRole('button', { name: 'Get Involved' }));
  fireEvent.press(screen.getByText('In-Kind Giving'));
  expect(navigation.navigate).toHaveBeenLastCalledWith('PageDetail', { slug: 'inkind', title: 'In-Kind Giving' });
  expect(screen.queryByText('Donate Online')).toBeNull();
  fireEvent.press(screen.getByRole('button', { name: 'Back to Explore' }));
  fireEvent.press(screen.getByRole('button', { name: 'About' }));
  fireEvent.press(screen.getByText('About Us'));
  expect(navigation.navigate).toHaveBeenLastCalledWith('PageDetail', { slug: 'about', title: 'About Us' });
});

test('Articles paginates and deduplicates repeated posts', async () => {
  mockApi({ '/wpResources': (path) => ({ resources: path.includes('page=2') ? [article, { ...article, id: 13, title: 'Second story' }] : [article], totalPages: 2 }) });
  render(<ExploreScreen navigation={navigation} />);
  fireEvent.press(screen.getByRole('button', { name: 'Browse articles' }));
  await screen.findByText(article.title);
  fireEvent.scroll(screen.UNSAFE_getByType(ScrollView), { nativeEvent: { layoutMeasurement: { height: 800 }, contentOffset: { y: 600 }, contentSize: { height: 1000 } } });
  await screen.findByText('Second story');
  expect(screen.getAllByText(article.title)).toHaveLength(1);
});

test('Articles retries a failed load', async () => {
  fetch.mockResolvedValue(response({}, false));
  render(<ExploreScreen navigation={navigation} />);
  fireEvent.press(screen.getByRole('button', { name: 'Browse articles' }));
  await screen.findByText(/Could not load articles/);
  mockApi({ '/wpResources': { resources: [article] } });
  fireEvent.press(screen.getByText('Retry'));
  expect(await screen.findByText(article.title)).toBeOnTheScreen();
});

test('Articles ignores a response after returning to Explore', async () => {
  let finishLoad;
  fetch.mockReturnValueOnce(new Promise((resolve) => { finishLoad = resolve; }));
  render(<ExploreScreen navigation={navigation} />);
  fireEvent.press(screen.getByRole('button', { name: 'Browse articles' }));
  fireEvent.press(screen.getByRole('button', { name: 'Back to Explore' }));
  await act(async () => { finishLoad(response([wpPost(article)])); });
  expect(screen.queryByText(article.title)).toBeNull();
  expect(screen.getByText('Stories of hope and change')).toBeOnTheScreen();
});
