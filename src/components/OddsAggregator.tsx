"use client";

import { useMemo, memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Match } from "@/types/match";
import { TrendingUp, AlertCircle, Percent } from "lucide-react";
import { TeamLogo } from "./TeamLogo";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface OddsAggregatorProps {
  match: Match | null;
}

const OddsAggregator = memo(({ match }: OddsAggregatorProps) => {
  // Calculate best odds and implied probabilities
  const analysis = useMemo(() => {
    if (!match?.sources || match.sources.length === 0) {
      return null;
    }

    const bestHome = Math.max(...match.sources.map((s) => s.odds.home));
    const bestAway = Math.max(...match.sources.map((s) => s.odds.away));
    const bestDraw = match.aggregatedOdds.draw
      ? Math.max(...match.sources.map((s) => s.odds.draw || 0))
      : null;

    const bestHomeSource = match.sources.find((s) => s.odds.home === bestHome)?.sourceName || "";
    const bestAwaySource = match.sources.find((s) => s.odds.away === bestAway)?.sourceName || "";
    const bestDrawSource = bestDraw
      ? match.sources.find((s) => s.odds.draw === bestDraw)?.sourceName || ""
      : "";

    // Calculate implied probabilities (1 / odds * 100)
    const homeProbability = bestHome > 0 ? (1 / bestHome) * 100 : 0;
    const awayProbability = bestAway > 0 ? (1 / bestAway) * 100 : 0;
    const drawProbability = bestDraw && bestDraw > 0 ? (1 / bestDraw) * 100 : 0;

    // Market efficiency (total implied probability - closer to 100% is better)
    const totalProbability = homeProbability + awayProbability + (drawProbability || 0);
    const marketEfficiency = totalProbability > 0 ? (100 / totalProbability) * 100 : 0;

    // Arbitrage check (if total probability < 100%, arbitrage exists)
    const hasArbitrage = totalProbability < 100;

    return {
      bestHome,
      bestAway,
      bestDraw,
      bestHomeSource,
      bestAwaySource,
      bestDrawSource,
      homeProbability,
      awayProbability,
      drawProbability,
      marketEfficiency,
      hasArbitrage,
    };
  }, [match?.sources, match?.aggregatedOdds?.draw]);

  // Early returns after hooks
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

  if (!analysis) {
    return (
      <div className="terminal-card p-4">
        <div className="py-8 text-center">
          <TrendingUp className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No source data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="terminal-card p-3">
      <div className="mb-3 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-primary" />
        <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-foreground">
          <span>ODDS SUMMARY:</span>
          <TeamLogo team={match.homeTeam} sport={match.sport.toLowerCase()} size="sm" />
          <span>{match.homeTeam.shortName}</span>
          <span className="text-muted-foreground">vs</span>
          <span>{match.awayTeam.shortName}</span>
          <TeamLogo team={match.awayTeam} sport={match.sport.toLowerCase()} size="sm" />
        </h3>
      </div>

      {/* Best Value Section */}
      <div className="mb-3 space-y-1.5">
        <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
          Best Value:
        </div>
        
        {/* Home */}
        <div className="flex items-center justify-between border-l-2 border-primary/50 bg-primary/5 px-2 py-1.5">
          <div className="flex items-center gap-2">
            <TeamLogo team={match.homeTeam} sport={match.sport.toLowerCase()} size="sm" />
            <span className="text-[10px] font-semibold text-foreground">HOME</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-bold text-primary">
              {analysis.bestHome.toFixed(2)}
            </span>
            <span className="text-[9px] text-muted-foreground">
              ({analysis.bestHomeSource})
            </span>
            <div className="flex items-center gap-1">
              <Percent className="h-3 w-3 text-muted-foreground" />
              <span className="font-mono text-[10px] font-semibold text-foreground">
                {analysis.homeProbability.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Draw (if exists) */}
        {analysis.bestDraw && (
          <div className="flex items-center justify-between border-l-2 border-muted bg-muted/20 px-2 py-1.5">
            <span className="text-[10px] font-semibold text-foreground">DRAW</span>
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-bold text-foreground">
                {analysis.bestDraw.toFixed(2)}
              </span>
              <span className="text-[9px] text-muted-foreground">
                ({analysis.bestDrawSource})
              </span>
              <div className="flex items-center gap-1">
                <Percent className="h-3 w-3 text-muted-foreground" />
                <span className="font-mono text-[10px] font-semibold text-foreground">
                  {analysis.drawProbability.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Away */}
        <div className="flex items-center justify-between border-l-2 border-destructive/50 bg-destructive/5 px-2 py-1.5">
          <div className="flex items-center gap-2">
            <TeamLogo team={match.awayTeam} sport={match.sport.toLowerCase()} size="sm" />
            <span className="text-[10px] font-semibold text-foreground">AWAY</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-bold text-destructive">
              {analysis.bestAway.toFixed(2)}
            </span>
            <span className="text-[9px] text-muted-foreground">
              ({analysis.bestAwaySource})
            </span>
            <div className="flex items-center gap-1">
              <Percent className="h-3 w-3 text-muted-foreground" />
              <span className="font-mono text-[10px] font-semibold text-foreground">
                {analysis.awayProbability.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Market Analysis */}
      <div className="grid grid-cols-2 gap-2 border-t border-border pt-2 text-[10px]">
        <div className="flex flex-col gap-0.5">
          <span className="text-muted-foreground">Market Efficiency</span>
          <span className={`font-mono text-sm font-bold ${
            analysis.marketEfficiency >= 95 ? "text-positive" : 
            analysis.marketEfficiency >= 90 ? "text-foreground" : "text-destructive"
          }`}>
            {analysis.marketEfficiency.toFixed(1)}%
          </span>
          <span className="text-[9px] text-muted-foreground">
            {analysis.marketEfficiency >= 95 ? "Excellent" : 
             analysis.marketEfficiency >= 90 ? "Good" : "Poor"}
          </span>
        </div>
        
        <div className="flex flex-col gap-0.5">
          <span className="text-muted-foreground">Arbitrage</span>
          {analysis.hasArbitrage ? (
            <>
              <Badge variant="default" className="w-fit text-[10px]">
                YES
              </Badge>
              <span className="text-[9px] text-positive">Opportunity detected!</span>
            </>
          ) : (
            <>
              <span className="font-mono text-sm font-bold text-muted-foreground">NO</span>
              <span className="text-[9px] text-muted-foreground">No opportunity</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
});

OddsAggregator.displayName = "OddsAggregator";

export default OddsAggregator;
