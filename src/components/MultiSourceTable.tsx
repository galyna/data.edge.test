import { ArrowUp, ArrowDown, TrendingUp } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Match } from "@/types/match";
import { useState } from "react";
import MatchDetailDialog from "./MatchDetailDialog";
import AnimatedValue from "./AnimatedValue";

interface MultiSourceTableProps {
  matches: Match[];
  lastUpdate?: Date;
}

const MultiSourceTable = ({ matches, lastUpdate }: MultiSourceTableProps) => {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleMatchClick = (match: Match) => {
    setSelectedMatch(match);
    setDialogOpen(true);
  };

  const formatOdds = (match: Match) => {
    if (match.aggregatedOdds.draw) {
      return `${match.aggregatedOdds.home.toFixed(2)} / ${match.aggregatedOdds.draw.toFixed(2)} / ${match.aggregatedOdds.away.toFixed(2)}`;
    }
    return `${match.aggregatedOdds.home.toFixed(2)} / ${match.aggregatedOdds.away.toFixed(2)}`;
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    return `${diff}s ago`;
  };

  return (
    <div className="terminal-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide">Multi-Source Odds Comparison</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Aggregated data from active sources</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Last update:</span>
          <span className="text-xs font-mono text-signal">
            {lastUpdate ? formatTime(lastUpdate) : '0s ago'}
          </span>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-muted-foreground font-semibold text-xs uppercase h-9 px-3">Match</TableHead>
            <TableHead className="text-muted-foreground font-semibold text-xs uppercase h-9 px-3">Aggregated Odds</TableHead>
            <TableHead className="text-muted-foreground font-semibold text-xs uppercase h-9 px-3">Spread</TableHead>
            <TableHead className="text-muted-foreground font-semibold text-xs uppercase h-9 px-3">Best Source</TableHead>
            <TableHead className="text-muted-foreground font-semibold text-xs uppercase h-9 px-3 text-right">Value %</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {matches.map((match) => (
            <TableRow 
              key={match.id} 
              className="border-border hover-lift cursor-pointer h-11 transition-all"
              onClick={() => handleMatchClick(match)}
            >
              <TableCell className="font-medium text-xs px-3">
                <div className="flex items-center gap-2">
                  <span>{match.homeTeam.logo}</span>
                  <span>{match.homeTeam.name} vs {match.awayTeam.name}</span>
                </div>
              </TableCell>
              <TableCell className="font-mono text-xs px-3">
                <AnimatedValue 
                  value={match.aggregatedOdds.home}
                  format={() => formatOdds(match)}
                  className="font-mono text-xs"
                />
              </TableCell>
              <TableCell className="px-3">
                <div className="flex items-center gap-1.5">
                  <AnimatedValue 
                    value={match.spread}
                    format={(val) => `±${val.toFixed(2)}`}
                    className={`font-mono text-xs ${
                      match.spreadQuality === "low" 
                        ? "text-positive" 
                        : match.spreadQuality === "high" 
                        ? "text-negative" 
                        : "text-muted-foreground"
                    }`}
                  />
                  <span className={`text-[10px] px-1.5 py-0.5 ${
                    match.spreadQuality === "low" 
                      ? "bg-positive text-primary-foreground" 
                      : match.spreadQuality === "high" 
                      ? "bg-negative text-destructive-foreground" 
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {match.spreadQuality.toUpperCase()}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-xs px-3">{match.bestSource}</TableCell>
              <TableCell className="text-right px-3">
                <div className="flex items-center justify-end gap-1">
                  {match.value > 10 ? (
                    <ArrowUp className="w-3 h-3 text-positive" />
                  ) : (
                    <ArrowDown className="w-3 h-3 text-muted-foreground" />
                  )}
                  <AnimatedValue 
                    value={match.value}
                    format={(val) => `+${val.toFixed(1)}%`}
                    className={`font-mono text-xs font-semibold ${
                      match.value > 10 ? "text-signal" : "text-foreground"
                    }`}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <MatchDetailDialog 
        match={selectedMatch}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
};

export default MultiSourceTable;
