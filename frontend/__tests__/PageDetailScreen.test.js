import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Linking } from 'react-native';
import PageDetailScreen from '../src/screens/PageDetailScreen';
import { navigation, route } from '../test/navigation';
import { mockApi, response } from '../test/helpers';

beforeEach(() => { route.params = { slug: 'emergency-services', title: 'Shelter' }; });

test('PageDetail loads HTML, calls the shelter, opens the source and goes back', async () => {
  mockApi({ '/wpPage/': { title: 'Shelter details', contentHtml: '<p>Find help here</p>', modified: '2026-10-08', link: 'https://www.trm.org/shelter/' } });
  render(<PageDetailScreen />);
  const page = await screen.findByTestId('wordpress-webview');
  expect(page.props.source.html).toContain('Find help here');
  expect(page.props.source.html).toContain('Last updated');
  expect(screen.queryByLabelText('Save resource')).toBeNull();
  page.props.onShouldStartLoadWithRequest({ navigationType: 'click', url: 'tel:2533834493' });
  expect(Linking.openURL).toHaveBeenLastCalledWith('tel:2533834493');
  page.props.onShouldStartLoadWithRequest({ navigationType: 'click', url: 'https://www.trm.org/shelter/' });
  expect(Linking.openURL).toHaveBeenLastCalledWith('https://www.trm.org/shelter/');
  fireEvent.press(screen.getByLabelText('Go back'));
  expect(navigation.goBack).toHaveBeenCalled();
});

test('PageDetail routes HTML web links internally and telephone/email links to the OS', async () => {
  mockApi({ '/wpPage/': { title: 'Contact', contentHtml: '<p><a href="https://www.trm.org/help">Help online</a> <a href="tel:123">Call us</a> <a href="mailto:help@trm.org">Email us</a></p>' } });
  render(<PageDetailScreen />);
  const page = await screen.findByTestId('wordpress-webview');
  page.props.onShouldStartLoadWithRequest({ navigationType: 'click', url: 'https://www.trm.org/help' });
  expect(navigation.navigate).toHaveBeenCalledWith('WebView', { url: 'https://www.trm.org/help', title: 'Contact' });
  page.props.onShouldStartLoadWithRequest({ navigationType: 'click', url: 'tel:123' });
  expect(Linking.openURL).toHaveBeenLastCalledWith('tel:123');
  page.props.onShouldStartLoadWithRequest({ navigationType: 'click', url: 'mailto:help@trm.org' });
  expect(Linking.openURL).toHaveBeenLastCalledWith('mailto:help@trm.org');
});

test.each(['network', 'http'])('PageDetail retries a failed request (%s)', async (failure) => {
  if (failure === 'network') fetch.mockRejectedValue(new Error('Offline'));
  else fetch.mockResolvedValue(response({}, false));
  render(<PageDetailScreen />);
  await screen.findByText(/Could not load this page/);
  mockApi();
  fireEvent.press(screen.getByText('Retry'));
  expect((await screen.findByTestId('wordpress-webview')).props.source.html).toContain('Find help here');
});

test('PageDetail omits the emergency phone shortcut and source button on other pages', async () => {
  route.params = { slug: 'about', title: 'About' };
  mockApi();
  render(<PageDetailScreen />);
  const html = (await screen.findByTestId('wordpress-webview')).props.source.html;
  expect(html).toContain('Find help here');
  expect(html).not.toContain('tel:2533834493');
  expect(html).not.toContain('View full page on trm.org');
});

test('PageDetail keeps WordPress tables and layout markup for the phone browser', async () => {
  route.params = { slug: 'contact', title: 'Contact Us' };
  mockApi({ '/wpPage/': { title: 'Contact', contentHtml: '<div class="wp-block-columns"><figure class="wp-block-table"><table><tr><td><strong>Office</strong></td></tr></table></figure></div><script>ignored()</script>' } });
  render(<PageDetailScreen />);
  const html = (await screen.findByTestId('wordpress-webview')).props.source.html;
  expect(html).toContain('<table>');
  expect(html).toContain('.wp-block-columns { display: flex');
  expect(html).not.toContain('ignored()');
});
