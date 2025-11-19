import { config } from "../config.js";
import { safeFetch } from "../utils/fetchWithTimeout.js";

/**
 * The Odds API Service
 * Fetches betting odds from multiple bookmakers
 */
export class OddsService {
  constructor() {
    this.name = "TheOddsAPI";
    this.timeout = config.timeout;
  }

  /**
   * Check if service is configured
   */
  isConfigured() {
    const key = config.apiKeys.theOdds;
    return !!key && key !== "your_key_here" && key !== "your_theodds_key_here";
  }

  /**
   * Check if API key is a placeholder
   */
  isPlaceholderKey() {
    const key = config.apiKeys.theOdds;
    return !key || key === "your_key_here" || key === "your_theodds_key_here";
  }

  /**
   * Fetch available sports
   */
  async getSports() {
    if (!this.isConfigured()) {
      return {
        available: false,
        error: "API key not configured",
      };
    }

    const url = `${config.endpoints.theOdds.sports}?apiKey=${config.apiKeys.theOdds}`;
    const data = await safeFetch(url, {}, this.timeout);

    if (!data) {
      return {
        available: false,
        error: "Failed to fetch sports list",
      };
    }

    return {
      available: true,
      data: data,
      count: data?.length || 0,
    };
  }

  /**
   * Fetch odds for a specific sport
   * @param {string} sport - Sport key (e.g., "soccer_epl", "basketball_nba")
   * @param {string} markets - Markets to fetch (default: "h2h,spreads,totals")
   */
  async getOdds(sport = "soccer_epl", markets = "h2h,spreads,totals") {
    if (this.isPlaceholderKey()) {
      return {
        available: false,
        configured: false,
        error: "API key not configured. Please set THEODDS_API_KEY in .env file",
      };
    }

    if (!this.isConfigured()) {
      return {
        available: false,
        configured: false,
        error: "API key not configured",
      };
    }

    const url = config.endpoints.theOdds.odds(sport, markets);
    const data = await safeFetch(url, {}, this.timeout);

    if (!data || data.error) {
      let errorMessage = "Failed to fetch odds";
      if (data?.error === "HTTP_ERROR") {
        if (data.status === 401) {
          errorMessage = "Unauthorized. Please check your The Odds API key.";
        } else if (data.status === 500) {
          errorMessage = "The Odds API server error (500). The service may be temporarily unavailable.";
        } else {
          errorMessage = data.message || `HTTP ${data.status} error`;
        }
      } else if (data?.message) {
        errorMessage = data.message;
      }

      return {
        available: false,
        error: errorMessage,
        rateLimit: data?.error === "RATE_LIMIT_EXCEEDED",
        retryAfter: data?.retryAfter,
      };
    }

    return {
      available: true,
      data: this.normalizeData(data),
      rawCount: Array.isArray(data) ? data.length : 0,
    };
  }

  /**
   * Fetch scores for a specific sport
   * @param {string} sport - Sport key
   */
  async getScores(sport = "soccer_epl") {
    if (!this.isConfigured()) {
      return {
        available: false,
        configured: false,
        error: "API key not configured",
      };
    }

    const url = config.endpoints.theOdds.scores(sport);
    const data = await safeFetch(url, {}, this.timeout);

    if (!data || data.error) {
      return {
        available: false,
        error: data?.message || "Failed to fetch scores",
      };
    }

    return {
      available: true,
      data: this.normalizeScores(data),
      rawCount: Array.isArray(data) ? data.length : 0,
    };
  }

  /**
   * Normalize Odds API data to common format
   */
  normalizeData(rawData) {
    if (!Array.isArray(rawData)) {
      return [];
    }

    return rawData.map((event) => {
      // Limit to 10 bookmakers per event
      const limitedBookmakers = event.bookmakers?.slice(0, 10) || [];
      
      return {
        id: event.id,
        sport: event.sport_key,
        sportTitle: event.sport_title,
        homeTeam: event.home_team,
        awayTeam: event.away_team,
        commenceTime: event.commence_time,
        bookmakers: limitedBookmakers.map((bookmaker) => ({
          name: bookmaker.key,
          title: bookmaker.title,
          lastUpdate: bookmaker.last_update,
          markets: bookmaker.markets?.map((market) => ({
            key: market.key,
            lastUpdate: market.last_update,
            outcomes: market.outcomes?.map((outcome) => ({
              name: outcome.name,
              price: outcome.price,
              point: outcome.point, // For spreads and totals
            })),
          })),
        })),
        bookmakerCount: limitedBookmakers.length,
        source: this.name,
      };
    });
  }

  /**
   * Normalize Scores API data
   */
  normalizeScores(rawData) {
    if (!Array.isArray(rawData)) {
      return [];
    }

    return rawData.map((event) => ({
      id: event.id,
      sport: event.sport_key,
      sportTitle: event.sport_title,
      homeTeam: event.home_team,
      awayTeam: event.away_team,
      commenceTime: event.commence_time,
      completed: event.completed,
      scores: event.scores,
      lastUpdate: event.last_update,
      source: this.name,
    }));
  }
}

