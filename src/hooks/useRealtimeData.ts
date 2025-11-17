import { useState, useEffect, useCallback } from "react";
import { Match, DataSource } from "@/types/match";

interface UseRealtimeDataReturn {
  matches: Match[];
  dataSources: DataSource[];
  lastUpdate: Date;
}

export const useRealtimeData = (
  initialMatches: Match[],
  initialSources: DataSource[],
  updateInterval: number = 5000
): UseRealtimeDataReturn => {
  const [matches, setMatches] = useState<Match[]>(initialMatches);
  const [dataSources, setDataSources] = useState<DataSource[]>(initialSources);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const simulateUpdate = useCallback(() => {
    // Simulate odds changes
    setMatches((prevMatches) =>
      prevMatches.map((match) => {
        // Randomly decide if this match should update (30% chance)
        if (Math.random() > 0.7) {
          return match;
        }

        // Generate small random changes to odds
        const homeChange = (Math.random() - 0.5) * 0.1;
        const awayChange = (Math.random() - 0.5) * 0.1;
        const drawChange = match.aggregatedOdds.draw ? (Math.random() - 0.5) * 0.1 : undefined;

        const newHomeOdds = Math.max(1.01, match.aggregatedOdds.home + homeChange);
        const newAwayOdds = Math.max(1.01, match.aggregatedOdds.away + awayChange);
        const newDrawOdds = drawChange
          ? Math.max(1.01, (match.aggregatedOdds.draw || 0) + drawChange)
          : match.aggregatedOdds.draw;

        // Update sources with similar changes
        const newSources = match.sources.map((source) => ({
          ...source,
          odds: {
            home: Math.max(1.01, source.odds.home + homeChange + (Math.random() - 0.5) * 0.05),
            draw: source.odds.draw
              ? Math.max(1.01, source.odds.draw + (drawChange || 0) + (Math.random() - 0.5) * 0.05)
              : undefined,
            away: Math.max(1.01, source.odds.away + awayChange + (Math.random() - 0.5) * 0.05),
          },
          timestamp: new Date().toISOString(),
        }));

        // Recalculate spread
        const homeOdds = newSources.map((s) => s.odds.home);
        const newSpread = Math.max(...homeOdds) - Math.min(...homeOdds);

        return {
          ...match,
          aggregatedOdds: {
            home: newHomeOdds,
            draw: newDrawOdds,
            away: newAwayOdds,
          },
          sources: newSources,
          spread: newSpread,
          value: match.value + (Math.random() - 0.5) * 2, // Small value change
        };
      })
    );

    // Simulate source latency changes
    setDataSources((prevSources) =>
      prevSources.map((source) => {
        // Random latency fluctuation
        const latencyChange = (Math.random() - 0.5) * 50;
        const newLatency = Math.max(50, Math.min(1000, source.latency + latencyChange));

        // Update status based on latency
        let newStatus: "online" | "slow" | "offline" = source.status;
        if (newLatency > 400) {
          newStatus = "slow";
        } else if (source.status !== "offline") {
          newStatus = "online";
        }

        return {
          ...source,
          latency: Math.round(newLatency),
          status: newStatus,
          lastUpdate:
            Math.random() > 0.3 ? `${Math.floor(Math.random() * 10) + 1}s ago` : source.lastUpdate,
        };
      })
    );

    setLastUpdate(new Date());
  }, []);

  useEffect(() => {
    const interval = setInterval(simulateUpdate, updateInterval);
    return () => clearInterval(interval);
  }, [simulateUpdate, updateInterval]);

  return { matches, dataSources, lastUpdate };
};
