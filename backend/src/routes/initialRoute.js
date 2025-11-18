import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import { OddsService } from "../services/oddsService.js";

const router = Router();

// Initialize services
const oddsService = new OddsService();

/**
 * Map header sport IDs to API sport names
 * Header IDs: football, nba, mlb, nhl, tennis, esports
 */
const sportMapping = {
  // The Odds API sport keys
  // For football, use general soccer key to get all European leagues
  odds: {
    football: "soccer", // General soccer (includes all European leagues: EPL, La Liga, Serie A, Bundesliga, etc.)
    nba: "basketball_nba",
    mlb: "baseball_mlb",
    nhl: "icehockey_nhl",
    tennis: "tennis_atp",
    esports: null, // Not supported by The Odds API
  },
};

/**
 * GET /api/initial?sport=mlb
 * Fetch initial data from all configured sources
 * @param {string} sport - Sport filter (football, nba, mlb, nhl, tennis, esports)
 */
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const startTime = Date.now();
    const selectedSport = req.query.sport || "football"; // Default to football

    // Fetch from The Odds API
    const oddsResult = await fetchOdds(selectedSport);

    const duration = Date.now() - startTime;

    // Build response
    const response = {
      timestamp: new Date().toISOString(),
      duration: `${duration}ms`,
      sport: selectedSport,
      sources: [oddsResult],
      summary: {
        totalSources: 1,
        availableSources: oddsResult.available ? 1 : 0,
        totalEvents: oddsResult.eventsCount || 0,
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
      case "odds":
        result = await fetchOdds();
        break;
      default:
        return res.status(404).json({
          error: {
            message: `Unknown source: ${sourceName}`,
            availableSources: ["odds"],
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
 * Fetch data from The Odds API
 * @param {string} selectedSport - Sport ID from header (football, nba, mlb, etc.)
 */
async function fetchOdds(selectedSport = "football") {
  const startTime = Date.now();

  try {
    // Map header sport to The Odds API sport key
    const sportKey = sportMapping.odds[selectedSport];
    
    // If sport not supported, return empty result
    if (!sportKey) {
      return {
        name: oddsService.name,
        available: false,
        configured: oddsService.isConfigured(),
        duration: `${Date.now() - startTime}ms`,
        eventsCount: 0,
        rawCount: 0,
        events: [],
        error: `Sport '${selectedSport}' not supported by The Odds API`,
      };
    }

    const result = await oddsService.getOdds(sportKey);

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

