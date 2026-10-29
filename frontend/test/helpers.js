import React from 'react';
import { render } from '@testing-library/react-native';
import { SavedResourcesProvider } from '../src/context/SavedResourcesContext';

export const article = {
  id: 11, kind: 'articles', title: 'A new beginning', date: '2026-10-08T12:00:00',
  excerpt: 'A hopeful story', link: 'https://www.trm.org/story/',
};
export const update = { id: 12, kind: 'updates', title: 'Mission news' };
export const siteMap = {
  categories: [{ key: 'help', title: 'Get Help', icon: 'heart', bg: '#FFFFFF', color: '#C0392B' }],
  items: [
    { key: 'shelter', category: 'help', type: 'page', slug: 'emergency-services', title: 'Shelter', icon: 'home' },
    { key: 'donate', category: 'help', type: 'external', url: 'https://www.trm.org/donate/', title: 'Donate', icon: 'heart' },
  ],
};
export function response(data, ok = true) {
  return { ok, json: async () => data };
}
export function mockApi(overrides = {}) {
  fetch.mockImplementation(async (url) => {
    const path = String(url).replace(/^https?:\/\/[^/]+/, '');
    for (const [prefix, data] of Object.entries(overrides)) {
      if (path.startsWith(prefix)) return response(typeof data === 'function' ? data(path) : data);
    }
    if (path === '/wpArticles') return response({ articles: [article, { ...article, id: 13, title: 'Second story' }] });
    if (path === '/wpUpdates') return response([update]);
    if (path.startsWith('/wpArticles/')) return response({ ...article, contentHtml: '<p>Full story content</p>' });
    if (path.startsWith('/wpResources')) return response({ resources: [article, update], totalPages: 1 });
    if (path === '/siteMap') return response(siteMap);
    if (path.startsWith('/wpPage/')) return response({ title: 'Shelter details', contentHtml: '<p>Find help here</p>' });
    if (path.startsWith('/events?')) return response({ events: [] });
    throw new Error(`Missing API fixture: ${path}`);
  });
}
export function renderSaved(ui) {
  return render(<SavedResourcesProvider>{ui}</SavedResourcesProvider>);
}
