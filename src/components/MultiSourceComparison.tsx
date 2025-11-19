"use client";

import { useMemo, useState, useEffect, memo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Database } from "lucide-react";
import { Match } from "@/types/match";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Area } from "recharts";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { TeamLogo } from "@/components/TeamLogo";
import React from "react";

interface MultiSourceComparisonProps {
  match: Match | null;
  matches?: Match[];
  onMatchSelect?: (match: Match) => void;
}

const MultiSourceComparison = memo(({ match }: MultiSourceComparisonProps) => {
  const [mounted, setMounted] = useState(false);
  // TODO: Enable chart when real historical data is available
  const SHOW_HISTORICAL_CHART = false;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Ensure we have sources array (moved before useMemo hooks)
  const sources = useMemo(() => match?.sources || [], [match?.sources]);

  // Recalculate aggregates based on available sources
  const calculatedAggregates = useMemo(() => {
    if (!sources || sources.length === 0) return match?.aggregatedOdds || { home: 0, away: 0, draw: 0 };
    
    const sum = sources.reduce((acc, s) => ({
      home: acc.home + (s.odds.home || 0),
      away: acc.away + (s.odds.away || 0),
      draw: acc.draw + (s.odds.draw || 0)
    }), { home: 0, away: 0, draw: 0 });

    const count = sources.length;
    return {
      home: count > 0 ? sum.home / count : 0,
      away: count > 0 ? sum.away / count : 0,
      draw: count > 0 ? sum.draw / count : 0
    };
  }, [sources, match?.aggregatedOdds]);

  // Generate historical data for chart (simulate last 6 hours) - only on client to avoid hydration issues
  const chartData = useMemo(() => {
    if (!mounted || !match || !sources || sources.length === 0) {
      return [];
    }
    const data = [];
    const now = Date.now();
    const hours = 6;
    const points = 24;

    // Use a seed based on match ID for consistent data
    let seed = match.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);

    const seededRandom = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    // Use calculated consensus
    const realConsensus = calculatedAggregates.home;

    for (let i = points; i >= 0; i--) {
      const time = new Date(now - (i * hours * 60 * 60 * 1000) / points);
      // Use UTC to avoid locale differences between server and client
      const hours24 = time.getUTCHours().toString().padStart(2, "0");
      const minutes = time.getUTCMinutes().toString().padStart(2, "0");
      const timeLabel = `${hours24}:${minutes}`;

      // Simulate historical trend leading up to current REAL value
      // We work backwards from the real current value (at i=0)
      const historicalVariance = i * 0.02; // More variance further back in time
      
      const point: Record<string, string | number> = {
        time: timeLabel,
        aggregate: realConsensus + (Math.sin(i) * historicalVariance),
      };

      sources.forEach((source) => {
        // Each source converges to its actual current value
        // Add some noise that increases as we go back in time
        const noise = (seededRandom() - 0.5) * historicalVariance * 2;
        point[source.sourceName] = source.odds.home + noise;
      });

      data.push(point);
    }
    // Reverse to show oldest first
    return data.reverse();
  }, [match, mounted, sources, calculatedAggregates]);

  const chartConfig = useMemo(() => {
    if (!match || !sources || sources.length === 0) {
      return {};
    }
    return {
      aggregate: {
        label: "Aggregate",
        color: "#00ff88",
      },
      ...sources.reduce(
        (acc, source, index) => {
          const colors = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];
          acc[source.sourceName] = {
            label: source.sourceName,
            color: colors[index % colors.length],
          };
          return acc;
        },
        {} as Record<string, { label: string; color: string }>
      ),
    };
  }, [match, sources]);

  // Early returns - must be after all hooks
  if (!match) {
    return (
      <div className="terminal-card p-4">
        <div className="py-8 text-center">
          <Database className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Select a match to compare sources</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Click on a match in the table above to see detailed comparison
          </p>
        </div>
      </div>
    );
  }

  if (!match.sources || match.sources.length === 0) {
    return (
      <div className="terminal-card p-4">
        <div className="py-8 text-center">
          <Database className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No source data available</p>
        </div>
      </div>
    );
  }

  // Check for discrepancies (using percentage difference > 5%)
  const hasDiscrepancy = sources.some((source) => {
    const homeDiff = Math.abs(source.odds.home - calculatedAggregates.home);
    const homeDiffPercent = calculatedAggregates.home > 0 ? homeDiff / calculatedAggregates.home : 0;
    
    const awayDiff = Math.abs(source.odds.away - calculatedAggregates.away);
    const awayDiffPercent = calculatedAggregates.away > 0 ? awayDiff / calculatedAggregates.away : 0;
    
    return homeDiffPercent > 0.05 || awayDiffPercent > 0.05;
  });

  const getDiscrepancyMessage = (sourceName?: string) => {
    const targetSource = sourceName
      ? sources.find((s) => s.sourceName === sourceName)
      : sources.find((source) => {
          const homeDiff = Math.abs(source.odds.home - calculatedAggregates.home);
          const homeDiffPercent = calculatedAggregates.home > 0 ? homeDiff / calculatedAggregates.home : 0;
          return homeDiffPercent > 0.05;
        });

    if (targetSource) {
      const diffValue = targetSource.odds.home - calculatedAggregates.home;
      const diff = diffValue.toFixed(2);
      return `${targetSource.sourceName} predicts ${targetSource.odds.home.toFixed(2)} vs consensus ${calculatedAggregates.home.toFixed(2)} (diff: ${diffValue > 0 ? "+" : ""}${diff})`;
    }
    return null;
  };

  return (
    <div className={`terminal-card min-h-0 p-3 ${!mounted ? "overflow-y-hidden" : ""}`}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-primary" />
          <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-foreground">
            <span>ANALYST COMPARISON:</span>
            <TeamLogo team={match.homeTeam} sport={match.sport.toLowerCase()} size="sm" />
            <span>{match.homeTeam.shortName}</span>
            <span className="text-muted-foreground">vs</span>
            <span>{match.awayTeam.shortName}</span>
            <TeamLogo team={match.awayTeam} sport={match.sport.toLowerCase()} size="sm" />
          </h3>
        </div>
        <div className="font-mono text-[10px] text-muted-foreground">{sources.length} analysts</div>
      </div>

      {/* Line Movement Chart - Disabled until real historical data is available */}
      {SHOW_HISTORICAL_CHART && mounted && chartData.length > 0 && (
        <div className="mt-3 border-t border-border pt-3">
          <div className="mb-3 px-4">
            <h4 className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-foreground">
              <TeamLogo team={match.homeTeam} sport={match.sport.toLowerCase()} size="sm" />
              <span>{match.homeTeam.shortName} WIN ODDS (6H)</span>
            </h4>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-border/50 pt-2 text-[10px]">
              {sources.map((source, index) => {
                const colors = ["#6b7280", "#9ca3af", "#d1d5db"];
                return (
                  <div key={source.sourceId} className="flex items-center gap-1.5">
                    <div
                      className="h-[2px] w-4 rounded-full"
                      style={{ backgroundColor: colors[index % colors.length] }}
                    ></div>
                    <span className="font-medium text-muted-foreground">{source.sourceName}</span>
                  </div>
                );
              })}
              <div className="flex items-center gap-1.5">
                <div
                  className="h-[2px] w-4 rounded-full bg-[#00ff88]"
                  style={{ boxShadow: "0 0 4px #00ff88" }}
                ></div>
                <span className="font-semibold text-[#00ff88]">Consensus</span>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-sm border border-border/50 bg-[#0a0a0a] shadow-lg">
            <ChartContainer config={chartConfig} className="h-[360px] w-full">
              <ComposedChart data={chartData} margin={{ top: 20, right: 40, left: 20, bottom: 20 }}>
                <defs>
                  <linearGradient id="aggregateGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00ff88" stopOpacity={0.3} />
                    <stop offset="50%" stopColor="#00ff88" stopOpacity={0.1} />
                    <stop offset="100%" stopColor="#00ff88" stopOpacity={0} />
                  </linearGradient>
                  <filter id="glow-aggregate" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <CartesianGrid
                  strokeDasharray="0"
                  stroke="#1a1a1a"
                  vertical={true}
                  horizontal={true}
                  strokeOpacity={0.5}
                />
                <XAxis
                  dataKey="time"
                  stroke="#404040"
                  style={{ fontSize: "11px", fontWeight: 500 }}
                  interval={4}
                  tick={{ fill: "#808080" }}
                  tickLine={false}
                  axisLine={{ stroke: "#2a2a2a" }}
                  height={40}
                  tickMargin={10}
                />
                <YAxis
                  stroke="#404040"
                  style={{ fontSize: "11px", fontWeight: 500 }}
                  tick={{ fill: "#808080" }}
                  tickLine={false}
                  axisLine={{ stroke: "#2a2a2a" }}
                  domain={["dataMin - 0.2", "dataMax + 0.2"]}
                  width={50}
                  tickMargin={10}
                  tickCount={5}
                  tickFormatter={(value) => value.toFixed(1)}
                  label={{
                    value: "Win Odds",
                    angle: -90,
                    position: "insideLeft",
                    style: { textAnchor: "middle", fill: "#808080", fontSize: "10px" },
                  }}
                />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  cursor={{ stroke: "#404040", strokeWidth: 1 }}
                />
                {/* Source lines */}
                {sources.map((source, index) => {
                  const colors = ["#6b7280", "#9ca3af", "#d1d5db"];
                  const color = colors[index % colors.length];
                  return (
                    <Line
                      key={source.sourceId}
                      type="monotone"
                      dataKey={source.sourceName}
                      stroke={color}
                      strokeWidth={1.5}
                      dot={false}
                      strokeOpacity={0.8}
                      isAnimationActive={false}
                    />
                  );
                })}
                {/* Area under aggregated line */}
                <Area
                  type="monotone"
                  dataKey="aggregate"
                  fill="url(#aggregateGradient)"
                  stroke="none"
                  isAnimationActive={false}
                  hide={true}
                />
                {/* Aggregated line with glow effect - hidden from tooltip */}
                <Line
                  key="aggregate-glow-far"
                  type="monotone"
                  dataKey="aggregate"
                  stroke="#00ff88"
                  strokeWidth={12}
                  dot={false}
                  strokeOpacity={0.08}
                  isAnimationActive={false}
                  hide={true}
                />
                <Line
                  key="aggregate-glow-outer"
                  type="monotone"
                  dataKey="aggregate"
                  stroke="#00ff88"
                  strokeWidth={8}
                  dot={false}
                  strokeOpacity={0.15}
                  isAnimationActive={false}
                  hide={true}
                />
                <Line
                  key="aggregate-glow"
                  type="monotone"
                  dataKey="aggregate"
                  stroke="#00ff88"
                  strokeWidth={5}
                  dot={false}
                  strokeOpacity={0.35}
                  filter="url(#glow-aggregate)"
                  isAnimationActive={false}
                  hide={true}
                />
                {/* Main aggregate line - shown in tooltip */}
                <Line
                  key="aggregate-main"
                  type="monotone"
                  dataKey="aggregate"
                  stroke="#00ff88"
                  strokeWidth={2.5}
                  dot={false}
                  strokeOpacity={1}
                  isAnimationActive={false}
                />
              </ComposedChart>
            </ChartContainer>
          </div>
        </div>
      )}

      {/* Table - moved below chart */}
      <div className="mt-3 w-full overflow-x-hidden border-t border-border pt-3">
        <Table className="w-full table-auto">
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="h-8 px-2 text-[10px] font-bold uppercase text-foreground">
                ANALYST
              </TableHead>
              <TableHead className="h-8 px-2 text-center text-[10px] font-bold uppercase text-foreground">
                <Tooltip>
                  <TooltipTrigger className="cursor-help">HOME</TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Odds for {match.homeTeam.name} to win</p>
                  </TooltipContent>
                </Tooltip>
              </TableHead>
              {match.aggregatedOdds.draw && (
                <TableHead className="h-8 px-2 text-center text-[10px] font-bold uppercase text-foreground">
                  <Tooltip>
                    <TooltipTrigger className="cursor-help">DRAW</TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Odds for a draw</p>
                    </TooltipContent>
                  </Tooltip>
                </TableHead>
              )}
              <TableHead className="h-8 px-2 text-center text-[10px] font-bold uppercase text-foreground">
                <Tooltip>
                  <TooltipTrigger className="cursor-help">AWAY</TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Odds for {match.awayTeam.name} to win</p>
                  </TooltipContent>
                </Tooltip>
              </TableHead>
              <TableHead className="h-8 px-2 text-center text-[10px] font-bold uppercase text-foreground">
                <Tooltip>
                  <TooltipTrigger className="cursor-help">MARGIN</TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Bookmaker margin (overround) - lower is better</p>
                  </TooltipContent>
                </Tooltip>
              </TableHead>
              <TableHead className="h-8 px-2 text-center text-[10px] font-bold uppercase text-foreground">
                <Tooltip>
                  <TooltipTrigger className="cursor-help">UPDATED</TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Last update time</p>
                  </TooltipContent>
                </Tooltip>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sources.map((source, index) => {
              const isDiscrepant =
                hasDiscrepancy &&
                (Math.abs(source.odds.home - calculatedAggregates.home) / (calculatedAggregates.home || 1) > 0.05 ||
                 Math.abs(source.odds.away - calculatedAggregates.away) / (calculatedAggregates.away || 1) > 0.05);

              // Calculate bookmaker margin
              const homeProbability = source.odds.home > 0 ? (1 / source.odds.home) * 100 : 0;
              const awayProbability = source.odds.away > 0 ? (1 / source.odds.away) * 100 : 0;
              const drawProbability = source.odds.draw && source.odds.draw > 0 ? (1 / source.odds.draw) * 100 : 0;
              const totalProbability = homeProbability + awayProbability + drawProbability;
              const margin = totalProbability - 100;

              // Format timestamp
              const timeAgo = source.timestamp ? (() => {
                const now = new Date().getTime();
                const then = new Date(source.timestamp).getTime();
                const diffMinutes = Math.floor((now - then) / (1000 * 60));
                if (diffMinutes < 1) return "now";
                if (diffMinutes < 60) return `${diffMinutes}m`;
                const diffHours = Math.floor(diffMinutes / 60);
                return `${diffHours}h`;
              })() : "-";

              return (
                <TableRow
                  key={source.sourceId}
                  className={`h-8 border-border transition-colors hover:bg-muted/20 ${
                    isDiscrepant ? "border-l-2 border-l-destructive" : ""
                  }`}
                >
                  <TableCell className="px-2 text-[10px] font-semibold text-foreground">
                    {isDiscrepant ? (
                      <Tooltip>
                        <TooltipTrigger className="cursor-help text-destructive">
                          {source.sourceName}
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">
                            {getDiscrepancyMessage(source.sourceName) ||
                              "This analyst's odds deviate significantly from the average."}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      source.sourceName
                    )}
                  </TableCell>
                  <TableCell
                    className={`px-2 text-center font-mono text-[10px] font-semibold ${
                      isDiscrepant ? "text-destructive" : "text-foreground"
                    }`}
                  >
                    {source.odds.home.toFixed(2)}
                  </TableCell>
                  {match.aggregatedOdds.draw && (
                    <TableCell className="px-2 text-center font-mono text-[10px] text-foreground">
                      {source.odds.draw ? source.odds.draw.toFixed(2) : "-"}
                    </TableCell>
                  )}
                  <TableCell className="px-2 text-center font-mono text-[10px] text-foreground">
                    {source.odds.away.toFixed(2)}
                  </TableCell>
                  <TableCell className="px-2 text-center">
                    <span className={`font-mono text-[10px] font-semibold ${
                      margin < 3 ? "text-positive" : 
                      margin < 5 ? "text-foreground" : "text-destructive"
                    }`}>
                      {margin.toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell className="px-2 text-center">
                    <span className="font-mono text-[9px] text-muted-foreground">
                      {timeAgo}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
              {/* Aggregate row */}
            <TableRow className="h-8 border-t-2 border-primary/30 bg-primary/5 hover:bg-primary/10">
              <TableCell className="px-2 text-[10px] font-bold text-primary">CONSENSUS</TableCell>
              <TableCell className="px-2 text-center font-mono text-[10px] font-bold text-primary">
                {calculatedAggregates.home.toFixed(2)}
              </TableCell>
              {match.aggregatedOdds.draw && (
                <TableCell className="px-2 text-center font-mono text-[10px] font-bold text-primary">
                  {calculatedAggregates.draw ? calculatedAggregates.draw.toFixed(2) : "-"}
                </TableCell>
              )}
              <TableCell className="px-2 text-center font-mono text-[10px] font-bold text-primary">
                {calculatedAggregates.away.toFixed(2)}
              </TableCell>
              <TableCell className="px-2 text-center">
                {(() => {
                  // Calculate average margin
                  const margins = sources.map(s => {
                    const h = s.odds.home > 0 ? (1 / s.odds.home) * 100 : 0;
                    const a = s.odds.away > 0 ? (1 / s.odds.away) * 100 : 0;
                    const d = s.odds.draw && s.odds.draw > 0 ? (1 / s.odds.draw) * 100 : 0;
                    return (h + a + d) - 100;
                  });
                  const avgMargin = margins.reduce((sum, m) => sum + m, 0) / margins.length;
                  return (
                    <span className="font-mono text-[10px] font-bold text-primary">
                      {avgMargin.toFixed(1)}%
                    </span>
                  );
                })()}
              </TableCell>
              <TableCell className="px-2 text-center">
                <Badge className="border-primary/50 bg-primary/20 px-1.5 py-0 text-[9px] text-primary">
                  AVG
                </Badge>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* Summary */}
      <div className="mt-2 border-t border-border pt-2">
        <div className="grid grid-cols-2 gap-2 text-[10px]">
          <div className="border border-border bg-muted/30 p-1.5 text-center">
            <div className="mb-0.5 text-muted-foreground">Sources</div>
            <div className="font-mono text-base">{sources.length}</div>
          </div>
          <div className="border border-border bg-muted/30 p-1.5 text-center">
            <div className="mb-0.5 text-muted-foreground">Spread</div>
            <div
              className={`font-mono text-base ${
                match.spreadQuality === "low"
                  ? "text-positive"
                  : match.spreadQuality === "high"
                    ? "text-destructive"
                    : ""
              }`}
            >
              ±{match.spread.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

MultiSourceComparison.displayName = "MultiSourceComparison";

export default MultiSourceComparison;
