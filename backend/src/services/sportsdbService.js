import { config } from "../config.js";
import { safeFetch } from "../utils/fetchWithTimeout.js";

/**
 * TheSportsDB Service
 * Fetches live scores and events from TheSportsDB API
 */
export class SportsDBService {
  constructor() {
    this.name = "TheSportsDB";
    this.timeout = config.timeout;
  }

  /**
   * Check if service is configured
   */
  isConfigured() {
    return !!config.apiKeys.theSportsDB;
  }

  /**
   * Fetch live scores for a specific sport
   * @param {string} sport - Sport name (e.g., "Soccer", "Basketball")
   */
  async getLiveScores(sport = "Soccer") {
    if (!this.isConfigured()) {
      return {
        available: false,
        error: "API key not configured",
      };
    }

    // Try live scores first
    const url = config.endpoints.theSportsDB.livescore(sport);
    const data = await safeFetch(url, {}, this.timeout);

    if (!data) {
      return {
        available: false,
        error: "Failed to fetch data",
      };
    }

    // If no live events, try today's events
    if (!data.events || data.events.length === 0) {
      const today = new Date().toISOString().split('T')[0];
      const eventsUrl = config.endpoints.theSportsDB.events(today);
      const eventsData = await safeFetch(eventsUrl, {}, this.timeout);
      
      if (eventsData && eventsData.events && eventsData.events.length > 0) {
        return {
          available: true,
          data: this.normalizeData(eventsData),
          rawCount: eventsData.events.length,
        };
      }

      // If still no events, get next Premier League events as fallback
      const premierLeagueId = "4328"; // English Premier League
      const leagueUrl = config.endpoints.theSportsDB.eventsByLeague(premierLeagueId);
      const leagueData = await safeFetch(leagueUrl, {}, this.timeout);
      
      if (leagueData && leagueData.events && leagueData.events.length > 0) {
        return {
          available: true,
          data: this.normalizeData(leagueData),
          rawCount: leagueData.events.length,
        };
      }
    }

    return {
      available: true,
      data: this.normalizeData(data),
      rawCount: data.events?.length || 0,
    };
  }

  /**
   * Fetch events for a specific date
   * @param {string} date - Date in YYYY-MM-DD format
   */
  async getEventsByDate(date) {
    if (!this.isConfigured()) {
      return {
        available: false,
        error: "API key not configured",
      };
    }

    const url = config.endpoints.theSportsDB.events(date);
    const data = await safeFetch(url, {}, this.timeout);

    if (!data) {
      return {
        available: false,
        error: "Failed to fetch data",
      };
    }

    return {
      available: true,
      data: this.normalizeData(data),
      rawCount: data.events?.length || 0,
    };
  }

  /**
   * Normalize TheSportsDB data to common format
   */
  normalizeData(rawData) {
    if (!rawData.events || rawData.events.length === 0) {
      return [];
    }

    return rawData.events
      .filter(event => event && event.idEvent) // Filter out null/invalid events
      .map((event) => ({
        id: event.idEvent,
        sport: event.strSport || "Soccer",
        league: event.strLeague || "Unknown League",
        homeTeam: event.strHomeTeam || "Home Team",
        awayTeam: event.strAwayTeam || "Away Team",
        homeScore: event.intHomeScore || 0,
        awayScore: event.intAwayScore || 0,
        status: event.strStatus || event.strProgress || "Scheduled",
        dateTime: event.dateEvent || new Date().toISOString().split('T')[0],
        time: event.strTime || event.strTimestamp || "TBD",
        source: this.name,
      }));
  }
}

