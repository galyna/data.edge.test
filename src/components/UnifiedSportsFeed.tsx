import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Match } from "@/types/match";
import { Circle, Clock } from "lucide-react";
import MatchDetailDialog from "./MatchDetailDialog";
import AnimatedValue from "./AnimatedValue";

interface UnifiedSportsFeedProps {
  matches: Match[];
  onMatchClick?: (match: Match) => void;
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

const UnifiedSportsFeed = ({ matches, onMatchClick }: UnifiedSportsFeedProps) => {
  const [selectedSport, setSelectedSport] = useState("football");
  const [selectedLeague, setSelectedLeague] = useState<string>("all");
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleMatchClick = (match: Match) => {
    setSelectedMatch(match);
    setDialogOpen(true);
    onMatchClick?.(match);
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
      "Sportradar": "border-l border-l-muted-foreground/30",
      "SportsDataIO": "border-l border-l-muted-foreground/30",
      "API-Sports": "border-l border-l-muted-foreground/30",
      "TheSportsDB": "border-l border-l-muted-foreground/30",
      "PandaScore": "border-l border-l-muted-foreground/30",
    };
    return styles[sourceName] || "";
  };

  const filteredMatches = matches.filter((match) => {
    const sportMap: Record<string, string[]> = {
      football: ["Football"],
      nba: ["NBA"],
      tennis: ["Tennis"],
      esports: ["E-sports"],
    };
    const sportMatch = 
      selectedSport === "all" || 
      (sportMap[selectedSport]?.includes(match.sport) ?? false);
    const leagueMatch = selectedLeague === "all" || match.league === selectedLeague;
    return sportMatch && leagueMatch;
  });

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
      return new Date(match.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return "FT";
  };

  return (
    <div className="terminal-card p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide">Unified Sports Feed</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Live scores and data from all sources
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Matches:</span>
          <span className="text-xs font-mono text-signal">{filteredMatches.length}</span>
        </div>
      </div>

      <Tabs value={selectedSport} onValueChange={setSelectedSport}>
        <div className="flex items-center justify-between mb-3">
          <TabsList className="bg-muted/30">
            {sports.map((sport) => (
              <TabsTrigger 
                key={sport.id} 
                value={sport.id}
                className="text-xs px-3 py-1.5"
              >
                <span className="mr-1.5">{sport.icon}</span>
                {sport.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <Select value={selectedLeague} onValueChange={setSelectedLeague}>
            <SelectTrigger className="w-[180px] h-8 text-xs">
              <SelectValue placeholder="Select league" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Leagues</SelectItem>
              {leaguesBySport[selectedSport]?.map((league) => (
                <SelectItem key={league} value={league}>
                  {league}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {sports.map((sport) => (
          <TabsContent key={sport.id} value={sport.id} className="mt-0">
            {filteredMatches.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-muted-foreground">No matches found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground font-semibold text-xs uppercase h-9 px-3 w-[30%]">
                      Match
                    </TableHead>
                    <TableHead className="text-muted-foreground font-semibold text-xs uppercase h-9 px-3 text-center">
                      Score
                    </TableHead>
                    <TableHead className="text-muted-foreground font-semibold text-xs uppercase h-9 px-3 text-center">
                      Status
                    </TableHead>
                    <TableHead className="text-muted-foreground font-semibold text-xs uppercase h-9 px-3 text-center">
                      Odds
                    </TableHead>
                    <TableHead className="text-muted-foreground font-semibold text-xs uppercase h-9 px-3 text-center">
                      Source
                    </TableHead>
                    <TableHead className="text-muted-foreground font-semibold text-xs uppercase h-9 px-3 text-right">
                      Time
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMatches.map((match) => (
                    <TableRow
                      key={match.id}
                      className="border-border hover-lift cursor-pointer h-11 transition-all"
                      onClick={() => handleMatchClick(match)}
                    >
                      <TableCell className="font-medium text-xs px-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{match.homeTeam.logo}</span>
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
                      <TableCell className="text-center px-3">
                        <Tooltip>
                          <TooltipTrigger>
                            <div className={`inline-flex items-center px-2 py-0.5 text-[10px] font-mono text-muted-foreground border border-border ${getSourceBadge(match.bestSource)}`}>
                              {match.bestSource}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="text-xs space-y-1">
                              <p>Primary source: {match.bestSource || "Unknown"}</p>
                              <p>Total sources: {match.sources?.length || 0}</p>
                              <p>Spread: ±{match.spread.toFixed(2)}</p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
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
          </TabsContent>
        ))}
      </Tabs>

      <MatchDetailDialog
        match={selectedMatch}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
};

export default UnifiedSportsFeed;
