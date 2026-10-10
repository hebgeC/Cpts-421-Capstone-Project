import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import InformationScreen from '../src/screens/ProfileScreen';
import { navigation } from '../test/navigation';

test.each([
  ['Donation Portal', 'https://support.trm.org'],
  ['In-Kind Giving', 'https://www.trm.org/inkind/'],
  ['About TRM', 'https://www.trm.org/about/'],
  ['Help & Support', 'https://www.trm.org/contact/'],
])('Information opens %s in the app browser', (title, url) => {
  render(<InformationScreen />);
  fireEvent.press(screen.getByText(title));
  expect(navigation.navigate).toHaveBeenCalledWith('WebView', { url, title });
});
