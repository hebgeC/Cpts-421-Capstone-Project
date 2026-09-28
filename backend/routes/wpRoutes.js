import express from "express";
import {
  fetchUpdates,
  fetchArticles,
  fetchArticleById,
  fetchSiteMap,
  fetchPageBySlug,
} from "../controllers/wpController.js";

const router = express.Router();

router.get("/wpUpdates", fetchUpdates);
router.get("/wpArticles", fetchArticles);
router.get("/wpArticles/:id", fetchArticleById);
router.get("/siteMap", fetchSiteMap);
router.get("/wpPage/:slug", fetchPageBySlug);

export default router;
