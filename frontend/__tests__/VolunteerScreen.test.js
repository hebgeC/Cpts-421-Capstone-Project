import React from 'react';
import { render, screen, fireEvent, waitFor, within, act } from '@testing-library/react-native';
import axios from 'axios';
import { Modal } from 'react-native';
import VolunteerScreen from '../src/screens/VolunteerScreen';
import { navigation } from '../test/navigation';

const shift = {
  Name: 'Serve dinner', StartTime: '2026-10-08T16:00:00', EndTime: '2026-10-08T18:00:00',
  Location: 'Mission kitchen', SlotLimit: 3, EventUid: 'shift-123', ShortDescription: '<p>Help serve meals</p>',
  UserGroupRegistrations: [{ UserRegistrations: [{ Deleted: false }, { Deleted: true }] }],
};

beforeEach(() => {
  const date = '2026-10-08';
  axios.get.mockImplementation(async (url) => ({ data: url.includes('/volunteerShiftEvent/0/') ? [{ ...shift, StartTime: `${date}T16:00:00`, EndTime: `${date}T18:00:00` }] : [] }));
});

test('Volunteer loads shifts, opens details, excludes deleted registrations from slot counts, and signs up', async () => {
  render(<VolunteerScreen />);
  fireEvent.press(await screen.findByText(shift.Name));
  expect(screen.getByText(shift.Location)).toBeOnTheScreen();
  const details = within(screen.UNSAFE_getAllByType(Modal).find(modal => modal.props.visible));
  expect(details.getByText('2')).toBeOnTheScreen();
  expect(await screen.findByText('Help serve meals')).toBeOnTheScreen();
  fireEvent.press(screen.getByText('Sign Up'));
  expect(navigation.navigate).toHaveBeenCalledWith('WebView', { url: 'https://rescue-mission.volunteerhub.com/vv2/event/shift-123', title: shift.Name });
  expect(screen.queryByText('Sign Up')).toBeNull();
});

test('Volunteer closes details without signing up', async () => {
  render(<VolunteerScreen />);
  fireEvent.press(await screen.findByText(shift.Name));
  fireEvent.press(screen.getByText('Close'));
  expect(screen.queryByText('Sign Up')).toBeNull();
  expect(navigation.navigate).not.toHaveBeenCalled();
});

test('Volunteer selects another day and toggles it off', async () => {
  render(<VolunteerScreen />);
  await screen.findByText(shift.Name);
  fireEvent.press(screen.getByText('1'));
  expect(screen.getByText('No events scheduled')).toBeOnTheScreen();
  fireEvent.press(screen.getByText('1'));
  expect(screen.queryByText('No events scheduled')).toBeNull();
});

test('Volunteer changes month with the picker and fetches the new date range', async () => {
  render(<VolunteerScreen />);
  await screen.findByText(shift.Name);
  fireEvent.press(screen.getByText('October 2026'));
  fireEvent.press(screen.getByText('January'));
  fireEvent.press(screen.getByText('Done'));
  await waitFor(() => expect(axios.get).toHaveBeenCalledWith(expect.stringMatching(/volunteerShiftEvent\/0\/\d{4}-01-/)));
  expect(screen.queryByText(shift.Name)).toBeNull();
});

test('Volunteer handles failed page requests as an empty calendar', async () => {
  axios.get.mockRejectedValue(new Error('Offline'));
  render(<VolunteerScreen />);
  await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(10));
  expect(screen.getByText('No events scheduled')).toBeOnTheScreen();
});

test('Volunteer navigates across December/January and cancels a month selection', async () => {
  render(<VolunteerScreen />);
  await screen.findByText(shift.Name);
  fireEvent.press(screen.getByText('October 2026'));
  fireEvent.press(screen.getByText('Cancel'));
  expect(screen.getByText(shift.Name)).toBeOnTheScreen();
  fireEvent.press(screen.getByText('October 2026'));
  fireEvent.press(screen.getByText('January'));
  fireEvent.press(screen.getByText('Done'));
  fireEvent.press(screen.getByLabelText('Previous month'));
  expect(screen.getByText('December 2025')).toBeOnTheScreen();
  await waitFor(() => expect(axios.get).toHaveBeenCalledWith(expect.stringMatching(/volunteerShiftEvent\/0\/2025-12-/)));
  await act(async () => { fireEvent.press(screen.getByLabelText('Next month')); });
  expect(screen.getByText('January 2026')).toBeOnTheScreen();
});

test.each([
  ['overbooked', { SlotLimit: 0 }, '0'],
  ['without registration groups', { SlotLimit: 4, UserGroupRegistrations: undefined }, '4'],
])('Volunteer calculates open slots for a shift %s', async (_, overrides, expected) => {
  axios.get.mockResolvedValueOnce({ data: [{ ...shift, ...overrides }] });
  render(<VolunteerScreen />);
  fireEvent.press(await screen.findByText(shift.Name));
  const details = within(screen.UNSAFE_getAllByType(Modal).find(modal => modal.props.visible));
  expect(details.getByText(expected)).toBeOnTheScreen();
});
