import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import VolunteerScreen from '../src/screens/VolunteerScreen';
import { navigation } from '../test/navigation';

const signInUrl = 'https://rescue-mission.volunteerhub.com/account/signin?ReturnUrl=%2F';

test('Volunteer shows the three volunteer options', () => {
  render(<VolunteerScreen />);

  expect(screen.getByText('Create Your TRM Volunteer Account')).toBeOnTheScreen();
  expect(screen.getByText('Returning Volunteers')).toBeOnTheScreen();
  expect(screen.getByText('Group Volunteering (5 or more people)')).toBeOnTheScreen();
});

test.each([
  ['Create Your TRM Volunteer Account', signInUrl],
  ['Returning Volunteers', signInUrl],
  ['Group Volunteering (5 or more people)', 'https://www.trm.org/group-volunteer-opportunities'],
])('Volunteer opens %s in the app browser', (title, url) => {
  render(<VolunteerScreen />);

  fireEvent.press(screen.getByText(title));

  expect(navigation.navigate).toHaveBeenCalledWith('WebView', { url, title });
});

test('Volunteer cards use the selected WordPress image URLs directly', () => {
  render(<VolunteerScreen />);

  expect(screen.getByLabelText('Create Your TRM Volunteer Account photo').props.source.uri)
    .toBe('https://www.trm.org/wp-content/uploads/2023/05/TRM-Volunteers-03.jpg');
  expect(screen.getByLabelText('Returning Volunteers photo').props.source.uri)
    .toBe('https://www.trm.org/wp-content/uploads/2025/02/Untitled-design-48.png');
  expect(screen.getByLabelText('Group Volunteering (5 or more people) photo').props.source.uri)
    .toBe('https://www.trm.org/wp-content/uploads/2025/02/IMG_0153-scaled-e1738962096722.jpg');
  expect(fetch).not.toHaveBeenCalled();
});
