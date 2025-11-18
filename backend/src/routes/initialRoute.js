import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import { SportsDBService } from "../services/sportsdbService.js";
import { ApiSportsService } from "../services/apisportsService.js";
import { OddsService } from "../services/oddsService.js";

const router = Router();

// Initialize services
const sportsDBService = new SportsDBService();
const apiSportsService = new ApiSportsService();
const oddsService = new OddsService();

/**
 * GET /api/initial
 * Fetch initial data from all configured sources
 */
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const startTime = Date.now();

    // Parallel fetch from all sources
    const [sportsDBResult, apiSportsResult, oddsResult] = await Promise.all([
      fetchSportsDB(),
      fetchApiSports(),
      fetchOdds(),
    ]);

    const duration = Date.now() - startTime;

    // Build response
    const response = {
      timestamp: new Date().toISOString(),
      duration: `${duration}ms`,
      sources: [sportsDBResult, apiSportsResult, oddsResult],
      summary: {
        totalSources: 3,
        availableSources: [
          sportsDBResult,
          apiSportsResult,
          oddsResult,
        ].filter((s) => s.available).length,
        totalEvents: [sportsDBResult, apiSportsResult, oddsResult].reduce(
          (sum, s) => sum + (s.eventsCount || 0),
          0
        ),
      },
    };

    res.json(response);
  })
);

/**
 * GET /api/initial/source/:sourceName
 * Fetch data from a specific source
 */
router.get(
  "/source/:sourceName",
  asyncHandler(async (req, res) => {
    const { sourceName } = req.params;

    let result;

    switch (sourceName.toLowerCase()) {
      case "sportsdb":
        result = await fetchSportsDB();
        break;
      case "apisports":
        result = await fetchApiSports();
        break;
      case "odds":
        result = await fetchOdds();
        break;
      default:
        return res.status(404).json({
          error: {
            message: `Unknown source: ${sourceName}`,
            availableSources: ["sportsdb", "apisports", "odds"],
          },
        });
    }

    res.json({
      timestamp: new Date().toISOString(),
      source: result,
    });
  })
);

/**
 * Fetch data from TheSportsDB
 */
async function fetchSportsDB() {
  const startTime = Date.now();

  try {
    // Get live scores for Soccer
    const result = await sportsDBService.getLiveScores("Soccer");

    return {
      name: sportsDBService.name,
      available: result.available,
      configured: sportsDBService.isConfigured(),
      duration: `${Date.now() - startTime}ms`,
      eventsCount: result.data?.length || 0,
      rawCount: result.rawCount || 0,
      events: result.data || [],
      error: result.error || null,
    };
  } catch (error) {
    return {
      name: sportsDBService.name,
      available: false,
      configured: sportsDBService.isConfigured(),
      duration: `${Date.now() - startTime}ms`,
      eventsCount: 0,
      error: error.message,
    };
  }
}

/**
 * Fetch data from API-Sports
 */
async function fetchApiSports() {
  const startTime = Date.now();

  try {
    // Get live football fixtures
    const result = await apiSportsService.getLiveFixtures();

    return {
      name: apiSportsService.name,
      available: result.available,
      configured: apiSportsService.isConfigured(),
      duration: `${Date.now() - startTime}ms`,
      eventsCount: result.data?.length || 0,
      rawCount: result.rawCount || 0,
      requestsRemaining: result.requestsRemaining || null,
      events: result.data || [],
      error: result.error || null,
    };
  } catch (error) {
    return {
      name: apiSportsService.name,
      available: false,
      configured: apiSportsService.isConfigured(),
      duration: `${Date.now() - startTime}ms`,
      eventsCount: 0,
      error: error.message,
    };
  }
}

/**
 * Fetch data from The Odds API
 */
async function fetchOdds() {
  const startTime = Date.now();

  try {
    // Get odds for English Premier League
    const result = await oddsService.getOdds("soccer_epl");

    return {
      name: oddsService.name,
      available: result.available,
      configured: oddsService.isConfigured(),
      duration: `${Date.now() - startTime}ms`,
      eventsCount: result.data?.length || 0,
      rawCount: result.rawCount || 0,
      events: result.data || [],
      error: result.error || null,
    };
  } catch (error) {
    return {
      name: oddsService.name,
      available: false,
      configured: oddsService.isConfigured(),
      duration: `${Date.now() - startTime}ms`,
      eventsCount: 0,
      error: error.message,
    };
  }
}

export default router;

