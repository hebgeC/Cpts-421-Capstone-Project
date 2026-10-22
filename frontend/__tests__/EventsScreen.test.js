import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { Linking, RefreshControl } from 'react-native';
import EventsScreen from '../src/screens/EventsScreen';
import { mockApi, response } from '../test/helpers';

const fundraiser = { id: 1, title: 'Community Dinner', startDate: '2026-10-15 15:00:00', endDate: '2026-10-15 18:00:00', venue: 'Tacoma Hall', url: 'https://www.trm.org/dinner/', cost: '$10', description: 'Meet your neighbors', address: '425 South Tacoma Way' };
const past = { id: 2, title: 'Summer Drive', startDate: '2026-08-01 09:00:00', url: 'https://www.trm.org/drive/' };

function eventsApi() {
  mockApi({ '/events?': (path) => ({ events: path.includes('start_date=2000') ? [past] : [fundraiser] }) });
}

test('Events shows upcoming and past events, details, price and external links', async () => {
  eventsApi();
  render(<EventsScreen />);
  expect(screen.getByText('Loading events from TRM...')).toBeOnTheScreen();
  await screen.findByText(fundraiser.title);
  expect(screen.getByText(past.title)).toBeOnTheScreen();
  expect(screen.getByText('October 15, 2026 @ 3:00 PM - 6:00 PM')).toBeOnTheScreen();
  expect(screen.getByText('$10')).toBeOnTheScreen();
  expect(screen.getByText(fundraiser.venue)).toBeOnTheScreen();
  expect(screen.getByText(fundraiser.address)).toBeOnTheScreen();
  expect(screen.getByText(fundraiser.description)).toBeOnTheScreen();
  fireEvent.press(screen.getByText(fundraiser.title));
  expect(Linking.openURL).toHaveBeenLastCalledWith(fundraiser.url);
  fireEvent.press(screen.getByText('View full events page at trm.org'));
  expect(Linking.openURL).toHaveBeenLastCalledWith('https://www.trm.org/events/');
});

test('Events searches titles and venues case-insensitively and reports no matches', async () => {
  eventsApi();
  render(<EventsScreen />);
  await screen.findByText(fundraiser.title);
  const search = screen.getByPlaceholderText('Enter Keyword. Search for Events by Keyword.');
  fireEvent.changeText(search, 'TACOMA');
  expect(screen.getByText(fundraiser.title)).toBeOnTheScreen();
  expect(screen.queryByText(past.title)).toBeNull();
  fireEvent.changeText(search, 'summer');
  expect(screen.getByText(past.title)).toBeOnTheScreen();
  expect(screen.queryByText(fundraiser.title)).toBeNull();
  fireEvent.changeText(search, 'nothing');
  expect(screen.getByText('No events found for "nothing"')).toBeOnTheScreen();
  fireEvent.changeText(search, '');
  expect(screen.getByText(fundraiser.title)).toBeOnTheScreen();
});

test('Events combines All, Month and Day filters with keyword search', async () => {
  eventsApi();
  render(<EventsScreen />);
  await screen.findByText(fundraiser.title);

  fireEvent.press(screen.getByText('Month'));
  fireEvent.press(screen.getByText('October'));
  fireEvent.press(screen.getByText('Done'));
  await screen.findByText('Showing events for October 2026');
  const search = screen.getByPlaceholderText('Enter Keyword. Search for Events by Keyword.');
  fireEvent.changeText(search, 'community');
  expect(screen.getByText(fundraiser.title)).toBeOnTheScreen();
  expect(screen.queryByText(past.title)).toBeNull();

  fireEvent.press(screen.getByText('Day'));
  fireEvent.press(screen.getByLabelText('Select 2026-10-15'));
  fireEvent.press(screen.getByText('Done'));
  await screen.findByText('Showing events for October 15, 2026');
  fireEvent.changeText(screen.getByPlaceholderText('Enter Keyword. Search for Events by Keyword.'), 'tacoma');
  expect(screen.getByText(fundraiser.title)).toBeOnTheScreen();
  expect(screen.queryByText(past.title)).toBeNull();

  fireEvent.press(screen.getByText('List'));
  fireEvent.changeText(screen.getByPlaceholderText('Enter Keyword. Search for Events by Keyword.'), 'summer');
  expect(await screen.findByText(past.title)).toBeOnTheScreen();
  expect(screen.queryByText(fundraiser.title)).toBeNull();
});

test('Events applies a real day picker selection and returns to List', async () => {
  eventsApi();
  render(<EventsScreen />);
  await screen.findByText(fundraiser.title);
  fireEvent.press(screen.getByText('Day'));
  fireEvent.press(screen.getByLabelText('Select 2026-10-15'));
  fireEvent.press(screen.getByText('Done'));
  await screen.findByText('Showing events for October 15, 2026');
  await screen.findByText(fundraiser.title);
  expect(fetch).toHaveBeenCalledWith(expect.stringContaining('start_date=2026-10-15&end_date=2026-10-15'));
  fireEvent.press(screen.getByText('List'));
  await screen.findByText(past.title);
  expect(screen.queryByText(/Showing events for/)).toBeNull();
});

test('Events applies a month picker, displays an empty month and can cancel without filtering', async () => {
  eventsApi();
  render(<EventsScreen />);
  await screen.findByText(fundraiser.title);
  fireEvent.press(screen.getByText('Month'));
  fireEvent.press(screen.getByText('Cancel'));
  expect(screen.queryByText(/Showing events for/)).toBeNull();
  fireEvent.press(screen.getByText('Month'));
  fireEvent.press(screen.getByText('January'));
  fireEvent.press(screen.getByText('Done'));
  await screen.findByText('No events scheduled for January 2026.');
  expect(fetch).toHaveBeenCalledWith(expect.stringContaining('start_date=2026-01-01&end_date=2026-01-31'));
});

test('Events cancels the day picker without changing the list', async () => {
  eventsApi();
  render(<EventsScreen />);
  await screen.findByText(fundraiser.title);
  fireEvent.press(screen.getByText('Day'));
  fireEvent.press(screen.getByText('Cancel'));
  expect(screen.queryByText('Select a day')).toBeNull();
  expect(screen.getByText(past.title)).toBeOnTheScreen();
});

test('Events handles an empty list and refreshes it', async () => {
  mockApi();
  render(<EventsScreen />);
  await screen.findByText('There are no upcoming events.');
  eventsApi();
  fireEvent(screen.UNSAFE_getByType(RefreshControl), 'refresh');
  expect(await screen.findByText(fundraiser.title)).toBeOnTheScreen();
});

test.each(['network', 'http'])('Events recovers from a failed load (%s)', async (failure) => {
  if (failure === 'network') fetch.mockRejectedValue(new Error('Offline'));
  else fetch.mockResolvedValue(response({}, false));
  render(<EventsScreen />);
  await screen.findByText(/Could not load events/);
  eventsApi();
  fireEvent.press(screen.getByText('Retry'));
  expect(await screen.findByText(fundraiser.title)).toBeOnTheScreen();
});

test('Events recovers from a failed request when the user pulls to refresh', async () => {
  fetch.mockRejectedValue(new Error('Offline'));
  render(<EventsScreen />);
  await screen.findByText(/Could not load events/);

  eventsApi();
  fireEvent(screen.UNSAFE_getByType(RefreshControl), 'refresh');
  expect(await screen.findByText(fundraiser.title)).toBeOnTheScreen();
});

test('Events discards a slow stale list response after selecting a day', async () => {
  let finishUpcoming;
  let finishPast;
  fetch.mockReturnValueOnce(new Promise(resolve => { finishUpcoming = resolve; }))
    .mockReturnValueOnce(new Promise(resolve => { finishPast = resolve; }));
  render(<EventsScreen />);
  eventsApi();
  fireEvent.press(screen.getByText('Day'));
  fireEvent.press(screen.getByLabelText('Select 2026-10-15'));
  fireEvent.press(screen.getByText('Done'));
  await screen.findByText(fundraiser.title);
  await act(async () => {
    finishUpcoming(response({ events: [{ ...fundraiser, title: 'Stale dinner' }] }));
    finishPast(response({ events: [past] }));
  });
  expect(screen.queryByText('Stale dinner')).toBeNull();
  expect(screen.getByText(fundraiser.title)).toBeOnTheScreen();
});
