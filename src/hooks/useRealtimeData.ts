import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Match, DataSource } from "@/types/match";
import { batchUpdates, throttle, hasChanged, optimizeObject } from "@/lib/performance";

interface UseRealtimeDataReturn {
  matches: Match[];
  dataSources: DataSource[];
  lastUpdate: Date;
  isUpdating: boolean;
}

interface MatchUpdate {
  matchId: string;
  updates: Partial<Match>;
}

export const useRealtimeData = (
  initialMatches: Match[],
  initialSources: DataSource[],
  updateInterval: number = 5000
): UseRealtimeDataReturn => {
  const [matches, setMatches] = useState<Match[]>(initialMatches);
  const [dataSources, setDataSources] = useState<DataSource[]>(initialSources);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Keep track of previous values to optimize re-renders
  const prevMatchesRef = useRef<Match[]>(initialMatches);
  const prevSourcesRef = useRef<DataSource[]>(initialSources);
  
  // Use Map for faster lookups by match ID
  const matchMapRef = useRef<Map<string, Match>>(
    new Map(initialMatches.map((m) => [m.id, m]))
  );

  // Batch match updates to reduce re-renders
  const batchedMatchUpdate = useMemo(
    () =>
      batchUpdates<MatchUpdate>((updates) => {
        setMatches((prevMatches) => {
          const matchMap = new Map(prevMatches.map((m) => [m.id, m]));
          let hasAnyChanges = false;

          for (const update of updates) {
            const match = matchMap.get(update.matchId);
            if (match) {
              const updatedMatch = { ...match, ...update.updates };
              if (hasChanged(match, updatedMatch)) {
                matchMap.set(update.matchId, updatedMatch);
                hasAnyChanges = true;
              }
            }
          }

          if (!hasAnyChanges) {
            return prevMatches;
          }

          const newMatches = Array.from(matchMap.values());
          prevMatchesRef.current = newMatches;
          matchMapRef.current = matchMap;
          return newMatches;
        });
      }, 16), // Update every frame (~60fps)
    []
  );

  // Throttled update function to limit processing frequency
  const simulateUpdate = useCallback(
    throttle(() => {
      setIsUpdating(true);
      
      // Process match updates
      const updatesToApply: MatchUpdate[] = [];
      
      prevMatchesRef.current.forEach((match) => {
        // Randomly decide if this match should update (30% chance)
        if (Math.random() > 0.7) {
          return;
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

        const updates: Partial<Match> = {
          aggregatedOdds: {
            home: newHomeOdds,
            draw: newDrawOdds,
            away: newAwayOdds,
          },
          sources: newSources,
          spread: newSpread,
          value: match.value + (Math.random() - 0.5) * 2,
        };

        updatesToApply.push({ matchId: match.id, updates });
      });

      // Apply batched updates
      updatesToApply.forEach((update) => batchedMatchUpdate(update));

      // Update data sources (less frequently)
      setDataSources((prevSources) => {
        const newSources = prevSources.map((source) => {
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

          const updatedSource = {
            ...source,
            latency: Math.round(newLatency),
            status: newStatus,
            lastUpdate:
              Math.random() > 0.3 ? `${Math.floor(Math.random() * 10) + 1}s ago` : source.lastUpdate,
          };

          // Optimize object allocation
          return optimizeObject(source, updatedSource);
        });

        // Only update if sources actually changed
        const sourcesChanged = newSources.some((source, idx) => source !== prevSources[idx]);
        if (!sourcesChanged) {
          return prevSources;
        }

        prevSourcesRef.current = newSources;
        return newSources;
      });

      setLastUpdate(new Date());
      setIsUpdating(false);
    }, 100), // Throttle to max 10 updates per second
    [batchedMatchUpdate]
  );

  useEffect(() => {
    const interval = setInterval(simulateUpdate, updateInterval);
    return () => {
      clearInterval(interval);
    };
  }, [simulateUpdate, updateInterval]);

  return { matches, dataSources, lastUpdate, isUpdating };
};
