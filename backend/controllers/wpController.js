import axios from "axios";
import { decodeEntities } from "../utils/textUtils.js";
import { CATEGORIES, SITE_PAGES } from "../config/siteMap.js";

const WP_BASE = "https://www.trm.org/wp-json/wp/v2";

const UPDATES_CATEGORY_ID = 14; // "updates"
const ARTICLES_CATEGORY_ID = 1; // "client-stories"

function getFeaturedImage(post) {
  const media = post._embedded?.["wp:featuredmedia"]?.[0];
  return media?.source_url || null;
}

function getAuthorName(post) {
  const author = post._embedded?.author?.[0];
  return author?.name || null;
}

function mapPost(post) {
  return {
    id: post.id,
    title: decodeEntities(post.title?.rendered),
    excerpt: decodeEntities(post.excerpt?.rendered),
    contentHtml: post.content?.rendered || "",
    date: post.date,
    link: post.link,
    image: getFeaturedImage(post),
    author: getAuthorName(post),
  };
}

const fetchUpdates = async (req, res) => {
  try {
    const response = await axios.get(`${WP_BASE}/posts`, {
      params: { categories: UPDATES_CATEGORY_ID, per_page: 20, _embed: true },
    });
    res.json(response.data.map(mapPost));
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch updates" });
  }
};

const fetchArticles = async (req, res) => {
  const page = Number(req.query.page) || 1;
  try {
    const response = await axios.get(`${WP_BASE}/posts`, {
      params: { categories: ARTICLES_CATEGORY_ID, per_page: 20, page, _embed: true },
    });
    res.json({
      articles: response.data.map(mapPost),
      totalPages: Number(response.headers["x-wp-totalpages"]) || 1,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch articles" });
  }
};

const fetchArticleById = async (req, res) => {
  try {
    const response = await axios.get(`${WP_BASE}/posts/${req.params.id}`, {
      params: { _embed: true },
    });
    res.json(mapPost(response.data));
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch article" });
  }
};

const fetchSiteMap = (req, res) => {
  res.json({ categories: CATEGORIES, items: SITE_PAGES });
};

const fetchPageBySlug = async (req, res) => {
  const { slug } = req.params;
  const known = SITE_PAGES.some((p) => p.type === "page" && p.slug === slug);
  if (!known) {
    return res.status(404).json({ error: "Unknown page" });
  }

  try {
    const response = await axios.get(`${WP_BASE}/pages`, {
      params: { slug, _embed: true },
    });
    const page = response.data[0];
    if (!page) {
      return res.status(404).json({ error: "Page not found on trm.org" });
    }
    res.json({
      title: decodeEntities(page.title?.rendered),
      contentHtml: page.content?.rendered || "",
      modified: page.modified,
      link: page.link,
      slug,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch page" });
  }
};

export { fetchUpdates, fetchArticles, fetchArticleById, fetchSiteMap, fetchPageBySlug };
