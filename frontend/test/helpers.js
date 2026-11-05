import React from 'react';
import { render } from '@testing-library/react-native';
import { SavedResourcesProvider } from '../src/context/SavedResourcesContext';

export const article = {
  id: 11, kind: 'articles', title: 'A new beginning', date: '2026-10-08T12:00:00',
  excerpt: 'A hopeful story', link: 'https://www.trm.org/story/',
};
export const update = { id: 12, kind: 'updates', title: 'Mission news' };
export function response(data, ok = true, headers = {}) {
  return { ok, json: async () => data, headers: { get: (name) => headers[name.toLowerCase()] ?? null } };
}

export function wpPost(item) {
  if (item.title && typeof item.title === 'object') return item;
  return {
    id: item.id,
    title: { rendered: item.title },
    excerpt: { rendered: item.excerpt },
    content: { rendered: item.contentHtml },
    date: item.date,
    link: item.link,
    categories: [item.kind === 'updates' ? 14 : 1],
    _embedded: { author: item.author ? [{ name: item.author }] : [] },
  };
}

export function tribeEvent(item) {
  if ('start_date' in item) return item;
  return {
    id: item.id, title: item.title, description: item.description,
    url: item.url, image: item.image ? { url: item.image } : null,
    start_date: item.startDate, end_date: item.endDate,
    venue: item.venue ? { venue: item.venue, address: item.address } : null,
    cost: item.cost,
  };
}

export function mockApi(overrides = {}) {
  fetch.mockImplementation(async (url) => {
    const path = String(url).replace(/^https?:\/\/[^/]+/, '');
    const params = new URLSearchParams(path.split('?')[1] || '');
    const logicalPath = path.startsWith('/wp-json/wp/v2/posts/')
      ? '/wpArticles/' + path.split('/posts/')[1].split('?')[0]
      : path.startsWith('/wp-json/wp/v2/posts')
        ? params.get('per_page') === '10' ? '/wpResources?' + (path.split('?')[1] || '')
          : params.get('categories') === '14' ? '/wpUpdates' : '/wpArticles'
        : path.startsWith('/wp-json/wp/v2/pages') ? '/wpPage/' + params.get('slug')
          : path.startsWith('/wp-json/tribe/events/v1/events') ? '/events?' + (path.split('?')[1] || '')
            : path;
    for (const [prefix, data] of Object.entries(overrides)) {
      if (logicalPath.startsWith(prefix)) {
        const result = typeof data === 'function' ? data(logicalPath) : data;
        return apiResponse(logicalPath, result);
      }
    }
    if (logicalPath === '/wpArticles') return apiResponse(logicalPath, { articles: [article, { ...article, id: 13, title: 'Second story' }] });
    if (logicalPath === '/wpUpdates') return apiResponse(logicalPath, [update]);
    if (logicalPath.startsWith('/wpArticles/')) return apiResponse(logicalPath, { ...article, contentHtml: '<p>Full story content</p>' });
    if (logicalPath.startsWith('/wpResources')) return apiResponse(logicalPath, { resources: [article, update], totalPages: 1 });
    if (logicalPath.startsWith('/wpPage/')) return apiResponse(logicalPath, { title: 'Shelter details', contentHtml: '<p>Find help here</p>' });
    if (logicalPath.startsWith('/events?')) return apiResponse(logicalPath, { events: [] });
    throw new Error(`Missing API fixture: ${path}`);
  });
}

function apiResponse(path, data) {
  if (path === '/wpArticles') return response((data.articles || []).map(wpPost), true, { 'x-wp-totalpages': data.totalPages || 1 });
  if (path === '/wpUpdates') return response(data.map(wpPost));
  if (path.startsWith('/wpArticles/')) return response(wpPost(data));
  if (path.startsWith('/wpResources')) return response((data.resources || []).map(wpPost), true, { 'x-wp-totalpages': data.totalPages || 1 });
  if (path.startsWith('/wpPage/')) return response([{
    title: { rendered: data.title }, content: { rendered: data.contentHtml },
    modified: data.modified, link: data.link,
  }]);
  if (path.startsWith('/events?')) return response({ events: (data.events || []).map(tribeEvent) });
  return response(data);
}
export function renderSaved(ui) {
  return render(<SavedResourcesProvider>{ui}</SavedResourcesProvider>);
}
