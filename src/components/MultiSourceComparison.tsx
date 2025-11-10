import { useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Database, TrendingUp } from "lucide-react";
import { Match } from "@/types/match";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";

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
      color: "hsl(var(--primary))",
    },
    ...match.sources.reduce((acc, source, index) => {
      acc[source.sourceName] = {
        label: source.sourceName,
        color: `hsl(${200 + index * 40}, 70%, 55%)`,
      };
      return acc;
    }, {} as Record<string, { label: string; color: string }>),
  }), [match.sources]);

  return (
    <div className="terminal-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Database className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold uppercase tracking-wide">
          Multi-Source Comparison: {match.homeTeam.name} vs {match.awayTeam.name}
        </h3>
      </div>

      {hasDiscrepancy && (
        <div className="mb-3 border border-border bg-muted/10 p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-foreground mb-1">
                Data Discrepancy Detected
              </div>
              <div className="text-xs text-muted-foreground font-mono">
                {getDiscrepancyMessage()}
              </div>
              <div className="text-xs text-muted-foreground mt-1.5">
                Possible inefficiency detected
              </div>
            </div>
          </div>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-muted-foreground font-semibold text-xs uppercase h-9 px-3">
              Source
            </TableHead>
            <TableHead className="text-muted-foreground font-semibold text-xs uppercase h-9 px-3 text-center">
              Score
            </TableHead>
            <TableHead className="text-muted-foreground font-semibold text-xs uppercase h-9 px-3 text-center">
              Status
            </TableHead>
            <TableHead className="text-muted-foreground font-semibold text-xs uppercase h-9 px-3 text-center">
              Latency
            </TableHead>
            <TableHead className="text-muted-foreground font-semibold text-xs uppercase h-9 px-3 text-right">
              Last Update
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
                className={`border-border hover-lift ${
                  isDiscrepant ? "bg-destructive/10" : ""
                }`}
              >
                <TableCell className="font-medium text-xs px-3">
                  {source.sourceName}
                </TableCell>
                <TableCell className={`text-center font-mono text-xs px-3 ${
                  isDiscrepant ? "text-destructive" : ""
                }`}>
                  {match.liveData 
                    ? `${match.liveData.homeScore} - ${match.liveData.awayScore}`
                    : `${source.odds.home.toFixed(2)} / ${source.odds.away.toFixed(2)}`
                  }
                </TableCell>
                <TableCell className="text-center px-3">
                  {index === 0 ? (
                    <Badge className="text-[10px]">Primary</Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px]">Secondary</Badge>
                  )}
                </TableCell>
                <TableCell className={`text-center font-mono text-xs px-3 ${
                  source.latency > 300 ? "text-destructive" : ""
                }`}>
                  {source.latency}ms
                </TableCell>
                <TableCell className="text-right text-xs text-muted-foreground px-3">
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
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Odds Movement (Last 6 Hours)
          </h4>
        </div>
        
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="time"
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: "10px" }}
              interval="preserveStartEnd"
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: "10px" }}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              type="monotone"
              dataKey="aggregate"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
            />
            {match.sources.map((source) => (
              <Line
                key={source.sourceId}
                type="monotone"
                dataKey={source.sourceName}
                stroke={chartConfig[source.sourceName]?.color || "hsl(var(--muted-foreground))"}
                strokeWidth={1}
                dot={false}
              />
            ))}
          </LineChart>
        </ChartContainer>
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="text-center p-2 bg-muted/30 border border-border">
            <div className="text-muted-foreground mb-1">Sources</div>
            <div className="font-mono text-lg">{match.sources.length}</div>
          </div>
          <div className="text-center p-2 bg-muted/30 border border-border">
            <div className="text-muted-foreground mb-1">Avg Latency</div>
            <div className="font-mono text-lg">
              {Math.round(
                match.sources.reduce((sum, s) => sum + s.latency, 0) / match.sources.length
              )}
              ms
            </div>
          </div>
          <div className="text-center p-2 bg-muted/30 border border-border">
            <div className="text-muted-foreground mb-1">Spread</div>
            <div className={`font-mono text-lg ${
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
