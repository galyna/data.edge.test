"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
        <div className="text-center py-8">
          <TrendingUp className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Select a match to view odds</p>
        </div>
      </div>
    );
  }

  if (!match.sources || match.sources.length === 0) {
    return (
      <div className="terminal-card p-4">
        <div className="text-center py-8">
          <TrendingUp className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
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
    return match.sources.find(
      (s) => s.odds[outcome] === bestValue
    )?.sourceName;
  };


  return (
    <div className="terminal-card p-3">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-bold uppercase tracking-wide text-foreground flex items-center gap-2">
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
            <TableHead className="text-foreground font-bold text-[10px] uppercase h-8 px-2">
              SOURCE
            </TableHead>
            <TableHead className="text-foreground font-bold text-[10px] uppercase h-8 px-2 text-center">
              HOME
            </TableHead>
            {match.aggregatedOdds.draw && (
              <TableHead className="text-foreground font-bold text-[10px] uppercase h-8 px-2 text-center">
                DRAW
              </TableHead>
            )}
            <TableHead className="text-foreground font-bold text-[10px] uppercase h-8 px-2 text-center">
              AWAY
            </TableHead>
            <TableHead className="text-foreground font-bold text-[10px] uppercase h-8 px-2 text-center">
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
              <TableRow
                key={source.sourceId}
                className="border-border hover:bg-muted/20 h-8"
              >
                <TableCell className="font-semibold text-[10px] px-2 text-foreground">
                  {source.sourceName}
                </TableCell>
                <TableCell
                  className={`text-center font-mono text-[10px] px-2 font-semibold ${
                    isBestHome ? "bg-primary/10 text-primary" : "text-foreground"
                  }`}
                >
                  {source.odds.home.toFixed(2)}
                </TableCell>
                {match.aggregatedOdds.draw && (
                  <TableCell
                    className={`text-center font-mono text-[10px] px-2 ${
                      isBestDraw ? "bg-primary/10 text-primary font-semibold" : ""
                    }`}
                  >
                    {source.odds.draw?.toFixed(2) || "-"}
                  </TableCell>
                )}
                <TableCell
                  className={`text-center font-mono text-[10px] px-2 ${
                    isBestAway ? "bg-primary/10 text-primary font-semibold" : ""
                  }`}
                >
                  {source.odds.away.toFixed(2)}
                </TableCell>
                <TableCell className="text-center px-2">
                  {isBestHome && (
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-primary/20 text-primary border-primary/30">H</Badge>
                  )}
                  {isBestDraw && (
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-primary/20 text-primary border-primary/30">D</Badge>
                  )}
                  {isBestAway && (
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-primary/20 text-primary border-primary/30">A</Badge>
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
            <AlertCircle className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-medium text-foreground mb-0.5">
                Value: +{match.value.toFixed(1)}%
              </div>
              <div className="text-[10px] text-muted-foreground font-mono">
                Best: {getBestSource("home")} {bestHome.toFixed(2)} vs avg {match.aggregatedOdds.home.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default OddsAggregator;

