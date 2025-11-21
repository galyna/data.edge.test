import dotenv from "dotenv";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Get current directory (ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from backend directory
// Try multiple paths: relative to config.js, relative to cwd, or default location
const envPath = join(__dirname, "../.env");
dotenv.config({ path: envPath });

// Debug: log if env loaded (only in development)
if (process.env.NODE_ENV !== "production") {
  console.log(`[Config] Loading .env from: ${envPath}`);
  console.log(`[Config] SPORTRADAR_API_KEY: ${process.env.SPORTRADAR_API_KEY ? "✅ Set" : "❌ Not set"}`);
}

/**
 * Data Edge Backend Configuration
 * 
 * The Odds API Integration (Sem):
 * - 6 Football Leagues: EPL, La Liga, Serie A, Bundesliga, Ligue 1, Champions League
 * - Markets: h2h (moneyline only, для экономии квоты)
 * - Parallel fetching for all leagues
 * - Auto-aggregation of odds from multiple bookmakers
 * - Quota: 500 requests/month (Free Tier)
 * 
 * Sportradar API Integration (Bill):
 * - Schedule + Markets endpoints (2 запроса на спорт)
 * - Trial plan: 1,000 requests, 1 QPS, до 12/21/2025
 * - Supports: Soccer, Basketball, Baseball, Hockey, Tennis, MMA, Esports
 * - ⚠️ Расход: 6 запросов на fetch (1 schedule + 5 markets для каждого события)
 * 
 * Supported Sports:
 * - football/soccer: EPL, La Liga, Serie A, Bundesliga, Ligue 1, UCL
 * - basketball: NBA, Euroleague, NCAAB
 * - baseball: MLB, NPB
 * - ice_hockey: NHL
 * - tennis: ATP, WTA
 * - mma: UFC
 */
export const config = {
  // Server
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || "development",
  enableCors: process.env.ENABLE_CORS === "true",

  // API Keys
  apiKeys: {
    theOdds: process.env.THEODDS_API_KEY,
    sportradar: process.env.SPORTRADAR_API_KEY,
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

