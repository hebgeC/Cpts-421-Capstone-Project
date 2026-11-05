import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import DonationScreen from '../src/screens/DonationScreen';
import { navigation } from '../test/navigation';

test.each([
  ['Donate Here', 'https://www.trm.org/donate/?form=FUNHYQKHUSS'],
  ['Donation Portal', 'https://support.trm.org/login'],
])('%s opens the correct link in the app WebView', (label, url) => {
  render(<DonationScreen />);

  fireEvent.press(screen.getByRole('button', { name: label }));

  expect(navigation.navigate).toHaveBeenCalledWith('WebView', { url, title: label });
});
