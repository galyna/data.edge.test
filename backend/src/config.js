import dotenv from "dotenv";

dotenv.config();

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
      odds: (sport = "soccer_epl") =>
        `https://api.the-odds-api.com/v4/sports/${sport}/odds?apiKey=${config.apiKeys.theOdds}&regions=eu,us&markets=h2h`,
    },
  },

  // Request settings
  timeout: parseInt(process.env.API_TIMEOUT) || 5000,
};

