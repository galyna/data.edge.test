"use client";

import { useCallback, memo, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Match } from "@/types/match";
import { Clock } from "lucide-react";
import { TeamLogo } from "./TeamLogo";
import { useSelectedMatch, useSetSelectedMatch } from "@/store/matchStore";

interface UnifiedSportsFeedProps {
  matches: Match[]; // Already filtered by sport
  selectedSport: string; // For display purposes
}

const UnifiedSportsFeed = memo(({ matches }: UnifiedSportsFeedProps) => {
  // Use optimized Zustand selectors
  const setSelectedMatch = useSetSelectedMatch();
  const selectedMatch = useSelectedMatch();

  // Memoize selected match ID for comparison
  const selectedMatchId = useMemo(() => selectedMatch?.id ?? null, [selectedMatch]);

  const handleMatchClick = useCallback(
    (match: Match) => {
      setSelectedMatch(match);
    },
    [setSelectedMatch]
  );

  const getStatusBadge = useCallback((status: Match["status"]) => {
    switch (status) {
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
  }, []);

  const formatOdds = useCallback((match: Match) => {
    if (match.aggregatedOdds.draw) {
      return `${match.aggregatedOdds.home.toFixed(2)} / ${match.aggregatedOdds.draw.toFixed(2)} / ${match.aggregatedOdds.away.toFixed(2)}`;
    }
    return `${match.aggregatedOdds.home.toFixed(2)} / ${match.aggregatedOdds.away.toFixed(2)}`;
  }, []);

  const formatTime = useCallback((match: Match) => {
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
  }, []);

  return (
    <div className="terminal-card p-3">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">
            UNIFIED SPORTS FEED
          </h3>
          <p className="text-[10px] text-muted-foreground">
            Live scores and data from all sources. Matches: {matches.length}
          </p>
        </div>
        {/* The filters (Tabs) are removed from here */}
      </div>

      {matches.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">
          No matches available for the selected sport.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="h-8 w-[30%] px-2 text-[10px] font-bold uppercase text-foreground">
                MATCH
              </TableHead>
              <TableHead className="h-8 px-2 text-center text-[10px] font-bold uppercase text-foreground">
                LEAGUE
              </TableHead>
              <TableHead className="h-8 px-2 text-center text-[10px] font-bold uppercase text-foreground">
                SCORE
              </TableHead>
              <TableHead className="h-8 px-2 text-center text-[10px] font-bold uppercase text-foreground">
                STATUS
              </TableHead>
              <TableHead className="h-8 px-2 text-center text-[10px] font-bold uppercase text-foreground">
                ODDS
              </TableHead>
              <TableHead className="h-8 px-2 text-right text-[10px] font-bold uppercase text-foreground">
                TIME
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {matches.map((match) => {
              const isSelected = selectedMatchId === match.id;
              return (
                <TableRow
                  key={match.id}
                  className={`hover-lift h-11 cursor-pointer border-border transition-all ${
                    isSelected ? "border-primary/50 bg-primary/10" : ""
                  }`}
                  onClick={() => handleMatchClick(match)}
                >
                <TableCell className="px-3 text-xs font-medium">
                  <div className="flex items-center gap-2">
                    <TeamLogo team={match.homeTeam} sport={match.sport.toLowerCase()} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate">{match.homeTeam.name}</div>
                      <div className="truncate text-[10px] text-muted-foreground">
                        vs {match.awayTeam.name}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-3 text-center">
                  <span className="text-[10px] uppercase text-muted-foreground truncate block max-w-[100px]">
                    {match.league}
                  </span>
                </TableCell>
                <TableCell className="px-3 text-center">
                  {match.liveData ? (
                    <div className="font-mono text-sm font-bold">
                      {match.liveData.homeScore} - {match.liveData.awayScore}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="px-3 text-center">{getStatusBadge(match.status)}</TableCell>
                <TableCell className="px-3 text-center">
                  <span className="font-mono text-xs">{formatOdds(match)}</span>
                </TableCell>
                <TableCell className="px-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="font-mono text-xs text-muted-foreground">
                      {formatTime(match)}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for better performance
  // Only re-render if matches array reference changed or length changed
  if (prevProps.matches.length !== nextProps.matches.length) {
    return false;
  }
  // Shallow compare matches array
  if (prevProps.matches !== nextProps.matches) {
    // Check if any match IDs changed
    for (let i = 0; i < prevProps.matches.length; i++) {
      if (prevProps.matches[i].id !== nextProps.matches[i].id) {
        return false;
      }
    }
  }
  if (prevProps.selectedSport !== nextProps.selectedSport) {
    return false;
  }
  return true;
});

UnifiedSportsFeed.displayName = "UnifiedSportsFeed";

export default UnifiedSportsFeed;
