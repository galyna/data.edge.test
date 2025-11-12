"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Match } from "@/types/match";
import { Circle, Clock } from "lucide-react";
import AnimatedValue from "./AnimatedValue";
import { TeamLogo } from "./TeamLogo";
import { useMatchStore } from "@/store/matchStore";

interface UnifiedSportsFeedProps {
  matches: Match[];
  selectedSport: string;
}

const sports = [
  { id: "football", label: "Football", icon: "⚽" },
  { id: "nba", label: "NBA", icon: "🏀" },
  { id: "tennis", label: "Tennis", icon: "🎾" },
  { id: "esports", label: "E-sports", icon: "🎮" },
];

const leaguesBySport: Record<string, string[]> = {
  football: ["Premier League", "La Liga", "Bundesliga", "Serie A", "Ligue 1"],
  nba: ["NBA Regular Season", "NBA Playoffs"],
  tennis: ["ATP Tour", "WTA Tour", "Grand Slam"],
  esports: ["LEC Spring", "LCS Spring", "CS:GO Major"],
};

const UnifiedSportsFeed = ({ matches, selectedSport }: UnifiedSportsFeedProps) => {
  const { setSelectedMatch, setMatchDetailDialogOpen, selectedMatch } = useMatchStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleMatchClick = (match: Match) => {
    setSelectedMatch(match);
    // setMatchDetailDialogOpen(true); // Now handled by clicking on a row if needed, not by default
  };

  const getStatusBadge = (status: Match["status"]) => {
    switch (status) {
      case "live":
        return <Badge variant="destructive" className="animate-pulse text-[10px]">LIVE</Badge>;
      case "scheduled":
        return <Badge variant="outline" className="text-[10px]">SCHEDULED</Badge>;
      case "finished":
        return <Badge variant="secondary" className="text-[10px]">FINISHED</Badge>;
    }
  };

  const getSourceBadge = (sourceName: string) => {
    // Минималистичные индикаторы в стиле терминала
    // Используем очень тонкие границы в приглушенных тонах
    const styles: Record<string, string> = {
      "Jack": "border-l border-l-muted-foreground/30",
      "Johnny": "border-l border-l-muted-foreground/30",
      "Sam": "border-l border-l-muted-foreground/30",
      "Mike": "border-l border-l-muted-foreground/30",
      "Alex": "border-l border-l-muted-foreground/30",
    };
    return styles[sourceName] || "";
  };

  const filteredMatches = useMemo(() => {
    return matches.filter(
      (match) => match.sport.toLowerCase() === selectedSport
    );
  }, [matches, selectedSport]);

  const formatOdds = (match: Match) => {
    if (match.aggregatedOdds.draw) {
      return `${match.aggregatedOdds.home.toFixed(2)} / ${match.aggregatedOdds.draw.toFixed(2)} / ${match.aggregatedOdds.away.toFixed(2)}`;
    }
    return `${match.aggregatedOdds.home.toFixed(2)} / ${match.aggregatedOdds.away.toFixed(2)}`;
  };

  const formatTime = (match: Match) => {
    if (match.status === "live" && match.liveData) {
      return match.liveData.time;
    }
    if (match.status === "scheduled") {
      const date = new Date(match.startTime);
      const hours = date.getUTCHours().toString().padStart(2, '0');
      const minutes = date.getUTCMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    }
    return "FT";
  };

  return (
    <div className="terminal-card p-3">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">
            UNIFIED SPORTS FEED
          </h3>
          <p className="text-[10px] text-muted-foreground">
            Live scores and data from all sources. Matches: {filteredMatches.length}
          </p>
        </div>
        {/* The filters (Tabs) are removed from here */}
      </div>

      {filteredMatches.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No matches available for the selected sport.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-foreground font-bold text-[10px] uppercase h-8 px-2 w-[30%]">
                      MATCH
                    </TableHead>
                    <TableHead className="text-foreground font-bold text-[10px] uppercase h-8 px-2 text-center">
                      SCORE
                    </TableHead>
                    <TableHead className="text-foreground font-bold text-[10px] uppercase h-8 px-2 text-center">
                      STATUS
                    </TableHead>
                    <TableHead className="text-foreground font-bold text-[10px] uppercase h-8 px-2 text-center">
                      ODDS
                    </TableHead>
                    <TableHead className="text-foreground font-bold text-[10px] uppercase h-8 px-2 text-right">
                      TIME
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMatches.map((match) => (
                    <TableRow
                      key={match.id}
                      className={`border-border hover-lift cursor-pointer h-11 transition-all ${
                        selectedMatch?.id === match.id ? "bg-primary/10 border-primary/50" : ""
                      }`}
                      onClick={() => handleMatchClick(match)}
                    >
                      <TableCell className="font-medium text-xs px-3">
                        <div className="flex items-center gap-2">
                          <TeamLogo team={match.homeTeam} sport={match.sport.toLowerCase()} size="sm" />
                          <div className="flex-1 min-w-0">
                            <div className="truncate">{match.homeTeam.name}</div>
                            <div className="text-[10px] text-muted-foreground truncate">
                              vs {match.awayTeam.name}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center px-3">
                        {match.liveData ? (
                          <div className="font-mono text-sm font-bold">
                            {match.liveData.homeScore} - {match.liveData.awayScore}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center px-3">
                        {getStatusBadge(match.status)}
                      </TableCell>
                      <TableCell className="text-center px-3">
                        <span className="font-mono text-xs">
                          {formatOdds(match)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right px-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs font-mono text-muted-foreground">
                            {formatTime(match)}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
    </div>
  );
};

export default UnifiedSportsFeed;
