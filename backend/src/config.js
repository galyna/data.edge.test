import dotenv from "dotenv";

dotenv.config();

export const config = {
  // Server
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || "development",
  enableCors: process.env.ENABLE_CORS === "true",

  // API Keys
  apiKeys: {
    theSportsDB: process.env.THESPORTSDB_API_KEY,
    apiSports: process.env.APISPORTS_API_KEY,
    theOdds: process.env.THEODDS_API_KEY,
  },

  // API Endpoints
  endpoints: {
    theSportsDB: {
      base: "https://www.thesportsdb.com/api/v1/json",
      livescore: (sport = "Soccer") =>
        `https://www.thesportsdb.com/api/v1/json/${config.apiKeys.theSportsDB}/livescore.php?s=${sport}`,
      events: (date) =>
        `https://www.thesportsdb.com/api/v1/json/${config.apiKeys.theSportsDB}/eventsday.php?d=${date}`,
      eventsByLeague: (leagueId) =>
        `https://www.thesportsdb.com/api/v1/json/${config.apiKeys.theSportsDB}/eventsnextleague.php?id=${leagueId}`,
      pastEvents: (teamId) =>
        `https://www.thesportsdb.com/api/v1/json/${config.apiKeys.theSportsDB}/eventslast.php?id=${teamId}`,
    },
    apiSports: {
      base: "https://v3.football.api-sports.io",
      liveFixtures: "https://v3.football.api-sports.io/fixtures?live=all",
      fixturesByDate: (date) =>
        `https://v3.football.api-sports.io/fixtures?date=${date}`,
    },
    theOdds: {
      base: "https://api.the-odds-api.com/v4",
      sports: "https://api.the-odds-api.com/v4/sports",
      odds: (sport = "soccer_epl") =>
        `https://api.the-odds-api.com/v4/sports/${sport}/odds?apiKey=${config.apiKeys.theOdds}&regions=eu,us&markets=h2h`,
    },
  },

  // Request settings
  timeout: parseInt(process.env.API_TIMEOUT) || 5000,
};

