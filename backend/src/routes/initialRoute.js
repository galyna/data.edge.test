import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import { OddsService } from "../services/oddsService.js";
import { SportradarService } from "../services/sportradarService.js";
import { cache } from "../utils/cache.js";

const router = Router();

// Initialize services
const oddsService = new OddsService();
const sportradarService = new SportradarService();

// Cache TTL: 5 minutes for The Odds API (300,000 ms)
const CACHE_TTL = 5 * 60 * 1000;

// Cache TTL: 10 minutes for Sportradar (600,000 ms) - API is slower, data changes less often
const SPORTRADAR_CACHE_TTL = 10 * 60 * 1000;

/**
 * Map header sport IDs to API sport names
 * Uses universal IDs (soccer, basketball, etc.)
 */
const sportMapping = {
  // The Odds API sport keys
  odds: {
    // Soccer (Football)
    soccer: {
      default: "soccer_epl",
      all: [
        "soccer_epl", 
        "soccer_spain_la_liga", 
        "soccer_italy_serie_a", 
        "soccer_germany_bundesliga", 
        "soccer_france_ligue_one", 
        "soccer_uefa_champs_league"
      ],
      epl: "soccer_epl",
      laliga: "soccer_spain_la_liga",
      seriea: "soccer_italy_serie_a",
      bundesliga: "soccer_germany_bundesliga",
      ligue1: "soccer_france_ligue_one",
      ucl: "soccer_uefa_champs_league",
      mls: "soccer_usa_mls",
    },
    
    // American Football
    american_football: {
      default: "americanfootball_nfl",
      all: ["americanfootball_nfl", "americanfootball_ncaaf"],
      nfl: "americanfootball_nfl",
      ncaaf: "americanfootball_ncaaf",
    },

    // Basketball
    basketball: {
      default: "basketball_nba",
      all: ["basketball_nba", "basketball_euroleague", "basketball_ncaab"],
      nba: "basketball_nba",
      euroleague: "basketball_euroleague",
      ncaab: "basketball_ncaab",
    },

    // Baseball
    baseball: {
      default: "baseball_mlb",
      all: ["baseball_mlb", "baseball_npb"],
      mlb: "baseball_mlb",
      npb: "baseball_npb",
    },

    // Hockey
    ice_hockey: {
      default: "icehockey_nhl",
      all: ["icehockey_nhl"],
      nhl: "icehockey_nhl",
    },

    // Tennis
    tennis: {
      default: "tennis_atp",
      all: ["tennis_atp", "tennis_wta"],
      atp: "tennis_atp",
      wta: "tennis_wta",
    },

    // MMA / Fighting
    mma: {
      default: "mma_mixed_martial_arts",
      all: ["mma_mixed_martial_arts"],
      ufc: "mma_mixed_martial_arts",
    },
    
    // Esports - NOT SUPPORTED by The Odds API
    esports: {
      default: null, // Not supported
      all: [],
      notSupported: true,
    },
  },
};

/**
 * Markets configuration per sport
 * ⚠️ Только h2h для экономии квоты (каждый маркет считается отдельно)
 */
const marketsConfig = {
  soccer: "h2h",
  american_football: "h2h",
  basketball: "h2h",
  baseball: "h2h",
  ice_hockey: "h2h",
  tennis: "h2h",
  mma: "h2h",
  esports: "h2h",
};

/**
 * GET /api/initial?sport=mlb&league=nba&source=sem|bill
 * Fetch initial data from configured sources
 * @param {string} sport - Sport filter (soccer, basketball, etc.)
 * @param {string} league - Specific league filter (epl, nba, etc.) - optional
 * @param {string} source - Source filter: "sem" (The Odds API) or "bill" (Sportradar) - optional, defaults to "sem"
 */
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const startTime = Date.now();
    const selectedSport = req.query.sport || "soccer"; // Default to soccer
    const selectedLeague = req.query.league || "all";  // Default to all
    const selectedSource = req.query.source || "sem";   // Default to "sem" (The Odds API)

    let sourceResult;

    // Fetch from selected source
    if (selectedSource === "bill") {
      // Sportradar (Bill)
      sourceResult = await fetchSportradar(selectedSport, selectedLeague);
    } else {
      // The Odds API (Sem) - default
      sourceResult = await fetchOdds(selectedSport, selectedLeague);
    }

    const duration = Date.now() - startTime;

    // Build response
    const response = {
      timestamp: new Date().toISOString(),
      duration: `${duration}ms`,
      sport: selectedSport,
      league: selectedLeague,
      source: selectedSource,
      sources: [sourceResult],
      summary: {
        totalSources: 1,
        availableSources: sourceResult.available ? 1 : 0,
        totalEvents: sourceResult.eventsCount || 0,
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
      case "sem":
        result = await fetchOdds();
        break;
      case "sportradar":
      case "bill":
        result = await fetchSportradar();
        break;
      default:
        return res.status(404).json({
          error: {
            message: `Unknown source: ${sourceName}`,
            availableSources: ["odds", "sem", "sportradar", "bill"],
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
 * DELETE /api/initial/cache
 * Clear cache (useful for testing or force refresh)
 */
router.delete(
  "/cache",
  asyncHandler(async (req, res) => {
    const { sport } = req.query;

    if (sport) {
      // Clear specific sport cache
      cache.clear(`odds:${sport}`);
      res.json({
        message: `Cache cleared for sport: ${sport}`,
        timestamp: new Date().toISOString(),
      });
    } else {
      // Clear all cache
      cache.clear();
      res.json({
        message: "All cache cleared",
        timestamp: new Date().toISOString(),
      });
    }
  })
);

/**
 * GET /api/initial/cache/stats
 * Get cache statistics
 */
router.get(
  "/cache/stats",
  asyncHandler(async (req, res) => {
    const stats = cache.getStats();
    res.json({
      stats,
      ttl: `${CACHE_TTL / 1000}s`,
      timestamp: new Date().toISOString(),
    });
  })
);


/**
 * Fetch data from The Odds API with caching
 * @param {string} selectedSport - Sport ID (soccer, basketball, etc.)
 * @param {string} selectedLeague - League ID (epl, nba, all)
 */
async function fetchOdds(selectedSport = "soccer", selectedLeague = "all") {
  const startTime = Date.now();
  const cacheKey = `odds:${selectedSport}:${selectedLeague}`;

  try {
    // Check cache first
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      console.log(`[CACHE] Returning cached data for ${selectedSport}/${selectedLeague}`);
      return {
        ...cachedData,
        cached: true,
        duration: `${Date.now() - startTime}ms (cached)`,
      };
    }

    // Get sport config from mapping
    const sportConfig = sportMapping.odds[selectedSport];
    
    // If sport not supported, return empty result with clear message
    if (!sportConfig || sportConfig.notSupported) {
      return {
        name: oddsService.name,
        available: false,
        configured: oddsService.isConfigured(),
        duration: `${Date.now() - startTime}ms`,
        eventsCount: 0,
        rawCount: 0,
        events: [],
        error: `'${selectedSport}' is not supported by The Odds API`,
      };
    }

    // Determine keys to fetch
    let sportKeys = [];
    
    if (selectedLeague === "all") {
      // For "all", use first league from "all" array to save quota
      // (fetching all leagues would use too much API quota)
      if (sportConfig.all?.length > 0) {
        sportKeys = [sportConfig.all[0]];
      } else if (sportConfig.default) {
        sportKeys = [sportConfig.default];
      } else {
        return {
          name: oddsService.name,
          available: false,
          configured: oddsService.isConfigured(),
          duration: `${Date.now() - startTime}ms`,
          eventsCount: 0,
          rawCount: 0,
          events: [],
          error: `No leagues configured for '${selectedSport}'`,
        };
      }
    } else {
      // Use specific league key
      const leagueKey = sportConfig[selectedLeague];
      if (leagueKey) {
        sportKeys = [leagueKey];
        console.log(`[SEM] Using specific league: ${selectedLeague} -> ${leagueKey}`);
      } else {
        // Fallback to default if league not found
        console.log(`[SEM] League '${selectedLeague}' not found, using default: ${sportConfig.default}`);
        sportKeys = [sportConfig.default];
      }
    }

    const markets = marketsConfig[selectedSport] || "h2h";

    // Handle both single sport and multiple sports
    const keysArray = Array.isArray(sportKeys) ? sportKeys : [sportKeys];
    
    console.log(`[API CALL] Fetching ${selectedSport}/${selectedLeague} keys:[${keysArray.join(",")}]`);
    
    // Fetch all sports in parallel
    const results = await Promise.all(
      keysArray.map(async (sportKey) => {
        try {
          return await oddsService.getOdds(sportKey, markets);
        } catch (err) {
          console.error(`Error fetching ${sportKey}:`, err);
          return { available: false, data: [], error: err.message };
        }
      })
    );

    // Merge all results
    const allEvents = [];
    let totalRawCount = 0;
    let hasAvailable = false;
    const errors = [];

    results.forEach((result) => {
      if (result.available && result.data) {
        hasAvailable = true;
        allEvents.push(...result.data);
        totalRawCount += result.rawCount || 0;
      }
      if (result.error) {
        errors.push(result.error);
      }
    });

    // Limit to 5 events to save quota
    const limitedEvents = allEvents.slice(0, 5);
    console.log(`[LIMIT] Reduced from ${allEvents.length} to ${limitedEvents.length} events`);

    const result = {
      name: oddsService.name,
      available: hasAvailable,
      configured: oddsService.isConfigured(),
      duration: `${Date.now() - startTime}ms`,
      eventsCount: limitedEvents.length,
      rawCount: totalRawCount,
      events: limitedEvents,
      error: errors.length > 0 ? errors.join("; ") : null,
      leagues: keysArray.length,
      cached: false,
    };

    // Cache successful results
    if (hasAvailable) {
      cache.set(cacheKey, result, CACHE_TTL);
    }

    return result;
  } catch (error) {
    return {
      name: oddsService.name,
      available: false,
      configured: oddsService.isConfigured(),
      duration: `${Date.now() - startTime}ms`,
      eventsCount: 0,
      error: error.message,
      cached: false,
    };
  }
}

/**
 * Fetch data from Sportradar API with caching
 * @param {string} selectedSport - Sport ID (soccer, basketball, etc.)
 * @param {string} selectedLeague - League ID (epl, nba, all) - not used for Sportradar yet
 */
async function fetchSportradar(selectedSport = "soccer", selectedLeague = "all") {
  const startTime = Date.now();
  const cacheKey = `sportradar:${selectedSport}:${selectedLeague}`;

  try {
    // Check cache first
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      console.log(`[CACHE] Returning cached data for Sportradar ${selectedSport}/${selectedLeague}`);
      return {
        ...cachedData,
        cached: true,
        duration: `${Date.now() - startTime}ms (cached)`,
      };
    }

    // Fetch from Sportradar (with league filter)
    const result = await sportradarService.getOdds(selectedSport, selectedLeague);

    if (!result.available) {
      return {
        name: sportradarService.name,
        available: false,
        configured: sportradarService.isConfigured(),
        duration: `${Date.now() - startTime}ms`,
        eventsCount: 0,
        rawCount: 0,
        events: [],
        error: result.error || "Failed to fetch from Sportradar",
        cached: false,
      };
    }

    // Limit to 5 events to save quota
    const limitedEvents = result.data.slice(0, 5);
    console.log(`[LIMIT] Reduced from ${result.data.length} to ${limitedEvents.length} events`);

    const response = {
      name: sportradarService.name,
      available: true,
      configured: sportradarService.isConfigured(),
      duration: `${Date.now() - startTime}ms`,
      eventsCount: limitedEvents.length,
      rawCount: result.rawCount || 0,
      events: limitedEvents,
      error: null,
      cached: false,
      // Additional metadata to verify source
      apiSource: result.apiSource || "Sportradar Odds Comparison API",
      generatedAt: result.generatedAt || new Date().toISOString(),
    };

    // Cache successful results (longer TTL for Sportradar - API is slow)
    cache.set(cacheKey, response, SPORTRADAR_CACHE_TTL);
    console.log(`[CACHE SET] ${cacheKey} (TTL: ${SPORTRADAR_CACHE_TTL / 1000}s)`);

    return response;
  } catch (error) {
    return {
      name: sportradarService.name,
      available: false,
      configured: sportradarService.isConfigured(),
      duration: `${Date.now() - startTime}ms`,
      eventsCount: 0,
      error: error.message,
      cached: false,
    };
  }
}

export default router;

