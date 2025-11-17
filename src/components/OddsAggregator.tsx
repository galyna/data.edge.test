"use client";

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
import { TrendingUp, AlertCircle } from "lucide-react";
import { TeamLogo } from "./TeamLogo";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface OddsAggregatorProps {
  match: Match | null;
}

const OddsAggregator = ({ match }: OddsAggregatorProps) => {
  if (!match) {
    return (
      <div className="terminal-card p-4">
        <div className="py-8 text-center">
          <TrendingUp className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Select a match to view odds</p>
        </div>
      </div>
    );
  }

  if (!match.sources || match.sources.length === 0) {
    return (
      <div className="terminal-card p-4">
        <div className="py-8 text-center">
          <TrendingUp className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No source data available</p>
        </div>
      </div>
    );
  }

  // Find best odds for each outcome
  const bestHome = Math.max(...match.sources.map((s) => s.odds.home));
  const bestAway = Math.max(...match.sources.map((s) => s.odds.away));
  const bestDraw = match.aggregatedOdds.draw
    ? Math.max(...match.sources.map((s) => s.odds.draw || 0))
    : null;

  const getBestSource = (outcome: "home" | "draw" | "away") => {
    if (outcome === "draw" && !bestDraw) return null;
    const bestValue = outcome === "home" ? bestHome : outcome === "draw" ? bestDraw! : bestAway;
    return match.sources.find((s) => s.odds[outcome] === bestValue)?.sourceName;
  };

  return (
    <div className="terminal-card p-3">
      <div className="mb-3 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-primary" />
        <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-foreground">
          <span>ODDS:</span>
          <TeamLogo team={match.homeTeam} sport={match.sport.toLowerCase()} size="sm" />
          <span>{match.homeTeam.shortName}</span>
          <span className="text-muted-foreground">vs</span>
          <span>{match.awayTeam.shortName}</span>
          <TeamLogo team={match.awayTeam} sport={match.sport.toLowerCase()} size="sm" />
        </h3>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="h-8 px-2 text-[10px] font-bold uppercase text-foreground">
              SOURCE
            </TableHead>
            <TableHead className="h-8 px-2 text-center text-[10px] font-bold uppercase text-foreground">
              HOME
            </TableHead>
            {match.aggregatedOdds.draw && (
              <TableHead className="h-8 px-2 text-center text-[10px] font-bold uppercase text-foreground">
                DRAW
              </TableHead>
            )}
            <TableHead className="h-8 px-2 text-center text-[10px] font-bold uppercase text-foreground">
              AWAY
            </TableHead>
            <TableHead className="h-8 px-2 text-center text-[10px] font-bold uppercase text-foreground">
              <Tooltip>
                <TooltipTrigger className="cursor-help">BEST</TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Indicates best odds for Home (H), Draw (D), or Away (A)</p>
                </TooltipContent>
              </Tooltip>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {match.sources.map((source) => {
            const isBestHome = source.odds.home === bestHome;
            const isBestAway = source.odds.away === bestAway;
            const isBestDraw = bestDraw && source.odds.draw === bestDraw;

            return (
              <TableRow key={source.sourceId} className="h-8 border-border hover:bg-muted/20">
                <TableCell className="px-2 text-[10px] font-semibold text-foreground">
                  {source.sourceName}
                </TableCell>
                <TableCell
                  className={`px-2 text-center font-mono text-[10px] font-semibold ${
                    isBestHome ? "bg-primary/10 text-primary" : "text-foreground"
                  }`}
                >
                  {source.odds.home.toFixed(2)}
                </TableCell>
                {match.aggregatedOdds.draw && (
                  <TableCell
                    className={`px-2 text-center font-mono text-[10px] ${
                      isBestDraw ? "bg-primary/10 font-semibold text-primary" : ""
                    }`}
                  >
                    {source.odds.draw?.toFixed(2) || "-"}
                  </TableCell>
                )}
                <TableCell
                  className={`px-2 text-center font-mono text-[10px] ${
                    isBestAway ? "bg-primary/10 font-semibold text-primary" : ""
                  }`}
                >
                  {source.odds.away.toFixed(2)}
                </TableCell>
                <TableCell className="px-2 text-center">
                  {isBestHome && (
                    <Badge
                      variant="outline"
                      className="border-primary/30 bg-primary/20 px-1.5 py-0 text-[9px] text-primary"
                    >
                      H
                    </Badge>
                  )}
                  {isBestDraw && (
                    <Badge
                      variant="outline"
                      className="border-primary/30 bg-primary/20 px-1.5 py-0 text-[9px] text-primary"
                    >
                      D
                    </Badge>
                  )}
                  {isBestAway && (
                    <Badge
                      variant="outline"
                      className="border-primary/30 bg-primary/20 px-1.5 py-0 text-[9px] text-primary"
                    >
                      A
                    </Badge>
                  )}
                  {!isBestHome && !isBestAway && !isBestDraw && (
                    <span className="text-[10px] text-muted-foreground">-</span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Value Alert */}
      {match.value > 5 && (
        <div className="mt-2 border border-border bg-muted/10 p-2">
          <div className="flex items-start gap-1.5">
            <AlertCircle className="mt-0.5 h-3 w-3 flex-shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <div className="mb-0.5 text-[10px] font-medium text-foreground">
                Value: +{match.value.toFixed(1)}%
              </div>
              <div className="font-mono text-[10px] text-muted-foreground">
                Best: {getBestSource("home")} {bestHome.toFixed(2)} vs avg{" "}
                {match.aggregatedOdds.home.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OddsAggregator;
