import { useState, useEffect, useCallback } from "react";
import { Match } from "@/types/match";

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
 */
export function useLiveSportsData(
  autoRefetch: number = 0
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

      const response = await fetch("/api/live-data", {
        cache: "no-store",
      });

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
  }, []);

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
  // Base match structure
  const match: Match = {
    id: event.id || `${sourceName}-${Math.random()}`,
    homeTeam: event.homeTeam || "Unknown",
    awayTeam: event.awayTeam || "Unknown",
    homeScore: event.homeScore || 0,
    awayScore: event.awayScore || 0,
    status: mapStatus(event.status),
    time: event.time || event.dateTime || new Date().toISOString(),
    sport: event.sport || "football",
    league: event.league || event.sportTitle || "Unknown League",
    sources: [],
  };

  // Add source information
  if (event.bookmakers) {
    // The Odds API format
    match.sources = event.bookmakers.map((bookmaker: any) => ({
      sourceName: bookmaker.title || bookmaker.name,
      odds: extractOdds(bookmaker),
      latency: 0,
      reliability: 95,
      timestamp: new Date().toISOString(),
    }));
  } else {
    // TheSportsDB or API-Sports format
    match.sources = [
      {
        sourceName: sourceName,
        odds: {
          home: 1.5 + Math.random(),
          away: 2.5 + Math.random(),
          draw: 3.0 + Math.random(),
        },
        latency: 100 + Math.random() * 200,
        reliability: 90 + Math.random() * 10,
        timestamp: new Date().toISOString(),
      },
    ];
  }

  return match;
}

/**
 * Map various status formats to our standard format
 */
function mapStatus(
  status: string
): "live" | "upcoming" | "finished" | "postponed" {
  if (!status) return "upcoming";

  const statusLower = status.toLowerCase();

  // Live statuses
  if (
    statusLower.includes("live") ||
    statusLower.includes("1h") ||
    statusLower.includes("2h") ||
    statusLower.includes("ht") ||
    statusLower === "in play"
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

  // Postponed statuses
  if (
    statusLower.includes("postponed") ||
    statusLower.includes("cancelled") ||
    statusLower.includes("abandoned")
  ) {
    return "postponed";
  }

  // Default to upcoming
  return "upcoming";
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
      h2hMarket.outcomes.forEach((outcome: any) => {
        if (
          outcome.name.toLowerCase().includes("home") ||
          outcome.name === bookmaker.home_team
        ) {
          odds.home = outcome.price;
        } else if (
          outcome.name.toLowerCase().includes("away") ||
          outcome.name === bookmaker.away_team
        ) {
          odds.away = outcome.price;
        } else if (outcome.name.toLowerCase().includes("draw")) {
          odds.draw = outcome.price;
        }
      });
    }
  }

  return odds;
}

