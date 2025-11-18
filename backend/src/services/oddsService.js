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
    return !!config.apiKeys.theOdds;
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
   */
  async getOdds(sport = "soccer_epl") {
    if (!this.isConfigured()) {
      return {
        available: false,
        error: "API key not configured",
      };
    }

    const url = config.endpoints.theOdds.odds(sport);
    const data = await safeFetch(url, {}, this.timeout);

    if (!data) {
      return {
        available: false,
        error: "Failed to fetch odds",
      };
    }

    return {
      available: true,
      data: this.normalizeData(data),
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

    return rawData.map((event) => ({
      id: event.id,
      sport: event.sport_key,
      sportTitle: event.sport_title,
      homeTeam: event.home_team,
      awayTeam: event.away_team,
      commenceTime: event.commence_time,
      bookmakers: event.bookmakers?.map((bookmaker) => ({
        name: bookmaker.key,
        title: bookmaker.title,
        markets: bookmaker.markets?.map((market) => ({
          key: market.key,
          outcomes: market.outcomes?.map((outcome) => ({
            name: outcome.name,
            price: outcome.price,
          })),
        })),
      })),
      bookmakerCount: event.bookmakers?.length || 0,
      source: this.name,
    }));
  }
}

