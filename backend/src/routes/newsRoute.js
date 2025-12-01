import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import { newsService } from "../services/newsService.js";

const router = Router();

/**
 * GET /api/news
 * Fetch news articles with filters
 *
 * Query params:
 * - sport: Sport filter (football, nba, mlb, tennis, esports, nfl, hockey, all)
 * - source: Source filter (ESPN, BBC Sport, Sky Sports, Bleacher Report)
 * - search: Search query for title/description
 * - limit: Maximum articles to return (1-100)
 */
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const {
      sport = "all",
      source = null,
      search = null,
      limit = "20",
    } = req.query;

    const limitNum = Math.min(Math.max(parseInt(limit) || 20, 1), 100);

    const result = await newsService.getNews({
      sport,
      source,
      search,
      limit: limitNum,
    });

    res.json({
      success: result.success,
      articles: result.articles,
      total: result.total,
      sport,
      source,
      search,
      timestamp: new Date().toISOString(),
      error: result.error || null,
    });
  })
);

/**
 * GET /api/news/sources
 * Get list of available news sources
 */
router.get(
  "/sources",
  asyncHandler(async (req, res) => {
    const sources = newsService.getSources();

    res.json({
      sources,
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * GET /api/news/sports
 * Get list of available sports
 */
router.get(
  "/sports",
  asyncHandler(async (req, res) => {
    const sports = newsService.getSports();

    res.json({
      sports,
      timestamp: new Date().toISOString(),
    });
  })
);

export default router;

