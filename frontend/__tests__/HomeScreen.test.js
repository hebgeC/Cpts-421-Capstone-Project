import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Linking } from 'react-native';
import HomeScreen from '../src/screens/HomeScreen';
import { navigation } from '../test/navigation';
import { article, update, mockApi } from '../test/helpers';

const upcomingEvent = {
  id: 30, title: 'Community dinner', startDate: '2026-11-12 17:00:00',
  endDate: '2026-11-12 19:00:00', venue: 'TRM Downtown Campus',
  url: 'https://www.trm.org/event/community-dinner/',
};

beforeEach(() => {
  jest.setSystemTime(new Date(2026, 10, 5, 12));
});

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

test('Home replaces an old update with the nearest upcoming event and opens its page', async () => {
  mockApi({
    '/wpUpdates': [{ ...update, date: '2018-01-09T12:00:00' }],
    '/events?': { events: [
      { ...upcomingEvent, id: 31, title: 'Later event', startDate: '2026-12-01 17:00:00' },
      { ...upcomingEvent, id: 32, title: 'Past event', startDate: '2026-11-05 09:00:00' },
      { ...upcomingEvent, id: 33, title: 'Invalid event', startDate: 'invalid' },
      { ...upcomingEvent, id: 34, title: 'No event page', url: null },
      upcomingEvent,
    ] },
  });
  render(<HomeScreen navigation={navigation} />);
  expect(await screen.findByText('Upcoming event')).toBeOnTheScreen();
  expect(screen.queryByText(update.title)).toBeNull();
  expect(screen.queryByText('Later event')).toBeNull();
  expect(screen.queryByText('Past event')).toBeNull();
  expect(screen.getByText('Nov 12, 2026')).toBeOnTheScreen();
  expect(screen.getByText(upcomingEvent.venue)).toBeOnTheScreen();
  fireEvent.press(screen.getByText(upcomingEvent.title));
  expect(Linking.openURL).toHaveBeenCalledWith(upcomingEvent.url);
  fireEvent.press(screen.getByText('See all events'));
  expect(navigation.navigate).toHaveBeenLastCalledWith('Events');
});

test.each([
  [90, false],
  [91, true],
])('Home considers a %i-day-old update stale: %s', async (ageInDays, expectEvent) => {
  const date = new Date(Date.now() - ageInDays * 24 * 60 * 60 * 1000).toISOString();
  mockApi({
    '/wpUpdates': [{ ...update, date }],
    '/events?': { events: [upcomingEvent] },
  });
  render(<HomeScreen navigation={navigation} />);
  expect(await screen.findByText(expectEvent ? upcomingEvent.title : update.title)).toBeOnTheScreen();
  expect(screen.queryByText(expectEvent ? update.title : upcomingEvent.title)).toBeNull();
});

test('Home keeps the old update when no upcoming event is available', async () => {
  mockApi({ '/wpUpdates': [{ ...update, date: '2018-01-09T12:00:00' }] });
  render(<HomeScreen navigation={navigation} />);
  expect(await screen.findByText(update.title)).toBeOnTheScreen();
  expect(screen.getByText('Latest from TRM')).toBeOnTheScreen();
  expect(screen.queryByText('Upcoming event')).toBeNull();
});

test('Home keeps stories and the old update when the event feed fails', async () => {
  mockApi({ '/wpUpdates': [{ ...update, date: '2018-01-09T12:00:00' }] });
  const apiFetch = fetch.getMockImplementation();
  fetch.mockImplementation((url) => String(url).includes('/tribe/events/')
    ? Promise.reject(new Error('Events offline')) : apiFetch(url));
  render(<HomeScreen navigation={navigation} />);
  expect(await screen.findByText(update.title)).toBeOnTheScreen();
  expect(screen.getByText(article.title)).toBeOnTheScreen();
  expect(screen.queryByTestId('home-error')).toBeNull();
});

test('Home can show an all-day event today when there are no updates', async () => {
  mockApi({
    '/wpUpdates': [],
    '/events?': { events: [{
      id: 40, title: 'Donation drive', url: 'https://www.trm.org/event/donation-drive/',
      start_date: '2026-11-05 00:00:00', end_date: '2026-11-05 23:59:59', all_day: true,
    }] },
  });
  render(<HomeScreen navigation={navigation} />);
  expect(await screen.findByText('Donation drive')).toBeOnTheScreen();
  expect(screen.getByText('Upcoming event')).toBeOnTheScreen();
  expect(screen.queryByText('No updates available right now.')).toBeNull();
});
