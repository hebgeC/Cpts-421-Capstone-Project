import { test } from 'node:test';
import assert from 'node:assert/strict';
import nock from 'nock';
import request from 'supertest';
import app from '../app.js';
import { SITE_PAGES } from '../config/siteMap.js';
import { isolateExternalServices, wp, postFixture, mappedPost } from './helpers.js';

isolateExternalServices();
const postsPath = '/wp-json/wp/v2/posts';
const pagesPath = '/wp-json/wp/v2/pages';

test('GET /wpArticles uses the configured WordPress upstream', async () => {
  process.env.WP_API_BASE_URL = 'https://performance-upstream.example/wp-json/wp/v2/';
  nock('https://performance-upstream.example')
    .get(postsPath).query({ categories: 1, per_page: 20, page: 1, _embed: true })
    .reply(200, [postFixture()]);
  const res = await request(app).get('/wpArticles').expect(200);
  assert.deepEqual(res.body, { articles: [mappedPost], totalPages: 1 });
});

test('GET /wpUpdates requests updates and maps all post fields', async () => {
  wp().get(postsPath).query({ categories: 14, per_page: 20, _embed: true })
    .reply(200, [postFixture()]);
  const res = await request(app).get('/wpUpdates').expect(200);
  assert.deepEqual(res.body, [mappedPost]);
});

test('GET /wpUpdates returns an empty array when there are no posts', async () => {
  wp().get(postsPath).query(true).reply(200, []);
  const res = await request(app).get('/wpUpdates').expect(200);
  assert.deepEqual(res.body, []);
});

const sparsePosts = [
  ['missing fields', { id: 1 }],
  ['empty embedded arrays', { id: 1, _embedded: { author: [], 'wp:featuredmedia': [] } }],
  ['empty embedded objects', { id: 1, _embedded: { author: [{}], 'wp:featuredmedia': [{}] } }],
  ['null fields', { id: 1, title: null, excerpt: null, content: null, _embedded: null }],
  ['empty rendered fields', { id: 1, title: { rendered: '' }, excerpt: { rendered: '' }, content: { rendered: '' } }],
];
for (const [name, post] of sparsePosts) {
  test(`Post mapping supplies defaults for ${name}`, async () => {
    wp().get(`${postsPath}/1`).query({ _embed: true }).reply(200, post);
    const res = await request(app).get('/wpArticles/1').expect(200);
    assert.deepEqual(res.body, { id: 1, title: '', excerpt: '', contentHtml: '', image: null, author: null });
  });
}

for (const [query, page] of [[{}, 1], [{ page: '3' }, 3], [{ page: 'abc' }, 1], [{ page: '0' }, 1]]) {
  test(`GET /wpArticles handles page query ${JSON.stringify(query)}`, async () => {
    wp().get(postsPath).query({ categories: 1, per_page: 20, page, _embed: true })
      .reply(200, [postFixture()], { 'x-wp-totalpages': '4' });
    const res = await request(app).get('/wpArticles').query(query).expect(200);
    assert.deepEqual(res.body, { articles: [mappedPost], totalPages: 4 });
  });
}

for (const header of [undefined, 'invalid', '0']) {
  test(`GET /wpArticles defaults totalPages for header ${header}`, async () => {
    wp().get(postsPath).query(true).reply(200, [], header === undefined ? {} : { 'x-wp-totalpages': header });
    const res = await request(app).get('/wpArticles').expect(200);
    assert.deepEqual(res.body, { articles: [], totalPages: 1 });
  });
}

test('GET /wpArticles/:id forwards the ID and preserves article HTML', async () => {
  wp().get(`${postsPath}/42`).query({ _embed: true }).reply(200, postFixture());
  const res = await request(app).get('/wpArticles/42').expect(200);
  assert.deepEqual(res.body, mappedPost);
});

for (const [kind, categories] of [[undefined, '1,14'], ['updates', '14'], ['articles', '1'], ['unknown', '1,14']]) {
  test(`GET /wpResources requests categories for kind ${kind}`, async () => {
    wp().get(postsPath).query({ categories, per_page: 10, page: 1, _embed: true })
      .reply(200, [postFixture({ categories: [14] }), postFixture()], {
        'x-wp-total': '32', 'x-wp-totalpages': '4',
      });
    const res = await request(app).get('/wpResources').query(kind ? { kind } : {}).expect(200);
    const { contentHtml, ...summary } = mappedPost;
    assert.deepEqual(res.body, { resources: [
      { ...summary, kind: 'updates' }, { ...summary, kind: 'articles' },
    ], total: 32, totalPages: 4, page: 1 });
    assert.ok(res.body.resources.every(resource => !Object.hasOwn(resource, 'contentHtml')));
  });
}

const paginationCases = [
  [{ page: '4', per_page: '7' }, 4, 7],
  [{ page: '-2', per_page: '-5' }, 1, 1],
  [{ page: '0', per_page: '0' }, 1, 10],
  [{ page: 'abc', per_page: 'abc' }, 1, 10],
  [{ per_page: '100' }, 1, 20],
  [{ per_page: '1' }, 1, 1],
  [{ per_page: '20' }, 1, 20],
];
for (const [query, page, perPage] of paginationCases) {
  test(`GET /wpResources bounds pagination for ${JSON.stringify(query)}`, async () => {
    wp().get(postsPath).query({ categories: '1,14', per_page: perPage, page, _embed: true })
      .reply(200, []);
    const res = await request(app).get('/wpResources').query(query).expect(200);
    assert.deepEqual(res.body, { resources: [], total: 0, totalPages: 1, page });
  });
}

for (const categories of [undefined, [], [1], [1, 14]]) {
  test(`GET /wpResources classifies post categories ${JSON.stringify(categories)}`, async () => {
    wp().get(postsPath).query(true).reply(200, [postFixture({ categories })], {
      'x-wp-total': 'invalid', 'x-wp-totalpages': 'invalid',
    });
    const res = await request(app).get('/wpResources').expect(200);
    assert.equal(res.body.resources[0].kind, categories?.includes(14) ? 'updates' : 'articles');
    assert.equal(res.body.total, 1);
    assert.equal(res.body.totalPages, 1);
  });
}

test('GET /wpPage/:slug maps a known page and preserves HTML', async () => {
  wp().get(pagesPath).query({ slug: 'about', _embed: true }).reply(200, [{
    title: { rendered: '<b>About &amp; Us</b>' }, content: { rendered: '<p>Our mission</p>' },
    modified: '2026-01-02', link: 'https://www.trm.org/about/',
  }]);
  const res = await request(app).get('/wpPage/about').expect(200);
  assert.deepEqual(res.body, { title: 'About & Us', contentHtml: '<p>Our mission</p>',
    modified: '2026-01-02', link: 'https://www.trm.org/about/', slug: 'about' });
});

test('GET /wpPage/:slug supplies defaults for sparse page data', async () => {
  wp().get(pagesPath).query({ slug: 'about', _embed: true }).reply(200, [{}]);
  const res = await request(app).get('/wpPage/about').expect(200);
  assert.deepEqual(res.body, { title: '', contentHtml: '', slug: 'about' });
});

test('GET /wpPage/:slug returns 404 when WordPress has no matching page', async () => {
  wp().get(pagesPath).query({ slug: 'about', _embed: true }).reply(200, []);
  const res = await request(app).get('/wpPage/about').expect(404);
  assert.deepEqual(res.body, { error: 'Page not found on trm.org' });
});

for (const slug of ['unknown', 'donate', 'careers', 'ABOUT']) {
  test(`GET /wpPage/${slug} rejects an unknown or external page without upstream access`, async () => {
    const res = await request(app).get(`/wpPage/${slug}`).expect(404);
    assert.deepEqual(res.body, { error: 'Unknown page' });
    assert.equal(console.error.mock.callCount(), 0);
  });
}

for (const page of SITE_PAGES.filter(page => page.type === 'page')) {
  test(`GET /wpPage recognizes configured slug ${page.slug}`, async () => {
    wp().get(pagesPath).query({ slug: page.slug, _embed: true }).reply(200, [{ title: { rendered: page.title } }]);
    const res = await request(app).get(`/wpPage/${page.slug}`).expect(200);
    assert.equal(res.body.slug, page.slug);
    assert.equal(res.body.title, page.title);
  });
}

const failures = [
  ['/wpUpdates', postsPath, 'Failed to fetch updates'],
  ['/wpArticles', postsPath, 'Failed to fetch articles'],
  ['/wpResources', postsPath, 'Failed to fetch resources'],
  ['/wpArticles/42', `${postsPath}/42`, 'Failed to fetch article'],
  ['/wpPage/about', pagesPath, 'Failed to fetch page'],
];
for (const [route, upstream, error] of failures) {
  for (const failure of ['http', 'network']) {
    test(`${route} returns its stable error response on ${failure} failure`, async () => {
      const scope = wp().get(upstream).query(true);
      if (failure === 'http') scope.reply(503, { secret: 'private upstream message' });
      else scope.replyWithError('Connection reset');
      const res = await request(app).get(route).expect(500);
      assert.deepEqual(res.body, { error });
      assert.equal(console.error.mock.callCount(), 1);
    });
  }
}

for (const route of ['/wpUpdates', '/wpArticles', '/wpResources']) {
  test(`${route} handles a malformed upstream list`, async () => {
    wp().get(postsPath).query(true).reply(200, { unexpected: 'object' });
    const res = await request(app).get(route).expect(500);
    assert.match(res.body.error, /^Failed to fetch /);
  });
}
