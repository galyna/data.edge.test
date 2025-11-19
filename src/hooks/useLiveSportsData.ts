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
      // Сбрасываем старые данные при смене спорта/лиги
      setMatches([]);
      setSources([]);
      setSummary(null);

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

import { getTeamLogo } from "@/lib/teamLogos";

/**
 * Transform event from any source to Match format
 */
function transformEventToMatch(event: any, sourceName: string): Match {
  // Если homeTeam и awayTeam уже объекты (из нормализованных данных бэкенда), используем их
  // Иначе создаем базовые объекты Team
  const homeName = typeof event.homeTeam === "object" && event.homeTeam !== null 
    ? event.homeTeam.name 
    : typeof event.homeTeam === "string" ? event.homeTeam : "Unknown";
    
  const awayName = typeof event.awayTeam === "object" && event.awayTeam !== null 
    ? event.awayTeam.name 
    : typeof event.awayTeam === "string" ? event.awayTeam : "Unknown";

  const sport = event.sport || "soccer";

  const homeTeam: Team = {
    name: homeName,
    shortName: homeName.split(" ").slice(0, 2).join(" "),
    logo: getTeamLogo(homeName, sport) || "",
  };

  const awayTeam: Team = {
    name: awayName,
    shortName: awayName.split(" ").slice(0, 2).join(" "),
    logo: getTeamLogo(awayName, sport) || "",
  };

  // Calculate aggregated odds from sources (if available)
  let aggregatedOdds = event.aggregatedOdds;
  
  if (!aggregatedOdds && event.bookmakers && event.bookmakers.length > 0) {
    // Calculate average from all bookmakers
    const homeSum = event.bookmakers.reduce((sum: number, b: any) => {
      const h2h = b.markets?.find((m: any) => m.key === 'h2h');
      const homeOutcome = h2h?.outcomes?.find((o: any) => o.name === homeName);
      return sum + (homeOutcome?.price || 0);
    }, 0);
    
    const awaySum = event.bookmakers.reduce((sum: number, b: any) => {
      const h2h = b.markets?.find((m: any) => m.key === 'h2h');
      const awayOutcome = h2h?.outcomes?.find((o: any) => o.name === awayName);
      return sum + (awayOutcome?.price || 0);
    }, 0);
    
    const drawSum = event.bookmakers.reduce((sum: number, b: any) => {
      const h2h = b.markets?.find((m: any) => m.key === 'h2h');
      const drawOutcome = h2h?.outcomes?.find((o: any) => o.name?.toLowerCase().includes('draw'));
      return sum + (drawOutcome?.price || 0);
    }, 0);
    
    const count = event.bookmakers.length;
    aggregatedOdds = {
      home: count > 0 ? homeSum / count : 0,
      away: count > 0 ? awaySum / count : 0,
      draw: count > 0 && drawSum > 0 ? drawSum / count : undefined,
    };
  }
  
  // Fallback to zero if still not available
  if (!aggregatedOdds) {
    aggregatedOdds = { home: 0, away: 0, draw: 0 };
  }

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
      odds: extractOdds(bookmaker, homeName, awayName),
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
function extractOdds(bookmaker: any, homeTeamName: string, awayTeamName: string): {
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
        const outcomeName = outcome.name || "";
        
        // 1. Exact match with passed team names
        if (outcomeName === homeTeamName) {
          odds.home = outcome.price;
        } else if (outcomeName === awayTeamName) {
          odds.away = outcome.price;
        } 
        // 2. Match with draw
        else if (outcomeName.toLowerCase().includes("draw")) {
          odds.draw = outcome.price;
        } 
        // 3. Fallback: check if outcome name contains 'home' or 'away' (generic)
        else if (outcomeName.toLowerCase() === "home") {
          odds.home = outcome.price;
        } else if (outcomeName.toLowerCase() === "away") {
          odds.away = outcome.price;
        }
        // 4. Fuzzy match (contains team name)
        else if (homeTeamName && outcomeName.includes(homeTeamName)) {
           odds.home = outcome.price;
        } else if (awayTeamName && outcomeName.includes(awayTeamName)) {
           odds.away = outcome.price;
        }
      });
    }
  }

  return odds;
}

