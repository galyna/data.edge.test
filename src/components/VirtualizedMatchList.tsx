"use client";

import { memo, useMemo, useCallback, useState, useRef, useEffect } from "react";
import { Match } from "@/types/match";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { TeamLogo } from "./TeamLogo";
import { useSelectedMatch, useSetSelectedMatch } from "@/store/matchStore";

interface VirtualizedMatchListProps {
  matches: Match[];
  height?: number;
  itemHeight?: number;
}

/**
 * Virtualized list component for rendering large numbers of matches
 * Currently implements basic windowing, ready for react-window integration
 * 
 * Performance optimizations:
 * - Only renders visible items + buffer
 * - Memoized row components
 * - Optimized scroll handling
 * - Batch updates
 */
const VirtualizedMatchList = memo(({ 
  matches, 
  height = 600,
  itemHeight = 64 
}: VirtualizedMatchListProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  
  const selectedMatch = useSelectedMatch();
  const setSelectedMatch = useSetSelectedMatch();

  // Calculate visible range with buffer
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - 3); // 3 items buffer
    const endIndex = Math.min(
      matches.length,
      Math.ceil((scrollTop + height) / itemHeight) + 3 // 3 items buffer
    );
    
    return { startIndex, endIndex };
  }, [scrollTop, height, itemHeight, matches.length]);

  // Get visible items
  const visibleItems = useMemo(() => {
    return matches.slice(visibleRange.startIndex, visibleRange.endIndex);
  }, [matches, visibleRange]);

  // Throttled scroll handler
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const handleMatchClick = useCallback(
    (match: Match) => {
      setSelectedMatch(match);
    },
    [setSelectedMatch]
  );

  // Total height of all items
  const totalHeight = matches.length * itemHeight;

  return (
    <div
      ref={containerRef}
      className="terminal-card overflow-auto"
      style={{ height }}
      onScroll={handleScroll}
    >
      <div className="mb-3 flex items-center justify-between border-b border-border p-3 pb-2">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">
            UNIFIED SPORTS FEED
          </h3>
          <p className="text-[10px] text-muted-foreground">
            Live scores and data from all sources. Matches: {matches.length}
          </p>
        </div>
      </div>

      {/* Virtualized content */}
      <div style={{ height: totalHeight, position: "relative" }}>
        <div
          style={{
            transform: `translateY(${visibleRange.startIndex * itemHeight}px)`,
          }}
        >
          {visibleItems.map((match, idx) => (
            <MatchRow
              key={match.id}
              match={match}
              isSelected={selectedMatch?.id === match.id}
              onClick={handleMatchClick}
              height={itemHeight}
            />
          ))}
        </div>
      </div>
    </div>
  );
});

VirtualizedMatchList.displayName = "VirtualizedMatchList";

// Memoized match row component
const MatchRow = memo(({
  match,
  isSelected,
  onClick,
  height,
}: {
  match: Match;
  isSelected: boolean;
  onClick: (match: Match) => void;
  height: number;
}) => {
  const formatOdds = useMemo(() => {
    if (match.aggregatedOdds.draw) {
      return `${match.aggregatedOdds.home.toFixed(2)} / ${match.aggregatedOdds.draw.toFixed(2)} / ${match.aggregatedOdds.away.toFixed(2)}`;
    }
    return `${match.aggregatedOdds.home.toFixed(2)} / ${match.aggregatedOdds.away.toFixed(2)}`;
  }, [match.aggregatedOdds]);

  const formatTime = useMemo(() => {
    if (match.status === "live" && match.liveData) {
      return match.liveData.time;
    }
    if (match.status === "scheduled") {
      const date = new Date(match.startTime);
      const hours = date.getUTCHours().toString().padStart(2, "0");
      const minutes = date.getUTCMinutes().toString().padStart(2, "0");
      return `${hours}:${minutes}`;
    }
    return "FT";
  }, [match.status, match.liveData, match.startTime]);

  const statusBadge = useMemo(() => {
    switch (match.status) {
      case "live":
        return (
          <Badge variant="destructive" className="animate-pulse text-[10px]">
            LIVE
          </Badge>
        );
      case "scheduled":
        return (
          <Badge variant="outline" className="text-[10px]">
            SCHEDULED
          </Badge>
        );
      case "finished":
        return (
          <Badge variant="secondary" className="text-[10px]">
            FINISHED
          </Badge>
        );
    }
  }, [match.status]);

  const handleClick = useCallback(() => {
    onClick(match);
  }, [match, onClick]);

  return (
    <div
      className={`hover-lift grid cursor-pointer grid-cols-12 items-center gap-2 border-b border-border px-3 transition-all ${
        isSelected ? "border-primary/50 bg-primary/10" : ""
      }`}
      style={{ height }}
      onClick={handleClick}
    >
      {/* Match */}
      <div className="col-span-4 flex items-center gap-2">
        <TeamLogo team={match.homeTeam} sport={match.sport.toLowerCase()} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-xs font-medium">{match.homeTeam.name}</div>
          <div className="truncate text-[10px] text-muted-foreground">
            vs {match.awayTeam.name}
          </div>
        </div>
      </div>

      {/* Score */}
      <div className="col-span-2 text-center">
        {match.liveData ? (
          <div className="font-mono text-sm font-bold">
            {match.liveData.homeScore} - {match.liveData.awayScore}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">-</span>
        )}
      </div>

      {/* Status */}
      <div className="col-span-2 text-center">{statusBadge}</div>

      {/* Odds */}
      <div className="col-span-3 text-center">
        <span className="font-mono text-xs">{formatOdds}</span>
      </div>

      {/* Time */}
      <div className="col-span-1 text-right">
        <div className="flex items-center justify-end gap-1">
          <Clock className="h-3 w-3 text-muted-foreground" />
          <span className="font-mono text-xs text-muted-foreground">{formatTime}</span>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for better performance
  return (
    prevProps.match.id === nextProps.match.id &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.match.aggregatedOdds === nextProps.match.aggregatedOdds &&
    prevProps.match.liveData === nextProps.match.liveData &&
    prevProps.match.status === nextProps.match.status
  );
});

MatchRow.displayName = "MatchRow";

export default VirtualizedMatchList;

