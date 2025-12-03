import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import { newsService } from "../services/newsService.js";

const router = Router();

/**
 * GET /api/news
 * Fetch news articles with filters and pagination
 *
 * Query params:
 * - sport: Sport filter (football, nba, mlb, tennis, esports, nfl, hockey, all)
 * - source: Source filter (ESPN, BBC Sport, Sky Sports, Bleacher Report)
 * - search: Search query for title/description
 * - page: Page number (1-based, default: 1)
 * - limit: Articles per page (1-50, default: 10)
 */
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const {
      sport = "all",
      source = null,
      search = null,
      page = "1",
      limit = "10",
    } = req.query;

    const pageNum = Math.max(parseInt(page) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit) || 10, 1), 50);

    const result = await newsService.getNews({
      sport,
      source,
      search,
      page: pageNum,
      limit: limitNum,
    });

    res.json({
      success: result.success,
      articles: result.articles,
      total: result.total,
      totalPages: result.totalPages,
      page: pageNum,
      limit: limitNum,
      hasMore: result.hasMore,
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
 * 
 * Query params:
 * - sport: Filter sources by sport (optional, default: all)
 */
router.get(
  "/sources",
  asyncHandler(async (req, res) => {
    const { sport = null } = req.query;
    const sources = newsService.getSources(sport);

    res.json({
      sources,
      sport: sport || "all",
      total: sources.length,
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * GET /api/news/sources-by-sport
 * Get all sources grouped by sport
 */
router.get(
  "/sources-by-sport",
  asyncHandler(async (req, res) => {
    const sourcesBySport = newsService.getSourcesBySport();

    res.json({
      sourcesBySport,
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * GET /api/news/sports
 * Get list of available sports with source info
 */
router.get(
  "/sports",
  asyncHandler(async (req, res) => {
    const sports = newsService.getSports();

    res.json({
      sports,
      total: sports.length,
      timestamp: new Date().toISOString(),
    });
  })
);

export default router;

