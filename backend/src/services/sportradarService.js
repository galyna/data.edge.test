import { config } from "../config.js";
import { safeFetch } from "../utils/fetchWithTimeout.js";

/**
 * Sportradar API Service
 * Fetches betting odds and live data from Sportradar
 */
export class SportradarService {
  constructor() {
    this.name = "Sportradar";
    this.timeout = config.timeout;
    this.baseUrl = "https://api.sportradar.com";
    // Access level: 't' for trial, 'p' for production
    this.accessLevel = process.env.SPORTRADAR_ACCESS_LEVEL || "t";
    // Package type: 'us' for US markets, 'row' for Rest of World
    this.packageType = process.env.SPORTRADAR_PACKAGE_TYPE || "row";
  }

  /**
   * Check if service is configured
   */
  isConfigured() {
    const key = config.apiKeys.sportradar;
    return !!key && key !== "your_key_here" && key !== "your_sportradar_key_here";
  }

  /**
   * Check if API key is a placeholder
   */
  isPlaceholderKey() {
    const key = config.apiKeys.sportradar;
    return !key || key === "your_key_here" || key === "your_sportradar_key_here";
  }

  /**
   * Map sport names to Sportradar API format
   * For Soccer API we use 'soccer-t3' endpoint format
   */
  getSportEndpoint(sport) {
    const mapping = {
      soccer: "soccer-t3",
      football: "soccer-t3",
      basketball: "basketball-t3",
      baseball: "baseball-t3",
      ice_hockey: "icehockey-t3",
      tennis: "tennis-t3",
      mma: "mma-t3",
      esports: "esports-t3",
    };
    return mapping[sport] || "soccer-t3";
  }

  /**
   * Get region for sport API
   */
  getRegion(sport) {
    // Most sports use 'eu' region for Rest of World
    return this.packageType === 'us' ? 'us' : 'eu';
  }

  /**
   * Fetch markets (odds) for a specific event
   * @param {string} eventId - Event ID from schedule
   */
  async getMarkets(eventId) {
    if (!this.isConfigured()) {
      return null;
    }

    try {
      // Sportradar Markets endpoint
      // Note: Markets endpoint may not be available in Trial tier for all events
      // Format: https://api.sportradar.com/soccer-t3/{region}/en/sport_events/{event_id}/markets.json?api_key={api_key}
      const sportEndpoint = this.getSportEndpoint("soccer"); // Use soccer-t3 for now
      const region = this.getRegion("soccer");
      const url = `${this.baseUrl}/${sportEndpoint}/${region}/en/sport_events/${eventId}/markets.json?api_key=${config.apiKeys.sportradar}`;

      const data = await safeFetch(url, {}, this.timeout);
      
      // Handle 404 - markets may not be available for this event in trial tier
      if (!data || data.error || (data.status === 404)) {
        // Silently skip - markets not available for this event
        return null;
      }

      return data;
    } catch (error) {
      // Silently skip if markets unavailable (common in trial tier)
      if (error.message?.includes("404") || error.message?.includes("Invalid route")) {
        return null;
      }
      console.warn(`[Sportradar] Markets fetch error for ${eventId}:`, error.message);
      return null;
    }
  }

  /**
   * Fetch odds for a specific sport
   * @param {string} sport - Sport key (soccer, basketball, etc.)
   */
  async getOdds(sport = "soccer") {
    if (this.isPlaceholderKey()) {
      return {
        available: false,
        configured: false,
        error: "API key not configured. Please set SPORTRADAR_API_KEY in .env file",
      };
    }

    if (!this.isConfigured()) {
      return {
        available: false,
        configured: false,
        error: "API key not configured",
      };
    }

    try {
      // Sportradar Soccer API endpoint (Trial tier)
      // Format: https://api.sportradar.com/{sport}-t3/{region}/en/schedules/{date}/schedule.json?api_key={api_key}
      const sportEndpoint = this.getSportEndpoint(sport);
      const region = this.getRegion(sport);
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

      // Get daily schedule for the sport
      const url = `${this.baseUrl}/${sportEndpoint}/${region}/en/schedules/${today}/schedule.json?api_key=${config.apiKeys.sportradar}`;

      console.log(`[Sportradar] Fetching from: ${sportEndpoint}/${region} for ${today}`);
      const data = await safeFetch(url, {}, this.timeout);

      if (!data || data.error) {
        let errorMessage = "Failed to fetch odds from Sportradar";
        if (data?.error) {
          errorMessage = data.error;
        } else if (data?.message) {
          errorMessage = data.message;
        }

        return {
          available: false,
          error: errorMessage,
        };
      }

      // Step 2: Fetch markets for each event (limit to first 5 events to save quota)
      const events = data.sport_events || [];
      const limitedEvents = events.slice(0, 5);
      
      console.log(`[Sportradar] Fetching markets for ${limitedEvents.length} events (from ${events.length} total)`);
      
      // Fetch markets sequentially with delay to respect 1 QPS rate limit
      // Trial plan: 1 QPS = minimum 1 second between requests
      const eventsWithMarkets = [];
      for (let i = 0; i < limitedEvents.length; i++) {
        const event = limitedEvents[i];
        const markets = await this.getMarkets(event.id);
        eventsWithMarkets.push({ event, markets });
        
        // Wait 1 second between requests (except for last one)
        if (i < limitedEvents.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      return {
        available: true,
        data: this.normalizeData({ sport_events: eventsWithMarkets }, sport),
        rawCount: events.length,
      };
    } catch (error) {
      return {
        available: false,
        error: error.message || "Failed to fetch odds",
      };
    }
  }

  /**
   * Normalize Sportradar data to common format
   */
  normalizeData(rawData, sport) {
    // Sportradar schedule endpoint returns events array
    if (!rawData || !rawData.sport_events || !Array.isArray(rawData.sport_events)) {
      return [];
    }

    return rawData.sport_events.map((item) => {
      // Handle both formats: { event, markets } or direct event
      const event = item.event || item;
      const markets = item.markets;

      // Extract teams from competitors
      const competitors = event.competitors || [];
      const homeTeam = competitors.find((c) => c.qualifier === "home") || competitors[0] || {};
      const awayTeam = competitors.find((c) => c.qualifier === "away") || competitors[1] || {};

      const homeTeamName = homeTeam.name || homeTeam.abbreviation || "Home Team";
      const awayTeamName = awayTeam.name || awayTeam.abbreviation || "Away Team";

      // Extract bookmakers from markets
      const bookmakers = this.extractBookmakers(markets, homeTeamName, awayTeamName);

      return {
        id: event.id || `${this.name}-${Date.now()}-${Math.random()}`,
        sport: sport,
        sportTitle: event.sport_event?.sport?.name || sport,
        homeTeam: homeTeamName,
        awayTeam: awayTeamName,
        commenceTime: event.scheduled || event.start_time || new Date().toISOString(),
        bookmakers: bookmakers,
        bookmakerCount: bookmakers.length,
        source: this.name,
      };
    });
  }

  /**
   * Extract bookmakers from Sportradar markets data
   */
  extractBookmakers(marketsData, homeTeamName, awayTeamName) {
    if (!marketsData || !marketsData.markets) {
      return [];
    }

    const bookmakerMap = new Map();

    // Iterate through markets and group by bookmaker
    marketsData.markets.forEach((market) => {
      // Look for 3way (h2h equivalent) markets
      if (market.name === "3way" || market.name === "1x2") {
        market.books?.forEach((book) => {
          const bookmakerName = book.name || "Unknown";

          if (!bookmakerMap.has(bookmakerName)) {
            bookmakerMap.set(bookmakerName, {
              key: bookmakerName.toLowerCase().replace(/\s+/g, "_"),
              title: bookmakerName,
              name: bookmakerName,
              markets: [],
            });
          }

          const bookmaker = bookmakerMap.get(bookmakerName);

          // Extract outcomes
          const outcomes = [];
          book.outcomes?.forEach((outcome) => {
            // Map Sportradar outcome types to our format
            let name = "";
            if (outcome.type === "home" || outcome.name === "1") {
              name = homeTeamName;
            } else if (outcome.type === "away" || outcome.name === "2") {
              name = awayTeamName;
            } else if (outcome.type === "draw" || outcome.name === "X") {
              name = "Draw";
            }

            if (name && outcome.odds) {
              outcomes.push({
                name: name,
                price: outcome.odds,
              });
            }
          });

          if (outcomes.length > 0) {
            bookmaker.markets.push({
              key: "h2h",
              outcomes: outcomes,
            });
          }
        });
      }
    });

    return Array.from(bookmakerMap.values());
  }
}

