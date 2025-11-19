import { useState, useEffect, useCallback } from "react";
import { Match, Team } from "@/types/match";

interface SourceData {
  name: string;
  available: boolean;
  configured: boolean;
  duration: string;
  eventsCount: number;
  events: any[];
  error: string | null;
  requestsRemaining?: number | null;
}

interface LiveDataResponse {
  timestamp: string;
  duration: string;
  sources: SourceData[];
  summary: {
    totalSources: number;
    availableSources: number;
    totalEvents: number;
  };
}

interface UseLiveSportsDataResult {
  matches: Match[];
  sources: SourceData[];
  summary: LiveDataResponse["summary"] | null;
  isLoading: boolean;
  error: string | null;
  lastUpdate: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching live sports data from backend
 * @param autoRefetch - Auto refetch interval in ms (0 to disable)
 * @param sport - Sport filter (soccer, basketball, etc.)
 * @param league - League filter (epl, nba, etc.) - optional, default "all"
 */
export function useLiveSportsData(
  autoRefetch: number = 0,
  sport: string = "soccer",
  league: string = "all"
): UseLiveSportsDataResult {
  const [matches, setMatches] = useState<Match[]>([]);
  const [sources, setSources] = useState<SourceData[]>([]);
  const [summary, setSummary] = useState<LiveDataResponse["summary"] | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `/api/live-data?sport=${encodeURIComponent(sport)}&league=${encodeURIComponent(league)}`, 
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch data");
      }

      const data: LiveDataResponse = await response.json();

      // Transform events to Match format
      const allMatches: Match[] = [];

      data.sources.forEach((source) => {
        if (source.available && source.events) {
          source.events.forEach((event) => {
            allMatches.push(transformEventToMatch(event, source.name));
          });
        }
      });

      setMatches(allMatches);
      setSources(data.sources);
      setSummary(data.summary);
      setLastUpdate(data.timestamp);
    } catch (err) {
      console.error("Error fetching live data:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [sport, league]); // Re-fetch when sport or league changes

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto refetch
  useEffect(() => {
    if (autoRefetch > 0) {
      const interval = setInterval(() => {
        fetchData();
      }, autoRefetch);

      return () => clearInterval(interval);
    }
  }, [autoRefetch, fetchData]);

  return {
    matches,
    sources,
    summary,
    isLoading,
    error,
    lastUpdate,
    refetch: fetchData,
  };
}

/**
 * Transform event from any source to Match format
 */
function transformEventToMatch(event: any, sourceName: string): Match {
  // Если homeTeam и awayTeam уже объекты (из нормализованных данных бэкенда), используем их
  // Иначе создаем базовые объекты Team
  const homeTeam: Team = typeof event.homeTeam === "object" && event.homeTeam !== null
    ? {
        name: event.homeTeam.name || "Unknown",
        shortName: event.homeTeam.shortName || event.homeTeam.name || "Unknown",
        logo: event.homeTeam.logo || "",
      }
    : {
        name: typeof event.homeTeam === "string" ? event.homeTeam : "Unknown",
        shortName: typeof event.homeTeam === "string" ? event.homeTeam.split(" ").slice(0, 2).join(" ") : "Unknown",
        logo: "",
      };

  const awayTeam: Team = typeof event.awayTeam === "object" && event.awayTeam !== null
    ? {
        name: event.awayTeam.name || "Unknown",
        shortName: event.awayTeam.shortName || event.awayTeam.name || "Unknown",
        logo: event.awayTeam.logo || "",
      }
    : {
        name: typeof event.awayTeam === "string" ? event.awayTeam : "Unknown",
        shortName: typeof event.awayTeam === "string" ? event.awayTeam.split(" ").slice(0, 2).join(" ") : "Unknown",
        logo: "",
      };

  // Базовые odds (используем из события если есть, иначе генерируем)
  let aggregatedOdds = event.aggregatedOdds || {
    home: 1.8 + Math.random() * 0.4,
    draw: 3.0 + Math.random() * 0.5,
    away: 2.0 + Math.random() * 0.5,
  };

  // Base match structure
  const match: Match = {
    id: event.id || `${sourceName}-${Math.random()}`,
    homeTeam,
    awayTeam,
    homeScore: event.homeScore || 0,
    awayScore: event.awayScore || 0,
    status: mapStatus(event.status),
    startTime: event.startTime || event.time || event.dateTime || event.commenceTime || new Date().toISOString(),
    sport: event.sport || "football",
    league: event.league || event.sportTitle || "Unknown League",
    aggregatedOdds,
    sources: [],
    spread: event.spread || Math.abs(aggregatedOdds.home - aggregatedOdds.away),
    spreadQuality: event.spreadQuality || (Math.abs(aggregatedOdds.home - aggregatedOdds.away) < 0.3 ? "low" : Math.abs(aggregatedOdds.home - aggregatedOdds.away) < 0.6 ? "medium" : "high"),
    bestSource: event.bestSource || sourceName,
    value: event.value || Math.random() * 10,
    liveData: event.liveData,
  };

  // Preserve bookmakers data from The Odds API for TheOddsMarkets component
  if (event.bookmakers) {
    (match as any).bookmakers = event.bookmakers;
  }

  // Add source information
  if (event.bookmakers) {
    // The Odds API format
    match.sources = event.bookmakers.map((bookmaker: any) => ({
      sourceId: bookmaker.key || `${sourceName}-${Math.random()}`,
      sourceName: bookmaker.title || bookmaker.name,
      odds: extractOdds(bookmaker),
      timestamp: new Date().toISOString(),
      latency: 0,
    }));
  } else if (event.sources && Array.isArray(event.sources)) {
    // Используем sources из нормализованных данных бэкенда
    match.sources = event.sources.map((source: any) => ({
      sourceId: source.sourceId || `${sourceName}-${Math.random()}`,
      sourceName: source.sourceName || sourceName,
      odds: source.odds || aggregatedOdds,
      timestamp: source.timestamp || new Date().toISOString(),
      latency: source.latency || 100 + Math.random() * 200,
    }));
  } else {
    // TheSportsDB or API-Sports format (fallback)
    match.sources = [
      {
        sourceId: `${sourceName}-${match.id}`,
        sourceName: sourceName,
        odds: aggregatedOdds,
        timestamp: new Date().toISOString(),
        latency: 100 + Math.random() * 200,
      },
    ];
  }

  return match;
}

/**
 * Map various status formats to our standard format
 * Соответствует типу Match: "live" | "scheduled" | "finished"
 */
function mapStatus(
  status: string
): "live" | "scheduled" | "finished" {
  if (!status) return "scheduled";

  const statusLower = status.toLowerCase();

  // Live statuses
  if (
    statusLower.includes("live") ||
    statusLower.includes("1h") ||
    statusLower.includes("2h") ||
    statusLower.includes("ht") ||
    statusLower === "in play" ||
    statusLower.includes("half") ||
    statusLower.includes("1st") ||
    statusLower.includes("2nd")
  ) {
    return "live";
  }

  // Finished statuses
  if (
    statusLower.includes("ft") ||
    statusLower.includes("finished") ||
    statusLower.includes("ended") ||
    statusLower === "match finished"
  ) {
    return "finished";
  }

  // Postponed/Cancelled/Abandoned тоже считаем scheduled
  // (тип Match не поддерживает "postponed", только "live" | "scheduled" | "finished")
  if (
    statusLower.includes("postponed") ||
    statusLower.includes("cancelled") ||
    statusLower.includes("abandoned")
  ) {
    return "scheduled";
  }

  // Default to scheduled (было "upcoming", но тип требует "scheduled")
  return "scheduled";
}

/**
 * Extract odds from bookmaker data
 */
function extractOdds(bookmaker: any): {
  home: number;
  away: number;
  draw?: number;
} {
  const odds: any = {
    home: 0,
    away: 0,
  };

  if (bookmaker.markets) {
    const h2hMarket = bookmaker.markets.find((m: any) => m.key === "h2h");
    if (h2hMarket && h2hMarket.outcomes) {
      // Try to match by team name first (more reliable for The Odds API)
      const homeTeamName = bookmaker.home_team || "";
      const awayTeamName = bookmaker.away_team || "";
      
      h2hMarket.outcomes.forEach((outcome: any) => {
        const outcomeName = outcome.name || "";
        
        if (outcomeName === homeTeamName) {
          odds.home = outcome.price;
        } else if (outcomeName === awayTeamName) {
          odds.away = outcome.price;
        } else if (outcomeName.toLowerCase().includes("draw")) {
          odds.draw = outcome.price;
        } else if (outcome.name.toLowerCase().includes("home")) {
          odds.home = outcome.price;
        } else if (outcome.name.toLowerCase().includes("away")) {
          odds.away = outcome.price;
        }
      });
    }
  }

  return odds;
}

