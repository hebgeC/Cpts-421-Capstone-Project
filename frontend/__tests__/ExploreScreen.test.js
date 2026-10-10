import React from 'react';
import { screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import { ScrollView } from 'react-native';
import ExploreScreen from '../src/screens/ExploreScreen';
import { navigation } from '../test/navigation';
import { article, update, mockApi, renderSaved, response } from '../test/helpers';

test('Explore opens articles and toggles article bookmarks', async () => {
  mockApi();
  renderSaved(<ExploreScreen navigation={navigation} />);
  fireEvent.press(await screen.findByText(article.title));
  expect(navigation.navigate).toHaveBeenCalledWith('Article', { article });
  fireEvent.press(screen.getAllByLabelText('Save resource')[0]);
  expect(screen.getByLabelText('Remove from saved resources')).toBeOnTheScreen();
  fireEvent.press(screen.getByLabelText('Remove from saved resources'));
  expect(screen.getAllByLabelText('Save resource')).toHaveLength(2);
});

test('Explore filters Articles and Updates and toggles a category off', async () => {
  mockApi({ '/wpResources': (path) => ({ resources: path.includes('kind=updates') ? [update] : [article], totalPages: 1 }) });
  renderSaved(<ExploreScreen navigation={navigation} />);
  await screen.findByText(article.title);
  fireEvent.press(screen.getByText('Updates'));
  await screen.findByText(update.title);
  expect(screen.queryByText(article.title)).toBeNull();
  expect(fetch).toHaveBeenCalledWith(expect.stringContaining('kind=updates'));
  fireEvent.press(screen.getAllByText('Updates')[0]);
  await screen.findByText('All Resources');
  fireEvent.press(screen.getByText('Articles'));
  await screen.findByText(article.title);
  expect(fetch).toHaveBeenCalledWith(expect.stringContaining('kind=articles'));
});

test('Explore opens and saves internal pages and external resources', async () => {
  mockApi();
  renderSaved(<ExploreScreen navigation={navigation} />);
  fireEvent.press(await screen.findByText('Get Help'));
  fireEvent.press(await screen.findByText('Shelter'));
  expect(navigation.navigate).toHaveBeenLastCalledWith('PageDetail', { slug: 'emergency-services', title: 'Shelter' });
  fireEvent.press(screen.getAllByLabelText('Save resource')[0]);
  fireEvent.press(screen.getByText('Donate'));
  expect(navigation.navigate).toHaveBeenLastCalledWith('WebView', { url: 'https://support.trm.org', title: 'Donate' });
  fireEvent.press(screen.getByLabelText('Save resource'));
  expect(screen.getAllByLabelText('Remove from saved resources')).toHaveLength(2);
});

test('Explore paginates on scroll and deduplicates repeated resources', async () => {
  mockApi({ '/wpResources': (path) => ({ resources: path.includes('page=2') ? [article, update] : [article], totalPages: 2 }) });
  renderSaved(<ExploreScreen navigation={navigation} />);
  await screen.findByText(article.title);
  fireEvent.scroll(screen.UNSAFE_getByType(ScrollView), { nativeEvent: { layoutMeasurement: { height: 800 }, contentOffset: { y: 600 }, contentSize: { height: 1000 } } });
  await screen.findByText(update.title);
  expect(screen.getAllByText(article.title)).toHaveLength(1);
  expect(fetch).toHaveBeenCalledWith(expect.stringContaining('page=2'));
});

test('Explore keeps existing resources when pagination fails and retries on the next scroll', async () => {
  mockApi({ '/wpResources': { resources: [article], totalPages: 2 } });
  renderSaved(<ExploreScreen navigation={navigation} />);
  await screen.findByText(article.title);
  const scroll = () => fireEvent.scroll(screen.UNSAFE_getByType(ScrollView), { nativeEvent: { layoutMeasurement: { height: 800 }, contentOffset: { y: 600 }, contentSize: { height: 1000 } } });
  fetch.mockResolvedValueOnce(response({}, false));
  scroll();
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(3));
  expect(screen.getByText(article.title)).toBeOnTheScreen();
  fetch.mockResolvedValueOnce(response({ resources: [update], totalPages: 2 }));
  scroll();
  expect(await screen.findByText(update.title)).toBeOnTheScreen();
});

test('Explore handles empty results and failed initial loads with Retry', async () => {
  fetch.mockResolvedValue(response({}, false));
  renderSaved(<ExploreScreen navigation={navigation} />);
  await screen.findByText(/Could not load content/);
  mockApi({ '/wpResources': { resources: [] } });
  fireEvent.press(screen.getByText('Retry'));
  expect(await screen.findByText('Nothing here yet.')).toBeOnTheScreen();
});

test('Explore ignores a stale response when the user changes category during loading', async () => {
  let finishInitial;
  fetch.mockReturnValueOnce(new Promise(resolve => { finishInitial = resolve; }))
    .mockResolvedValueOnce(response({ categories: [], items: [] }));
  renderSaved(<ExploreScreen navigation={navigation} />);
  mockApi({ '/wpResources': { resources: [update] } });
  fireEvent.press(screen.getByText('Updates'));
  await screen.findByText(update.title);
  await act(async () => { finishInitial(response({ resources: [article] })); });
  expect(screen.queryByText(article.title)).toBeNull();
  expect(screen.getByText(update.title)).toBeOnTheScreen();
});

test('Explore shows an empty site category', async () => {
  mockApi({ '/siteMap': { categories: [{ key: 'empty', title: 'Empty category', bg: '#FFFFFF', color: '#C0392B' }], items: [] } });
  renderSaved(<ExploreScreen navigation={navigation} />);
  fireEvent.press(await screen.findByText('Empty category'));
  expect(await screen.findByText('Nothing here yet.')).toBeOnTheScreen();
});
