import dotenv from "dotenv";

dotenv.config();

/**
 * Data Edge Backend Configuration
 * 
 * The Odds API Integration:
 * - 6 Football Leagues: EPL, La Liga, Serie A, Bundesliga, Ligue 1, Champions League
 * - 3 Markets per sport: h2h (moneyline), spreads, totals
 * - NBA: additional markets h2h_q1, h2h_h1
 * - Parallel fetching for all leagues
 * - Auto-aggregation of odds from multiple bookmakers
 * 
 * Supported Sports:
 * - football: soccer_epl, soccer_spain_la_liga, soccer_italy_serie_a, etc.
 * - nba: basketball_nba
 * - mlb: baseball_mlb
 * - nhl: icehockey_nhl
 * - tennis: tennis_atp
 * - esports: mma_mixed_martial_arts
 * 
 * API Limits (Free Tier): 500 requests/month
 */
export const config = {
  // Server
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || "development",
  enableCors: process.env.ENABLE_CORS === "true",

  // API Keys
  apiKeys: {
    theOdds: process.env.THEODDS_API_KEY,
  },

  // API Endpoints
  endpoints: {
    theOdds: {
      base: "https://api.the-odds-api.com/v4",
      sports: "https://api.the-odds-api.com/v4/sports",
      odds: (sport = "soccer_epl", markets = "h2h,spreads,totals") =>
        `https://api.the-odds-api.com/v4/sports/${sport}/odds?apiKey=${config.apiKeys.theOdds}&regions=eu,us&markets=${markets}&oddsFormat=decimal&dateFormat=iso`,
      scores: (sport = "soccer_epl") =>
        `https://api.the-odds-api.com/v4/sports/${sport}/scores?apiKey=${config.apiKeys.theOdds}&daysFrom=3`,
    },
  },

  // Request settings
  timeout: parseInt(process.env.API_TIMEOUT) || 5000,
};

