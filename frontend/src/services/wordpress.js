import { CATEGORIES, SITE_PAGES } from './siteMap';
import { decodeEntities, normalizePageHtml } from './text';

const WP_API_BASE_URL = (
  process.env.EXPO_PUBLIC_WP_API_BASE_URL || 'https://www.trm.org/wp-json/wp/v2'
).replace(/\/+$/, '');

const UPDATES_CATEGORY_ID = 14;
const ARTICLES_CATEGORY_ID = 1;
const LIST_FIELDS = 'id,title,excerpt,date,link,categories,_links,_embedded';
const POST_EMBED = 'wp:featuredmedia,author';

function queryUrl(path, params = {}) {
  const query = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
  return `${WP_API_BASE_URL}${path}${query ? `?${query}` : ''}`;
}

async function getJson(path, params) {
  const response = await fetch(queryUrl(path, params));
  if (!response.ok) throw new Error(`WordPress request failed: ${response.status}`);
  return { data: await response.json(), headers: response.headers };
}

function headerNumber(headers, name, fallback) {
  const value = headers?.get?.(name) ?? headers?.[name];
  return Number(value) || fallback;
}

function mapPost(post) {
  const media = post._embedded?.['wp:featuredmedia']?.[0];
  const image = media?.media_details?.sizes?.medium_large?.source_url
    || media?.media_details?.sizes?.large?.source_url
    || media?.source_url || null;
  return {
    id: post.id,
    title: decodeEntities(post.title?.rendered),
    excerpt: decodeEntities(post.excerpt?.rendered),
    contentHtml: post.content?.rendered || '',
    date: post.date,
    link: post.link,
    image,
    imageOriginal: media?.source_url || image,
    imageThumbnail: media?.media_details?.sizes?.thumbnail?.source_url || image,
    author: post._embedded?.author?.[0]?.name || null,
  };
}

function mapResource(post) {
  const { contentHtml, ...resource } = mapPost(post);
  return {
    ...resource,
    kind: post.categories?.includes(UPDATES_CATEGORY_ID) ? 'updates' : 'articles',
  };
}

export async function getUpdates() {
  const { data } = await getJson('/posts', {
    categories: UPDATES_CATEGORY_ID, per_page: 20,
    _embed: POST_EMBED, _fields: LIST_FIELDS,
  });
  return data.map(mapPost);
}

export async function getArticles(page = 1, perPage = 20) {
  const { data, headers } = await getJson('/posts', {
    categories: ARTICLES_CATEGORY_ID, per_page: perPage, page,
    _embed: POST_EMBED, _fields: LIST_FIELDS,
  });
  return {
    articles: data.map(mapPost),
    totalPages: headerNumber(headers, 'x-wp-totalpages', 1),
  };
}

export async function getResources({ page = 1, perPage = 10, kind } = {}) {
  const safePage = Math.max(Number(page) || 1, 1);
  const safePerPage = Math.min(Math.max(Number(perPage) || 10, 1), 20);
  const category = kind === 'updates' ? UPDATES_CATEGORY_ID
    : kind === 'articles' ? ARTICLES_CATEGORY_ID
      : `${ARTICLES_CATEGORY_ID},${UPDATES_CATEGORY_ID}`;
  const { data, headers } = await getJson('/posts', {
    categories: category, per_page: safePerPage, page: safePage,
    _embed: POST_EMBED, _fields: LIST_FIELDS,
  });
  return {
    resources: data.map(mapResource),
    total: headerNumber(headers, 'x-wp-total', data.length),
    totalPages: headerNumber(headers, 'x-wp-totalpages', 1),
    page: safePage,
  };
}

export async function getArticleById(id) {
  const { data } = await getJson(`/posts/${encodeURIComponent(id)}`, {
    _embed: POST_EMBED,
    _fields: 'id,title,excerpt,content,date,link,_links,_embedded',
  });
  return mapPost(data);
}

export function getSiteMap() {
  return { categories: CATEGORIES, items: SITE_PAGES };
}

export async function getPageBySlug(slug) {
  if (!SITE_PAGES.some((page) => page.type === 'page' && page.slug === slug)) {
    throw new Error('Unknown page');
  }
  const { data } = await getJson('/pages', {
    slug, _fields: 'title,content,modified,link',
  });
  const page = data[0];
  if (!page) throw new Error('Page not found');
  return {
    title: decodeEntities(page.title?.rendered),
    contentHtml: normalizePageHtml(page.content?.rendered),
    modified: page.modified,
    link: page.link,
    slug,
  };
}
