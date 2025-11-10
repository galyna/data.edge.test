import { useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Database, TrendingUp } from "lucide-react";
import { Match } from "@/types/match";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import React from "react";

interface MultiSourceComparisonProps {
  match: Match | null;
  matches?: Match[];
  onMatchSelect?: (match: Match) => void;
}

const MultiSourceComparison = ({ match, matches = [], onMatchSelect }: MultiSourceComparisonProps) => {
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
                    <span className="text-lg">{m.homeTeam.logo}</span>
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
  const hasDiscrepancy = match.sources.some((source) => {
    const homeDiff = Math.abs(source.odds.home - match.aggregatedOdds.home);
    const awayDiff = Math.abs(source.odds.away - match.aggregatedOdds.away);
    return homeDiff > 0.1 || awayDiff > 0.1;
  });

  const getDiscrepancyMessage = () => {
    const discrepancies = match.sources.filter((source) => {
      const homeDiff = Math.abs(source.odds.home - match.aggregatedOdds.home);
      return homeDiff > 0.1;
    });

    if (discrepancies.length > 0) {
      const source = discrepancies[0];
      return `Score mismatch detected. ${source.sourceName}: ${source.odds.home.toFixed(2)}, Aggregate: ${match.aggregatedOdds.home.toFixed(2)}`;
    }
    return null;
  };

  // Generate historical data for chart (simulate last 6 hours)
  const chartData = useMemo(() => {
    const data = [];
    const now = Date.now();
    const hours = 6;
    const points = 12;
    
    // Use a seed based on match ID for consistent data
    let seed = match.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    const seededRandom = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    
    for (let i = points; i >= 0; i--) {
      const time = new Date(now - (i * hours * 60 * 60 * 1000) / points);
      const timeLabel = time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      
      const point: Record<string, string | number> = {
        time: timeLabel,
        aggregate: match.aggregatedOdds.home + (seededRandom() - 0.5) * 0.2,
      };
      
      match.sources.forEach((source) => {
        point[source.sourceName] = source.odds.home + (seededRandom() - 0.5) * 0.15;
      });
      
      data.push(point);
    }
    
    return data;
  }, [match.id, match.aggregatedOdds.home, match.sources]);
  
  const chartConfig = useMemo(() => ({
    aggregate: {
      label: "Aggregate",
      color: "#00ff88",
    },
    ...match.sources.reduce((acc, source, index) => {
      // Light grey-blue colors for individual sources
      const sourceColors = ["#9ca3af", "#a5b4c3", "#b0c4d6", "#9db5d0", "#a8c0d8"];
      acc[source.sourceName] = {
        label: source.sourceName,
        color: sourceColors[index % sourceColors.length],
      };
      return acc;
    }, {} as Record<string, { label: string; color: string }>),
  }), [match.sources]);

  return (
    <div className="terminal-card p-3">
        <div className="flex items-center gap-2 mb-3">
          <Database className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">
            MULTI-SOURCE: {match.homeTeam.shortName} vs {match.awayTeam.shortName}
          </h3>
        </div>

      {hasDiscrepancy && (
        <div className="mb-2 border border-border bg-muted/10 p-2">
          <div className="flex items-start gap-1.5">
            <AlertTriangle className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-medium text-foreground mb-0.5">
                Discrepancy
              </div>
              <div className="text-[10px] text-muted-foreground font-mono">
                {getDiscrepancyMessage()}
              </div>
            </div>
          </div>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-foreground font-bold text-[10px] uppercase h-8 px-2">
                  SOURCE
                </TableHead>
                <TableHead className="text-foreground font-bold text-[10px] uppercase h-8 px-2 text-center">
                  SCORE
                </TableHead>
                <TableHead className="text-foreground font-bold text-[10px] uppercase h-8 px-2 text-center">
                  STATUS
                </TableHead>
                <TableHead className="text-foreground font-bold text-[10px] uppercase h-8 px-2 text-center">
                  LATENCY
                </TableHead>
                <TableHead className="text-foreground font-bold text-[10px] uppercase h-8 px-2 text-right">
                  UPDATE
                </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {match.sources.map((source, index) => {
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
                  source.latency > 300 ? "text-destructive" : ""
                }`}>
                  {source.latency}ms
                </TableCell>
                <TableCell className="text-right text-[10px] text-muted-foreground px-2 font-mono">
                  {new Date(source.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

        {/* Line Movement Chart */}
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h4 className="text-xs font-semibold uppercase tracking-wide text-foreground">
              LINE MOVEMENT GRAPH
            </h4>
            <span className="text-[10px] text-muted-foreground ml-auto">Multi-source tracking - last 6 hours</span>
          </div>
          
          <ChartContainer config={chartConfig} className="h-[280px] w-full">
            <defs>
              {/* Intense lightning-like glow filters for aggregated line */}
              <filter id="glow-aggregate-outer" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="12" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                </feMerge>
              </filter>
              <filter id="glow-aggregate-large" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                </feMerge>
              </filter>
              <filter id="glow-aggregate-medium" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                </feMerge>
              </filter>
              <filter id="glow-aggregate-close" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              {/* Subtle glow for source lines */}
              <filter id="glow-source" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis
                dataKey="time"
                stroke="hsl(var(--foreground))"
                style={{ fontSize: "11px", fontWeight: 500 }}
                interval="preserveStartEnd"
                tick={{ fill: "hsl(var(--foreground))" }}
              />
              <YAxis
                stroke="hsl(var(--foreground))"
                style={{ fontSize: "11px", fontWeight: 500 }}
                tick={{ fill: "hsl(var(--foreground))" }}
              />
              <ChartLegend 
                verticalAlign="top"
                align="right"
                content={<ChartLegendContent />}
              />
              <ChartTooltip 
                content={(props) => {
                  if (!props.active || !props.payload) return null;
                  // Filter out duplicate entries by dataKey (keep only the first occurrence)
                  const seen = new Set();
                  const uniquePayload = props.payload.filter((item) => {
                    const key = item.dataKey || item.name;
                    if (seen.has(key)) return false;
                    seen.add(key);
                    return true;
                  });
                  return <ChartTooltipContent {...props} payload={uniquePayload} />;
                }} 
              />
              {/* Aggregated line with intense lightning-like glow - multiple layers */}
              <Line
                type="monotone"
                dataKey="aggregate"
                stroke="#00ff88"
                strokeWidth={10}
                dot={false}
                strokeOpacity={0.12}
                filter="url(#glow-aggregate-outer)"
              />
              <Line
                type="monotone"
                dataKey="aggregate"
                stroke="#00ff88"
                strokeWidth={8}
                dot={false}
                strokeOpacity={0.2}
                filter="url(#glow-aggregate-large)"
              />
              <Line
                type="monotone"
                dataKey="aggregate"
                stroke="#00ff88"
                strokeWidth={6}
                dot={false}
                strokeOpacity={0.3}
                filter="url(#glow-aggregate-medium)"
              />
              <Line
                type="monotone"
                dataKey="aggregate"
                stroke="#00ff88"
                strokeWidth={5}
                dot={false}
                strokeOpacity={0.5}
                filter="url(#glow-aggregate-close)"
              />
              <Line
                type="monotone"
                dataKey="aggregate"
                stroke="#00ff88"
                strokeWidth={4}
                dot={false}
                strokeOpacity={0.7}
              />
              <Line
                type="monotone"
                dataKey="aggregate"
                stroke="#00ff88"
                strokeWidth={3}
                dot={false}
                strokeOpacity={1}
              />
              {match.sources.map((source) => {
                const sourceColor = chartConfig[source.sourceName]?.color || "#9ca3af";
                return (
                  <React.Fragment key={source.sourceId}>
                    {/* Glow layer - visual effect only, duplicates filtered in tooltip */}
                    <Line
                      type="monotone"
                      dataKey={source.sourceName}
                      stroke={sourceColor}
                      strokeWidth={3}
                      dot={false}
                      strokeOpacity={0.25}
                      filter="url(#glow-source)"
                      isAnimationActive={false}
                    />
                    {/* Main line - visible in chart and tooltip */}
                    <Line
                      type="monotone"
                      dataKey={source.sourceName}
                      stroke={sourceColor}
                      strokeWidth={1.5}
                      dot={false}
                      strokeOpacity={0.85}
                      isAnimationActive={false}
                    />
                  </React.Fragment>
                );
              })}
            </LineChart>
          </ChartContainer>
        </div>

      {/* Summary */}
      <div className="mt-2 pt-2 border-t border-border">
        <div className="grid grid-cols-3 gap-2 text-[10px]">
          <div className="text-center p-1.5 bg-muted/30 border border-border">
            <div className="text-muted-foreground mb-0.5">Sources</div>
            <div className="font-mono text-base">{match.sources.length}</div>
          </div>
          <div className="text-center p-1.5 bg-muted/30 border border-border">
            <div className="text-muted-foreground mb-0.5">Latency</div>
            <div className="font-mono text-base">
              {Math.round(
                match.sources.reduce((sum, s) => sum + s.latency, 0) / match.sources.length
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
