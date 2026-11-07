import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Modal } from 'react-native';
import CalendarDatePicker from '../src/components/CalendarDatePicker';
import MonthYearPicker from '../src/components/MonthYearPicker';

test('Day picker crosses year boundaries, moves years and confirms the selected date', () => {
  const confirm = jest.fn();
  render(<CalendarDatePicker visible value="2026-12-15" onConfirm={confirm} onCancel={jest.fn()} />);
  fireEvent.press(screen.getByLabelText('Next month'));
  expect(screen.getByText('January 2027')).toBeOnTheScreen();
  fireEvent.press(screen.getByLabelText('Previous month'));
  expect(screen.getByText('December 2026')).toBeOnTheScreen();
  fireEvent.press(screen.getByLabelText('Previous year'));
  expect(screen.getByText('December 2025')).toBeOnTheScreen();
  fireEvent.press(screen.getByLabelText('Next year'));
  fireEvent.press(screen.getByLabelText('Select 2026-12-20'));
  fireEvent.press(screen.getByText('Done'));
  expect(confirm).toHaveBeenCalledWith('2026-12-20');
});

test('Day picker Today resets the displayed month and selected date', () => {
  const confirm = jest.fn();
  render(<CalendarDatePicker visible value="2024-02-01" onConfirm={confirm} onCancel={jest.fn()} />);
  fireEvent.press(screen.getByText('Today'));
  expect(screen.getByText('October 2026')).toBeOnTheScreen();
  fireEvent.press(screen.getByText('Done'));
  expect(confirm).toHaveBeenCalledWith('2026-10-08');
});

test('Day picker handles a missing initial date and hardware dismissal', () => {
  const cancel = jest.fn();
  render(<CalendarDatePicker visible onConfirm={jest.fn()} onCancel={cancel} />);
  expect(screen.getByText('October 2026')).toBeOnTheScreen();
  fireEvent(screen.UNSAFE_getByType(Modal), 'requestClose');
  expect(cancel).toHaveBeenCalledTimes(1);
});

test('Day picker refreshes its selection when reopened with a new date', () => {
  const confirm = jest.fn();
  const view = render(<CalendarDatePicker visible value="2026-10-08" onConfirm={confirm} onCancel={jest.fn()} />);
  fireEvent.press(screen.getByLabelText('Select 2026-10-20'));
  view.rerender(<CalendarDatePicker visible value="2027-02-01" onConfirm={confirm} onCancel={jest.fn()} />);
  expect(screen.getByText('February 2027')).toBeOnTheScreen();
  fireEvent.press(screen.getByText('Done'));
  expect(confirm).toHaveBeenCalledWith('2027-02-01');
});

test('Month picker confirms a selection and supports cancel and hardware dismissal', () => {
  const confirm = jest.fn();
  const cancel = jest.fn();
  render(<MonthYearPicker visible currentMonth={9} currentYear={2026} onConfirm={confirm} onCancel={cancel} />);
  fireEvent.press(screen.getByText('January'));
  fireEvent.press(screen.getByText('2001'));
  fireEvent.press(screen.getByText('Done'));
  expect(confirm).toHaveBeenCalledWith(0, 2001);
  fireEvent.press(screen.getByText('Cancel'));
  fireEvent(screen.UNSAFE_getByType(Modal), 'requestClose');
  expect(cancel).toHaveBeenCalledTimes(2);
});
