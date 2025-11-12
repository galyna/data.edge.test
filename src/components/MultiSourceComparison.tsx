"use client";

import { useMemo, useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Database, TrendingUp } from "lucide-react";
import { Match } from "@/types/match";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Area } from "recharts";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { TeamLogo } from "@/components/TeamLogo";
import React from "react";

interface MultiSourceComparisonProps {
  match: Match | null;
  matches?: Match[];
  onMatchSelect?: (match: Match) => void;
}

const MultiSourceComparison = ({ match, matches = [], onMatchSelect }: MultiSourceComparisonProps) => {
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
      const hours24 = time.getUTCHours().toString().padStart(2, '0');
      const minutes = time.getUTCMinutes().toString().padStart(2, '0');
      const timeLabel = `${hours24}:${minutes}`;
      
      // Add some trend and variation to make it more interesting
      const trendFactor = (points - i) / points * 0.3; // slight upward trend
      const waveFactor = Math.sin((i / points) * Math.PI * 2) * 0.15; // sine wave variation
      
      const point: Record<string, string | number> = {
        time: timeLabel,
        aggregate: match.aggregatedOdds.home + trendFactor + waveFactor + (seededRandom() - 0.5) * 0.15,
      };
      
      sources.forEach((source, idx) => {
        // Each source has slightly different behavior
        const sourceWave = Math.sin((i / points) * Math.PI * 2 + idx) * 0.12;
        const sourceTrend = (points - i) / points * 0.25 * (1 + idx * 0.1);
        point[source.sourceName] = source.odds.home + sourceTrend + sourceWave + (seededRandom() - 0.5) * 0.12;
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
      ...sources.reduce((acc, source, index) => {
        const colors = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];
        acc[source.sourceName] = {
          label: source.sourceName,
          color: colors[index % colors.length],
        };
        return acc;
      }, {} as Record<string, { label: string; color: string }>),
    };
  }, [match, sources]);

  // Show list of matches if no match selected
  if (!match) {
    if (matches.length > 0) {
      return (
        <div className="terminal-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Database className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold uppercase tracking-wide">
              Select Match for Source Comparison
            </h3>
          </div>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {matches.slice(0, 10).map((m) => (
              <div
                key={m.id}
                className="border border-border p-3 hover-lift cursor-pointer transition-all hover:border-primary/50"
                onClick={() => onMatchSelect?.(m)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TeamLogo team={m.homeTeam} sport={m.sport.toLowerCase()} size="sm" />
                    <div className="text-xs">
                      <div className="font-medium">{m.homeTeam.name} vs {m.awayTeam.name}</div>
                      <div className="text-muted-foreground">{m.league}</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    {m.sources?.length || 0} sources
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    return (
      <div className="terminal-card p-4">
        <div className="text-center py-8">
          <Database className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Select a match to compare sources</p>
          <p className="text-xs text-muted-foreground mt-1">
            Click on a match in the table above to see detailed comparison
          </p>
        </div>
      </div>
    );
  }

  if (!match.sources || match.sources.length === 0) {
    return (
      <div className="terminal-card p-4">
        <div className="text-center py-8">
          <Database className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
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

  const getDiscrepancyMessage = () => {
    const discrepancies = sources.filter((source) => {
      const homeDiff = Math.abs(source.odds.home - match.aggregatedOdds.home);
      return homeDiff > 0.1;
    });

    if (discrepancies.length > 0) {
      const source = discrepancies[0];
      const diffValue = source.odds.home - match.aggregatedOdds.home;
      const diff = diffValue.toFixed(2);
      return `${source.sourceName} predicts ${source.odds.home.toFixed(2)} vs consensus ${match.aggregatedOdds.home.toFixed(2)} (diff: ${diffValue > 0 ? '+' : ''}${diff})`;
    }
    return null;
  };

  return (
    <div className={`terminal-card p-3 min-h-0 ${!mounted ? 'overflow-y-hidden' : ''}`}>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold uppercase tracking-wide text-foreground flex items-center gap-2">
              <span>ANALYST COMPARISON:</span>
              <TeamLogo team={match.homeTeam} sport={match.sport.toLowerCase()} size="sm" />
              <span>{match.homeTeam.shortName}</span>
              <span className="text-muted-foreground">vs</span>
              <span>{match.awayTeam.shortName}</span>
              <TeamLogo team={match.awayTeam} sport={match.sport.toLowerCase()} size="sm" />
            </h3>
          </div>
          <div className="text-[10px] text-muted-foreground font-mono">
            {sources.length} analysts
          </div>
        </div>
        
        {/* Explanation */}
        <div className="mb-2 text-[9px] text-muted-foreground italic">
          Comparing predictions from our analysts. Each provides odds estimates with different response times. The aggregate row shows the consensus average.
        </div>

      {hasDiscrepancy && (
        <div className="mb-2 border border-border bg-muted/10 p-2">
          <div className="flex items-start gap-1.5">
            <AlertTriangle className="h-3 w-3 text-yellow-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-medium text-foreground mb-0.5">
                Prediction Variance Detected
              </div>
              <div className="text-[10px] text-muted-foreground font-mono mb-1">
                {getDiscrepancyMessage()}
              </div>
              <div className="text-[9px] text-muted-foreground italic">
                One analyst&apos;s prediction differs significantly from the consensus average. This may indicate a unique insight or data delay.
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="w-full overflow-x-hidden">
        <Table className="w-full table-auto">
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-foreground font-bold text-[10px] uppercase h-8 px-2">
                    ANALYST
                  </TableHead>
                  <TableHead className="text-foreground font-bold text-[10px] uppercase h-8 px-2 text-center">
                    SCORE
                  </TableHead>
                  <TableHead className="text-foreground font-bold text-[10px] uppercase h-8 px-2 text-center">
                    STATUS
                  </TableHead>
                  <TableHead className="text-foreground font-bold text-[10px] uppercase h-8 px-2 text-center">
                    <Tooltip>
                      <TooltipTrigger className="cursor-help">
                        RESPONSE TIME
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Time it takes for analyst to provide their prediction (lower is better)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableHead>
                  <TableHead className="text-foreground font-bold text-[10px] uppercase h-8 px-2 text-right">
                    LAST UPDATE
                  </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sources.map((source, index) => {
              const isDiscrepant = hasDiscrepancy && 
                (Math.abs(source.odds.home - match.aggregatedOdds.home) > 0.1 ||
                 Math.abs(source.odds.away - match.aggregatedOdds.away) > 0.1);

              return (
                <TableRow
                  key={source.sourceId}
                  className={`border-border hover:bg-muted/20 h-8 ${
                    isDiscrepant ? "bg-destructive/10" : ""
                  }`}
                >
                  <TableCell className="font-semibold text-[10px] px-2 text-foreground">
                    {source.sourceName}
                  </TableCell>
                  <TableCell className={`text-center font-mono text-[10px] px-2 font-semibold ${
                    isDiscrepant ? "text-destructive" : "text-foreground"
                  }`}>
                    {match.liveData 
                      ? `${match.liveData.homeScore}-${match.liveData.awayScore}`
                      : source.odds.draw 
                        ? `${source.odds.home.toFixed(2)}/${source.odds.draw.toFixed(2)}/${source.odds.away.toFixed(2)}`
                        : `${source.odds.home.toFixed(2)}/${source.odds.away.toFixed(2)}`
                    }
                  </TableCell>
                  <TableCell className="text-center px-2">
                    {index === 0 ? (
                      <Badge className="text-[9px] px-1.5 py-0">P</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[9px] px-1.5 py-0">S</Badge>
                    )}
                  </TableCell>
                  <TableCell className={`text-center font-mono text-[10px] px-2 ${
                    source.latency > 300 ? "text-destructive" : source.latency > 200 ? "text-yellow-500" : ""
                  }`}>
                    <Tooltip>
                      <TooltipTrigger className="cursor-help">
                        {source.latency}ms
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Time delay: {source.latency}ms</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {source.latency < 200 ? "Fast response" : source.latency < 300 ? "Moderate delay" : "Slow response"}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                  <TableCell className="text-right text-[10px] text-muted-foreground px-2 font-mono" suppressHydrationWarning>
                    {(() => {
                      if (!mounted) return "";
                      const date = new Date(source.timestamp);
                      const hours = date.getHours();
                      const minutes = date.getMinutes().toString().padStart(2, '0');
                      const ampm = hours >= 12 ? 'PM' : 'AM';
                      const displayHours = hours % 12 || 12;
                      return `${displayHours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
                    })()}
                  </TableCell>
                </TableRow>
              );
            })}
          {/* Aggregate row */}
          <TableRow className="border-t-2 border-primary/30 bg-primary/5 hover:bg-primary/10 h-8">
            <TableCell className="font-bold text-[10px] px-2 text-primary">
              AGGREGATE
            </TableCell>
            <TableCell className="text-center font-mono text-[10px] px-2 font-bold text-primary">
              {match.liveData 
                ? `${match.liveData.homeScore}-${match.liveData.awayScore}`
                : match.aggregatedOdds.draw
                  ? `${match.aggregatedOdds.home.toFixed(2)}/${match.aggregatedOdds.draw.toFixed(2)}/${match.aggregatedOdds.away.toFixed(2)}`
                  : `${match.aggregatedOdds.home.toFixed(2)}/${match.aggregatedOdds.away.toFixed(2)}`
              }
            </TableCell>
            <TableCell className="text-center px-2">
              <Badge className="text-[9px] px-1.5 py-0 bg-primary/20 text-primary border-primary/50">AVG</Badge>
            </TableCell>
            <TableCell className="text-center font-mono text-[10px] px-2 text-primary">
              <Tooltip>
                <TooltipTrigger className="cursor-help">
                  {Math.round(sources.reduce((sum, s) => sum + s.latency, 0) / sources.length)}ms
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Average response time across all analysts</p>
                </TooltipContent>
              </Tooltip>
            </TableCell>
            <TableCell className="text-right text-[10px] text-muted-foreground px-2 font-mono" suppressHydrationWarning>
              {(() => {
                if (!mounted) return "";
                const latestTimestamp = Math.max(...sources.map(s => new Date(s.timestamp).getTime()));
                const date = new Date(latestTimestamp);
                const hours = date.getHours();
                const minutes = date.getMinutes().toString().padStart(2, '0');
                const ampm = hours >= 12 ? 'PM' : 'AM';
                const displayHours = hours % 12 || 12;
                return `${displayHours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
              })()}
            </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

        {/* Line Movement Chart */}
        {mounted && chartData.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="mb-3">
            <h4 className="text-[11px] font-semibold uppercase tracking-wide text-foreground mb-1 flex items-center gap-2">
              ODDS MOVEMENT: 
              <TeamLogo team={match.homeTeam} sport={match.sport.toLowerCase()} size="sm" />
              <span>{match.homeTeam.name} WIN</span>
            </h4>
            <p className="text-[10px] text-muted-foreground leading-relaxed mb-2">
              Shows how odds for <span className="font-medium text-foreground inline-flex items-center gap-1.5">

                {match.homeTeam.name} to win
              </span> have changed over the last 6 hours. 
              Each line represents predictions from our analysts. The green line is the aggregated consensus.
            </p>
            {/* Compact horizontal legend */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] pt-2 border-t border-border/50">
              {sources.map((source, index) => {
                const colors = ["#6b7280", "#9ca3af", "#d1d5db"];
                return (
                  <div key={source.sourceId} className="flex items-center gap-1.5">
                    <div className="w-4 h-[2px] rounded-full" style={{ backgroundColor: colors[index % colors.length] }}></div>
                    <span className="text-muted-foreground font-medium">{source.sourceName}</span>
                  </div>
                );
              })}
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-[2px] bg-[#00ff88] rounded-full" style={{ boxShadow: '0 0 4px #00ff88' }}></div>
                <span className="text-[#00ff88] font-semibold">Consensus</span>
              </div>
            </div>
          </div>
          
          <div className="bg-[#0a0a0a] border border-border/50 rounded-sm p-4 shadow-lg">
            <ChartContainer config={chartConfig} className="h-[360px] w-full">
              <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                <defs>
                  <linearGradient id="aggregateGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00ff88" stopOpacity={0.3}/>
                    <stop offset="50%" stopColor="#00ff88" stopOpacity={0.1}/>
                    <stop offset="100%" stopColor="#00ff88" stopOpacity={0}/>
                  </linearGradient>
                  <filter id="glow-aggregate" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
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
                  interval={2}
                  tick={{ fill: "#808080" }}
                  tickLine={false}
                  axisLine={{ stroke: "#2a2a2a" }}
                  height={40}
                />
                <YAxis
                  stroke="#404040"
                  style={{ fontSize: "11px", fontWeight: 500 }}
                  tick={{ fill: "#808080" }}
                  tickLine={false}
                  axisLine={{ stroke: "#2a2a2a" }}
                  domain={['dataMin - 0.2', 'dataMax + 0.2']}
                  width={50}
                  label={{ value: 'Win Odds', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#808080', fontSize: '10px' } }}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  cursor={{ stroke: '#404040', strokeWidth: 1 }}
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

      {/* Summary */}
      <div className="mt-2 pt-2 border-t border-border">
        <div className="grid grid-cols-3 gap-2 text-[10px]">
          <div className="text-center p-1.5 bg-muted/30 border border-border">
            <div className="text-muted-foreground mb-0.5">Sources</div>
            <div className="font-mono text-base">{sources.length}</div>
          </div>
          <div className="text-center p-1.5 bg-muted/30 border border-border">
            <div className="text-muted-foreground mb-0.5">Latency</div>
            <div className="font-mono text-base">
              {Math.round(
                sources.reduce((sum, s) => sum + s.latency, 0) / sources.length
              )}ms
            </div>
          </div>
          <div className="text-center p-1.5 bg-muted/30 border border-border">
            <div className="text-muted-foreground mb-0.5">Spread</div>
            <div className={`font-mono text-base ${
              match.spreadQuality === "low" ? "text-positive" : 
              match.spreadQuality === "high" ? "text-destructive" : ""
            }`}>
              ±{match.spread.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiSourceComparison;
