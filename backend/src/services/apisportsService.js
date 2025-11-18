import { config } from "../config.js";
import { safeFetch } from "../utils/fetchWithTimeout.js";

/**
 * API-Sports Service
 * Fetches football data from API-Sports
 */
export class ApiSportsService {
  constructor() {
    this.name = "API-Sports";
    this.timeout = config.timeout;
  }

  /**
   * Check if service is configured
   */
  isConfigured() {
    return !!config.apiKeys.apiSports;
  }

  /**
   * Fetch live football fixtures
   */
  async getLiveFixtures() {
    if (!this.isConfigured()) {
      return {
        available: false,
        error: "API key not configured",
      };
    }

    const url = config.endpoints.apiSports.liveFixtures;
    const data = await safeFetch(
      url,
      {
        headers: {
          "x-apisports-key": config.apiKeys.apiSports,
        },
      },
      this.timeout
    );

    if (!data) {
      return {
        available: false,
        error: "Failed to fetch data",
      };
    }

    return {
      available: true,
      data: this.normalizeData(data),
      rawCount: data.response?.length || 0,
      requestsRemaining: data.rateLimit?.remaining || null,
    };
  }

  /**
   * Fetch fixtures by date
   * @param {string} date - Date in YYYY-MM-DD format
   */
  async getFixturesByDate(date) {
    if (!this.isConfigured()) {
      return {
        available: false,
        error: "API key not configured",
      };
    }

    const url = config.endpoints.apiSports.fixturesByDate(date);
    const data = await safeFetch(
      url,
      {
        headers: {
          "x-apisports-key": config.apiKeys.apiSports,
        },
      },
      this.timeout
    );

    if (!data) {
      return {
        available: false,
        error: "Failed to fetch data",
      };
    }

    return {
      available: true,
      data: this.normalizeData(data),
      rawCount: data.response?.length || 0,
    };
  }

  /**
   * Normalize API-Sports data to common format
   */
  normalizeData(rawData) {
    if (!rawData.response) {
      return [];
    }

    return rawData.response.map((fixture) => ({
      id: fixture.fixture.id,
      sport: "Football",
      league: fixture.league.name,
      leagueCountry: fixture.league.country,
      homeTeam: fixture.teams.home.name,
      awayTeam: fixture.teams.away.name,
      homeScore: fixture.goals.home,
      awayScore: fixture.goals.away,
      status: fixture.fixture.status.short,
      statusLong: fixture.fixture.status.long,
      dateTime: fixture.fixture.date,
      venue: fixture.fixture.venue?.name,
      source: this.name,
    }));
  }
}

