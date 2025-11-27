import { config } from "../config.js";
import { safeFetch } from "../utils/fetchWithTimeout.js";

/**
 * Sportradar Odds Comparison API Service
 * Uses the Odds Comparison Regular API for getting odds from 100+ bookmakers
 * 
 * API Format:
 * - Base URL: https://api.sportradar.com/oddscomparison-{package_type}{access_level}1/{language_code}/{odds_format}/
 * - Authentication: Header x-api-key (NOT query parameter)
 * - Sports: sr:sport:1 (Soccer), sr:sport:2 (Basketball), etc.
 */
export class SportradarService {
  constructor() {
    this.name = "Sportradar";
    // Timeout for Sportradar API (15s - API can be slow)
    this.timeout = 15000;
    // Access level: 't' for trial, 'p' for production
    this.accessLevel = process.env.SPORTRADAR_ACCESS_LEVEL || "t";
    // Package type: 'us' for US markets, 'row' for Rest of World
    this.packageType = process.env.SPORTRADAR_PACKAGE_TYPE || "row";
    // Odds format: 'eu' for European (decimal), 'us' for American
    this.oddsFormat = "eu";
    
    // Build base URL for Odds Comparison API
    // Format: oddscomparison-{package_type}{access_level}1
    this.baseUrl = `https://api.sportradar.com/oddscomparison-${this.packageType}${this.accessLevel}1/en/${this.oddsFormat}`;
    
    // Sport ID mapping for Sportradar
    this.sportIds = {
      soccer: "sr:sport:1",
      football: "sr:sport:1",
      basketball: "sr:sport:2",
      baseball: "sr:sport:3",
      ice_hockey: "sr:sport:4",
      tennis: "sr:sport:5",
      american_football: "sr:sport:16",
      mma: "sr:sport:117",
    };
    
    // League/Tournament mappings for all sports
    // nameExact: true = exact match required
    // name: partial match (contains)
    // category: matches by country/region
    this.leagueMappings = {
      // ========== SOCCER ==========
      soccer: {
        // UEFA Competitions
        ucl: { name: "UEFA Champions League", nameExact: true },
        uel: { name: "UEFA Europa League", nameExact: true },
        uecl: { name: "UEFA Conference League", nameExact: true },
        // Top 5 Leagues
        epl: { name: "Premier League", category: "England", nameExact: true },
        laliga: { name: "LaLiga", nameExact: true },
        seriea: { name: "Serie A", category: "Italy", nameExact: true },
        bundesliga: { name: "Bundesliga", category: "Germany" },
        ligue1: { name: "Ligue 1", nameExact: true },
        // Americas
        mls: { name: "Major League Soccer", nameExact: true },
        ligamx: { name: "Liga MX", nameExact: true },
        brasileirao: { name: "Brasileiro", category: "Brazil" },
        argentina: { name: "Primera", category: "Argentina" },
        // Other
        eredivisie: { name: "Eredivisie", nameExact: true },
        portugal: { name: "Primeira Liga", nameExact: true },
        all: null,
      },
      
      // ========== BASKETBALL ==========
      basketball: {
        nba: { name: "NBA" },  // Partial match
        euroleague: { name: "Euroleague" },
        ncaab: { name: "NCAA" },  // Partial match for NCAA tournaments
        all: null,
      },
      
      // ========== AMERICAN FOOTBALL ==========
      american_football: {
        nfl: { name: "NFL" },  // Partial match
        ncaaf: { name: "NCAA" },  // Partial match
        all: null,
      },
      
      // ========== BASEBALL ==========
      baseball: {
        mlb: { name: "MLB" },  // Partial match
        npb: { category: "Japan" },  // Filter by Japan category
        all: null,
      },
      
      // ========== ICE HOCKEY ==========
      ice_hockey: {
        nhl: { name: "NHL" },  // Partial match
        khl: { name: "KHL" },
        all: null,
      },
      
      // ========== TENNIS ==========
      tennis: {
        atp: { name: "ATP" },  // Partial match for "ATP Tour", "ATP Challenger", etc.
        wta: { name: "WTA" },  // Partial match for "WTA Tour", etc.
        all: null,
      },
      
      // ========== MMA ==========
      mma: {
        ufc: { name: "UFC", nameExact: true },
        all: null,
      },
      
      // ========== ESPORTS ========== (NOT SUPPORTED)
      esports: {
        notSupported: true,
        all: null,
      },
    };
  }

  /**
   * Get league filter for a sport
   */
  getLeagueFilter(sport, league) {
    const sportMappings = this.leagueMappings[sport];
    if (!sportMappings) return null;
    return sportMappings[league] || null;
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
   * Make authenticated request to Sportradar Odds Comparison API
   * Uses x-api-key header for authentication
   */
  async fetchWithAuth(endpoint) {
    const url = `${this.baseUrl}${endpoint}`;
    
    console.log(`[Sportradar OC] Fetching: ${url}`);
    
    try {
      // Use safeFetch with custom headers
      const data = await safeFetch(url, {
        method: "GET",
        headers: {
          "x-api-key": config.apiKeys.sportradar,
          "Accept": "application/json",
        },
      }, this.timeout);

      // Check for errors from safeFetch
      if (data && data.error) {
        console.error(`[Sportradar OC] Error: ${data.message || data.error}`);
        return { error: true, message: data.message || data.error };
      }

      return data;
    } catch (error) {
      console.error(`[Sportradar OC] Fetch error:`, error.message);
      return { error: true, message: error.message };
    }
  }

  /**
   * Get list of available sports
   */
  async getSports() {
    if (!this.isConfigured()) {
      return { available: false, error: "API key not configured" };
    }

    const data = await this.fetchWithAuth("/sports.json");
    
    if (data.error) {
      return { available: false, error: data.message };
    }

    return {
      available: true,
      data: data.sports || [],
      count: data.sports?.length || 0,
    };
  }

  /**
   * Fetch odds for a specific sport using Daily Sport Schedule endpoint
   * Returns events with odds from multiple bookmakers
   * 
   * @param {string} sport - Sport key (soccer, basketball, etc.)
   * @param {string} league - League filter (ucl, uel, epl, laliga, etc.) - default "all"
   */
  async getOdds(sport = "soccer", league = "all") {
    if (this.isPlaceholderKey()) {
      return {
        available: false,
        configured: false,
        error: "Sportradar API key not configured. Please set SPORTRADAR_API_KEY in .env file",
      };
    }

    if (!this.isConfigured()) {
      return {
        available: false,
        configured: false,
        error: "Sportradar API key not configured",
      };
    }

    // Check if sport is supported
    const sportMappings = this.leagueMappings[sport];
    if (sportMappings?.notSupported || !this.sportIds[sport]) {
      return {
        available: false,
        configured: true,
        eventsCount: 0,
        rawCount: 0,
        events: [],
        error: `'${sport}' is not supported by Sportradar Odds Comparison API`,
      };
    }

    // Get league filter config for any sport
    const leagueFilter = this.getLeagueFilter(sport, league);
    
    console.log(`[Sportradar OC] Sport: ${sport}, League filter: ${league} -> ${leagueFilter ? JSON.stringify(leagueFilter) : 'ALL'}`);

    try {
      // Get sport ID
      const sportId = this.sportIds[sport];
      
      // Fetch upcoming 2 days (balance between coverage and speed)
      // Note: Sportradar trial has 1 QPS limit, so each day adds ~10s
      const dates = [];
      for (let i = 0; i < 2; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        dates.push(date.toISOString().split('T')[0]);
      }
      
      console.log(`[Sportradar OC] Fetching ${sport} schedule for: ${dates.join(', ')}`);
      
      // Fetch all days sequentially (Sportradar trial: 1 QPS limit)
      const allEvents = [];
      let generatedAt = null;
      let successCount = 0;
      
      for (let i = 0; i < dates.length; i++) {
        const dateStr = dates[i];
        
        try {
          const data = await this.fetchWithAuth(`/sports/${sportId}/${dateStr}/schedule.json`);
          
          if (!data.error && data.sport_events) {
            allEvents.push(...data.sport_events);
            if (!generatedAt) generatedAt = data.generated_at;
            successCount++;
            console.log(`[Sportradar OC] ✅ ${dateStr}: ${data.sport_events.length} events`);
          }
        } catch (err) {
          console.log(`[Sportradar OC] ⚠️ ${dateStr}: Failed - ${err.message}`);
        }
        
        // Delay between requests to respect rate limit (1.5s to be safe)
        if (i < dates.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      }
      
      console.log(`[Sportradar OC] Fetched ${successCount}/${dates.length} days successfully`);
      
      if (allEvents.length === 0) {
        return {
          available: false,
          error: "No upcoming events found",
        };
      }
      
      // Deduplicate events by ID
      const uniqueEventsMap = new Map();
      allEvents.forEach(event => {
        if (event.id && !uniqueEventsMap.has(event.id)) {
          uniqueEventsMap.set(event.id, event);
        }
      });
      const uniqueEvents = Array.from(uniqueEventsMap.values());
      
      console.log(`[Sportradar OC] Fetched ${allEvents.length} -> Unique: ${uniqueEvents.length} upcoming events`);
      
      // Create combined data object
      const combinedData = {
        sport_events: uniqueEvents,
        generated_at: generatedAt,
      };

      return this.processScheduleData(combinedData, sport, leagueFilter);
    } catch (error) {
      console.error(`[Sportradar OC] Error:`, error.message);
      return {
        available: false,
        error: error.message || "Failed to fetch odds",
      };
    }
  }

  /**
   * Process schedule data and normalize to our format
   * @param {Object} data - Raw API response
   * @param {string} sport - Sport key
   * @param {Object|null} leagueFilter - League filter config { name?, category? }
   */
  processScheduleData(data, sport, leagueFilter = null) {
    const allEvents = data.sport_events || [];
    const totalRawCount = allEvents.length; // Count BEFORE filtering
    let events = allEvents;
    
    // Apply league filter if specified
    if (leagueFilter) {
      const originalCount = events.length;
      events = events.filter(event => {
        const tournament = event.tournament || {};
        const category = tournament.category || {};
        const tournamentName = tournament.name || "";
        const categoryName = category.name || "";
        
        // Check name match
        let nameMatches = true; // Default true if no name filter
        if (leagueFilter.name) {
          if (leagueFilter.nameExact) {
            nameMatches = tournamentName.toLowerCase() === leagueFilter.name.toLowerCase();
          } else {
            nameMatches = tournamentName.toLowerCase().includes(leagueFilter.name.toLowerCase());
          }
        }
        
        // Check category match
        let categoryMatches = true; // Default true if no category filter
        if (leagueFilter.category) {
          categoryMatches = categoryName.toLowerCase() === leagueFilter.category.toLowerCase();
        }
        
        // BOTH conditions must be true (AND logic)
        // If only name specified -> nameMatches must be true
        // If only category specified -> categoryMatches must be true  
        // If both specified -> both must be true
        return nameMatches && categoryMatches;
      });
      
      console.log(`[Sportradar OC] Filtered ${originalCount} -> ${events.length} events for: ${JSON.stringify(leagueFilter)}`);
    }
    
    if (events.length === 0) {
      return {
        available: true,
        data: [],
        rawCount: totalRawCount,
        filteredCount: 0,
        message: leagueFilter 
          ? `No events found for selected league (${leagueFilter.name || leagueFilter.category}). Total events today: ${totalRawCount}` 
          : "No events with odds available for this date",
      };
    }

    // Limit to 5 events to save quota and match Sem behavior
    const limitedEvents = events.slice(0, 5);
    
    // Detailed logging to verify Sportradar source
    console.log(`\n${"=".repeat(60)}`);
    console.log(`[SPORTRADAR ODDS COMPARISON API] Data received!`);
    console.log(`${"=".repeat(60)}`);
    console.log(`📊 Sport: ${data.sport?.name || sport}`);
    console.log(`📅 Generated at: ${data.generated_at}`);
    console.log(`🏆 League filter: ${leagueFilter ? JSON.stringify(leagueFilter) : 'ALL'}`);
    console.log(`📋 Total events (after filter): ${events.length}`);
    console.log(`📋 Returning: ${limitedEvents.length} events`);
    console.log(`\n📌 Sample events:`);
    limitedEvents.slice(0, 3).forEach((event, i) => {
      const home = event.competitors?.find(c => c.qualifier === 'home')?.name || 'N/A';
      const away = event.competitors?.find(c => c.qualifier === 'away')?.name || 'N/A';
      const bookCount = event.markets?.[0]?.books?.length || 0;
      console.log(`   ${i+1}. ${home} vs ${away}`);
      console.log(`      League: ${event.tournament?.name || 'N/A'}`);
      console.log(`      Bookmakers: ${bookCount}`);
      if (event.markets?.[0]?.books?.[0]) {
        const book = event.markets[0].books[0];
        console.log(`      First bookmaker: ${book.name}`);
      }
    });
    console.log(`${"=".repeat(60)}\n`);

    return {
      available: true,
      data: this.normalizeOddsComparisonData(limitedEvents, sport),
      rawCount: totalRawCount, // Total events from API before filtering
      filteredCount: events.length, // Events after league filter
      apiSource: "Sportradar Odds Comparison API",
      generatedAt: data.generated_at,
      leagueFilter: leagueFilter ? (leagueFilter.name || leagueFilter.category) : "all",
    };
  }

  /**
   * Normalize Sportradar Odds Comparison API data to our common format
   */
  normalizeOddsComparisonData(events, sport) {
    return events.map((event) => {
      // Extract teams from competitors
      const competitors = event.competitors || [];
      const homeTeam = competitors.find((c) => c.qualifier === "home") || competitors[0] || {};
      const awayTeam = competitors.find((c) => c.qualifier === "away") || competitors[1] || {};

      const homeTeamName = homeTeam.name || homeTeam.abbreviation || "Home Team";
      const awayTeamName = awayTeam.name || awayTeam.abbreviation || "Away Team";

      // Extract bookmakers from markets
      const bookmakers = this.extractBookmakers(event.markets || [], homeTeamName, awayTeamName);

      // Get tournament/league info
      const tournament = event.tournament || {};
      const season = event.season || {};

      return {
        id: event.id || `${this.name}-${Date.now()}-${Math.random()}`,
        sport: sport,
        sportTitle: tournament.sport?.name || sport,
        league: tournament.name || season.name || "Unknown League",
        homeTeam: homeTeamName,
        awayTeam: awayTeamName,
        commenceTime: event.scheduled || new Date().toISOString(),
        status: event.status || "not_started",
        venue: event.venue?.name || null,
        bookmakers: bookmakers,
        bookmakerCount: bookmakers.length,
        source: this.name,
      };
    });
  }

  /**
   * Extract bookmakers from Sportradar Odds Comparison markets data
   * 
   * Market format:
   * {
   *   "odds_type_id": 2,
   *   "name": "3way",
   *   "books": [{
   *     "id": "sr:book:74",
   *     "name": "Bet365",
   *     "outcomes": [{
   *       "odds_field_id": 3,
   *       "type": "home",
   *       "odds": "1.910",
   *       "opening_odds": "1.710",
   *       "odds_trend": "down"
   *     }, ...]
   *   }, ...]
   * }
   */
  extractBookmakers(markets, homeTeamName, awayTeamName) {
    if (!Array.isArray(markets) || markets.length === 0) {
      return [];
    }

    const bookmakerMap = new Map();

    // Find moneyline market (different names for different sports)
    // - "3way" / "1x2" - Soccer (with draw option)
    // - "2way" - American Football, Baseball, Tennis, MMA, etc. (no draw)
    const h2hMarket = markets.find((m) => 
      m.name === "3way" || m.name === "1x2" || m.name === "2way"
    );
    
    if (h2hMarket && h2hMarket.books) {
      // Limit to 10 bookmakers
      const books = h2hMarket.books.slice(0, 10);
      
      books.forEach((book) => {
        const bookmakerName = book.name || "Unknown";
        const bookmakerKey = book.id || bookmakerName.toLowerCase().replace(/\s+/g, "_");

        const outcomes = [];
        
        book.outcomes?.forEach((outcome) => {
          // Map outcome types to team names
          let name = "";
          if (outcome.type === "home") {
            name = homeTeamName;
          } else if (outcome.type === "away") {
            name = awayTeamName;
          } else if (outcome.type === "draw") {
            name = "Draw";
          }

          if (name && outcome.odds) {
            outcomes.push({
              name: name,
              price: parseFloat(outcome.odds),
              openingPrice: outcome.opening_odds ? parseFloat(outcome.opening_odds) : null,
              trend: outcome.odds_trend || null,
            });
          }
        });

        if (outcomes.length > 0) {
          bookmakerMap.set(bookmakerName, {
            key: bookmakerKey,
            name: bookmakerKey,
            title: bookmakerName,
            markets: [{
              key: "h2h",
              outcomes: outcomes,
            }],
          });
        }
      });
    }

    return Array.from(bookmakerMap.values());
  }
}
