import {
  getArticles, getArticleById, getPageBySlug, getResources, getSiteMap, getUpdates,
} from '../src/services/wordpress';
import { getEvents } from '../src/services/events';
import { response, wpPost } from '../test/helpers';

test('WordPress services request public posts and preserve pagination metadata', async () => {
  fetch.mockResolvedValueOnce(response([wpPost({ id: 3, title: 'A &amp; B', kind: 'articles' })], true, {
    'x-wp-totalpages': 4,
  }));
  const articles = await getArticles(2);
  expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/wp-json/wp/v2/posts?categories=1&per_page=20&page=2&_embed=wp%3Afeaturedmedia%2Cauthor'));
  expect(articles.totalPages).toBe(4);
  expect(articles.articles[0].title).toBe('A & B');

  fetch.mockResolvedValueOnce(response([wpPost({ id: 8, title: 'News', kind: 'updates' })], true, {
    'x-wp-total': 25, 'x-wp-totalpages': 3,
  }));
  const resources = await getResources({ page: 2, perPage: 10, kind: 'updates' });
  expect(fetch).toHaveBeenLastCalledWith(expect.stringContaining('categories=14&per_page=10&page=2'));
  expect(resources).toEqual(expect.objectContaining({ total: 25, totalPages: 3, page: 2 }));
  expect(resources.resources[0]).toEqual(expect.objectContaining({ kind: 'updates', title: 'News' }));
  expect(resources.resources[0]).not.toHaveProperty('contentHtml');
});

test('WordPress detail services map posts and restrict pages to the site map', async () => {
  fetch.mockResolvedValueOnce(response(wpPost({ id: 8, title: 'News', contentHtml: '<p>Full text</p>' })));
  expect(await getArticleById(8)).toEqual(expect.objectContaining({ id: 8, contentHtml: '<p>Full text</p>' }));
  expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/posts/8?_embed=wp%3Afeaturedmedia%2Cauthor'));

  fetch.mockResolvedValueOnce(response([{
    title: { rendered: 'About &amp; Us' }, content: { rendered: '<p>Welcome</p>' },
    modified: '2026-10-01', link: 'https://www.trm.org/about/',
  }]));
  expect(await getPageBySlug('about')).toEqual(expect.objectContaining({
    slug: 'about', title: 'About & Us', contentHtml: '<p>Welcome</p>',
  }));
  await expect(getPageBySlug('unknown-slug')).rejects.toThrow('Unknown page');
  expect(fetch).toHaveBeenCalledTimes(2);
  expect(getSiteMap().items.some((item) => item.slug === 'about')).toBe(true);
});

test('Updates reject HTTP errors', async () => {
  fetch.mockResolvedValueOnce(response({}, false));
  await expect(getUpdates()).rejects.toThrow('WordPress request failed');
});

test('Post mapping uses WordPress image sizes for cards and thumbnails', async () => {
  const post = wpPost({ id: 9, title: 'Story' });
  post._embedded['wp:featuredmedia'] = [{
    source_url: 'https://www.trm.org/full.jpg',
    media_details: { sizes: {
      medium_large: { source_url: 'https://www.trm.org/medium.jpg' },
      thumbnail: { source_url: 'https://www.trm.org/thumb.jpg' },
    } },
  }];
  fetch.mockResolvedValueOnce(response([post]));
  const result = await getArticles(1, 5);
  expect(fetch).toHaveBeenCalledWith(expect.stringContaining('per_page=5'));
  expect(result.articles[0]).toEqual(expect.objectContaining({
    image: 'https://www.trm.org/medium.jpg',
    imageOriginal: 'https://www.trm.org/full.jpg',
    imageThumbnail: 'https://www.trm.org/thumb.jpg',
    contentHtml: '',
  }));
});

test('Updates request featured media so update photos can load', async () => {
  const post = wpPost({ id: 10, title: 'Update', kind: 'updates' });
  post._embedded['wp:featuredmedia'] = [{ source_url: 'https://www.trm.org/update.jpg' }];
  fetch.mockResolvedValueOnce(response([post]));
  const updates = await getUpdates();
  expect(fetch).toHaveBeenCalledWith(expect.stringContaining('_embed=wp%3Afeaturedmedia%2Cauthor'));
  expect(updates[0].image).toBe('https://www.trm.org/update.jpg');
});

test('Events service maps the public Events Calendar response', async () => {
  fetch.mockResolvedValueOnce(response({ events: [{
    id: 7, title: 'Dinner &amp; Music', description: '<p>Join us</p>',
    start_date: '2026-11-15 17:00:00', end_date: '2026-11-15 19:00:00',
    venue: { venue: 'Main Hall', address: '425 S Tacoma Way', city: 'Tacoma', state: 'WA' },
    image: { url: 'https://www.trm.org/dinner.jpg' }, cost: 'Free',
  }], total: 1, total_pages: 1 }));
  const result = await getEvents({ perPage: 50, startDate: '2026-11-01', endDate: '2026-11-30' });
  expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/wp-json/tribe/events/v1/events?page=1&per_page=50&start_date=2026-11-01&end_date=2026-11-30'));
  expect(result.events[0]).toEqual(expect.objectContaining({
    title: 'Dinner & Music', description: 'Join us', venue: 'Main Hall',
    address: '425 S Tacoma Way, Tacoma, WA', image: 'https://www.trm.org/dinner.jpg',
  }));
});
