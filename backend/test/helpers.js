import { before, beforeEach, afterEach, after, mock } from 'node:test';
import assert from 'node:assert/strict';
import nock from 'nock';

// Each test file runs in its own process. Never use real credentials or services.
export function isolateExternalServices() {
  const originalKey = process.env.VOLUNTEERHUB_API_KEY;
  const originalWpBase = process.env.WP_API_BASE_URL;
  before(() => {
    nock.disableNetConnect();
    nock.enableNetConnect(host => /^(127\.0\.0\.1|localhost|\[::1\])(?::\d+)?$/.test(host));
  });
  beforeEach(() => {
    delete process.env.VOLUNTEERHUB_API_KEY;
    delete process.env.WP_API_BASE_URL;
    mock.method(console, 'error', () => {});
  });
  afterEach(() => {
    const pending = nock.pendingMocks();
    nock.cleanAll();
    mock.restoreAll();
    assert.deepEqual(pending, [], 'All expected upstream requests must be made');
  });
  after(() => {
    nock.enableNetConnect();
    if (originalKey === undefined) delete process.env.VOLUNTEERHUB_API_KEY;
    else process.env.VOLUNTEERHUB_API_KEY = originalKey;
    if (originalWpBase === undefined) delete process.env.WP_API_BASE_URL;
    else process.env.WP_API_BASE_URL = originalWpBase;
  });
}

export const wp = () => nock('https://www.trm.org');
export const volunteer = () => nock('https://rescue-mission.volunteerhub.com', {
  reqheaders: { authorization: 'test-volunteer-key' },
});

export function postFixture(overrides = {}) {
  return {
    id: 42,
    title: { rendered: '<b>A &amp; B</b>' },
    excerpt: { rendered: '<p>Helping&nbsp; neighbors&#8217; lives</p>' },
    content: { rendered: '<p>Keep <strong>this HTML</strong>.</p>' },
    date: '2026-01-02T12:00:00',
    link: 'https://www.trm.org/story/',
    categories: [1],
    _embedded: {
      'wp:featuredmedia': [{ source_url: 'https://www.trm.org/photo.jpg' }],
      author: [{ name: 'TRM' }],
    },
    ...overrides,
  };
}

export const mappedPost = {
  id: 42,
  title: 'A & B',
  excerpt: "Helping neighbors' lives",
  contentHtml: '<p>Keep <strong>this HTML</strong>.</p>',
  date: '2026-01-02T12:00:00',
  link: 'https://www.trm.org/story/',
  image: 'https://www.trm.org/photo.jpg',
  author: 'TRM',
};
