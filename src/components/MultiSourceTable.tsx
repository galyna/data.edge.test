import { ArrowUp, ArrowDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Match } from "@/types/match";
import { useState } from "react";
import MatchDetailDialog from "./MatchDetailDialog";
import AnimatedValue from "./AnimatedValue";
import { TeamLogo } from "./TeamLogo";

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
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide">
            Multi-Source Odds Comparison
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Aggregated data from active sources
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Last update:</span>
          <span className="text-signal font-mono text-xs">
            {lastUpdate ? formatTime(lastUpdate) : "0s ago"}
          </span>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="h-9 px-3 text-xs font-semibold uppercase text-muted-foreground">
              Match
            </TableHead>
            <TableHead className="h-9 px-3 text-xs font-semibold uppercase text-muted-foreground">
              Aggregated Odds
            </TableHead>
            <TableHead className="h-9 px-3 text-xs font-semibold uppercase text-muted-foreground">
              Spread
            </TableHead>
            <TableHead className="h-9 px-3 text-xs font-semibold uppercase text-muted-foreground">
              Best Source
            </TableHead>
            <TableHead className="h-9 px-3 text-right text-xs font-semibold uppercase text-muted-foreground">
              Value %
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {matches.map((match) => (
            <TableRow
              key={match.id}
              className="hover-lift h-11 cursor-pointer border-border transition-all"
              onClick={() => handleMatchClick(match)}
            >
              <TableCell className="px-3 text-xs font-medium">
                <div className="flex items-center gap-2">
                  <TeamLogo team={match.homeTeam} sport={match.sport.toLowerCase()} size="sm" />
                  <span>
                    {match.homeTeam.name} vs {match.awayTeam.name}
                  </span>
                </div>
              </TableCell>
              <TableCell className="px-3 font-mono text-xs">
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
                  <span
                    className={`px-1.5 py-0.5 text-[10px] ${
                      match.spreadQuality === "low"
                        ? "bg-positive text-primary-foreground"
                        : match.spreadQuality === "high"
                          ? "bg-negative text-destructive-foreground"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {match.spreadQuality.toUpperCase()}
                  </span>
                </div>
              </TableCell>
              <TableCell className="px-3 text-xs">{match.bestSource}</TableCell>
              <TableCell className="px-3 text-right">
                <div className="flex items-center justify-end gap-1">
                  {match.value > 10 ? (
                    <ArrowUp className="text-positive h-3 w-3" />
                  ) : (
                    <ArrowDown className="h-3 w-3 text-muted-foreground" />
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

      <MatchDetailDialog match={selectedMatch} open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
};

export default MultiSourceTable;
