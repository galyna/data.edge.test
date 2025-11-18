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

  useEffect(() => {
    setMounted(true);
  }, []);

  // Ensure we have sources array (moved before useMemo hooks)
  const sources = useMemo(() => match?.sources || [], [match?.sources]);

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

    for (let i = points; i >= 0; i--) {
      const time = new Date(now - (i * hours * 60 * 60 * 1000) / points);
      // Use UTC to avoid locale differences between server and client
      const hours24 = time.getUTCHours().toString().padStart(2, "0");
      const minutes = time.getUTCMinutes().toString().padStart(2, "0");
      const timeLabel = `${hours24}:${minutes}`;

      // Add some trend and variation to make it more interesting
      const trendFactor = ((points - i) / points) * 0.3; // slight upward trend
      const waveFactor = Math.sin((i / points) * Math.PI * 2) * 0.15; // sine wave variation

      const point: Record<string, string | number> = {
        time: timeLabel,
        aggregate:
          match.aggregatedOdds.home + trendFactor + waveFactor + (seededRandom() - 0.5) * 0.15,
      };

      sources.forEach((source, idx) => {
        // Each source has slightly different behavior
        const sourceWave = Math.sin((i / points) * Math.PI * 2 + idx) * 0.12;
        const sourceTrend = ((points - i) / points) * 0.25 * (1 + idx * 0.1);
        point[source.sourceName] =
          source.odds.home + sourceTrend + sourceWave + (seededRandom() - 0.5) * 0.12;
      });

      data.push(point);
    }

    return data;
  }, [match, mounted, sources]);

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

  // Show list of matches if no match selected
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

  // Check for discrepancies
  const hasDiscrepancy = sources.some((source) => {
    const homeDiff = Math.abs(source.odds.home - match.aggregatedOdds.home);
    const awayDiff = Math.abs(source.odds.away - match.aggregatedOdds.away);
    return homeDiff > 0.1 || awayDiff > 0.1;
  });

  const getDiscrepancyMessage = (sourceName?: string) => {
    const targetSource = sourceName
      ? sources.find((s) => s.sourceName === sourceName)
      : sources.find((source) => {
          const homeDiff = Math.abs(source.odds.home - match.aggregatedOdds.home);
          return homeDiff > 0.1;
        });

    if (targetSource) {
      const diffValue = targetSource.odds.home - match.aggregatedOdds.home;
      const diff = diffValue.toFixed(2);
      return `${targetSource.sourceName} predicts ${targetSource.odds.home.toFixed(2)} vs consensus ${match.aggregatedOdds.home.toFixed(2)} (diff: ${diffValue > 0 ? "+" : ""}${diff})`;
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

      {/* Line Movement Chart */}
      {mounted && chartData.length > 0 && (
        <div className="mt-3 border-t border-border pt-3">
          <div className="mb-3 px-4">
            <h4 className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-foreground">
              ODDS MOVEMENT:
              <TeamLogo team={match.homeTeam} sport={match.sport.toLowerCase()} size="sm" />
              <span>{match.homeTeam.name} WIN</span>
            </h4>
            <p className="mb-2 text-[10px] leading-relaxed text-muted-foreground">
              Shows how odds for{" "}
              <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                {match.homeTeam.name} to win
              </span>{" "}
              have changed over the last 6 hours. Each line represents predictions from our
              analysts. The green line is the aggregated consensus.
            </p>
            {/* Compact horizontal legend */}
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
                  <TooltipTrigger className="cursor-help">SCORE PREDICTION</TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Predicted final score</p>
                  </TooltipContent>
                </Tooltip>
              </TableHead>
              <TableHead className="h-8 px-2 text-center text-[10px] font-bold uppercase text-foreground">
                STATUS
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sources.map((source, index) => {
              const isDiscrepant =
                hasDiscrepancy &&
                (Math.abs(source.odds.home - match.aggregatedOdds.home) > 0.1 ||
                  Math.abs(source.odds.away - match.aggregatedOdds.away) > 0.1);

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
                  <TableCell className="px-2 text-center font-mono text-[10px] text-foreground">
                    {source.scorePrediction
                      ? `${source.scorePrediction.home}-${source.scorePrediction.away}`
                      : "-"}
                  </TableCell>
                  <TableCell className="px-2 text-center">
                    <Tooltip>
                      <TooltipTrigger>
                        {index === 0 ? (
                          <Badge className="border-primary/30 bg-primary/20 px-1.5 py-0 text-[9px] text-primary">
                            P
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="px-1.5 py-0 text-[9px]">
                            S
                          </Badge>
                        )}
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">
                          {index === 0 ? "Primary Source" : "Secondary Source"}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
            {/* Aggregate row */}
            <TableRow className="h-8 border-t-2 border-primary/30 bg-primary/5 hover:bg-primary/10">
              <TableCell className="px-2 text-[10px] font-bold text-primary">AGGREGATE</TableCell>
              <TableCell className="px-2 text-center font-mono text-[10px] font-bold text-primary">
                {match.aggregatedOdds.home.toFixed(2)}
              </TableCell>
              {match.aggregatedOdds.draw && (
                <TableCell className="px-2 text-center font-mono text-[10px] font-bold text-primary">
                  {match.aggregatedOdds.draw.toFixed(2)}
                </TableCell>
              )}
              <TableCell className="px-2 text-center font-mono text-[10px] font-bold text-primary">
                {match.aggregatedOdds.away.toFixed(2)}
              </TableCell>
              <TableCell className="px-2 text-center font-mono text-[10px] text-muted-foreground">
                {(() => {
                  const predictions = sources
                    .filter(
                      (s) =>
                        s.scorePrediction &&
                        typeof s.scorePrediction.home === "number" &&
                        typeof s.scorePrediction.away === "number"
                    )
                    .map((s) => s.scorePrediction!);
                  if (predictions.length === 0) return "-";
                  const avgHome = Math.round(
                    predictions.reduce((sum, p) => sum + p.home, 0) / predictions.length
                  );
                  const avgAway = Math.round(
                    predictions.reduce((sum, p) => sum + p.away, 0) / predictions.length
                  );
                  return `${avgHome}-${avgAway}`;
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
