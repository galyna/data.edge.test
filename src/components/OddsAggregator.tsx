import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { Match } from "@/types/match";
import { TrendingUp, AlertCircle } from "lucide-react";

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

  // Generate historical data for chart
  const oddsHistory = match.sources.map((source, index) => ({
    time: `T-${(match.sources.length - index) * 5}m`,
    home: source.odds.home,
    away: source.odds.away,
    aggregate: match.aggregatedOdds.home,
  }));

  const chartConfig = {
    home: {
      label: "Home",
      color: "hsl(var(--primary))",
    },
    away: {
      label: "Away",
      color: "hsl(var(--muted-foreground))",
    },
    aggregate: {
      label: "Aggregate",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <div className="terminal-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold uppercase tracking-wide">
          Odds Comparison: {match.homeTeam.shortName} vs {match.awayTeam.shortName}
        </h3>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-muted-foreground font-semibold text-xs uppercase h-9 px-3">
              Source
            </TableHead>
            <TableHead className="text-muted-foreground font-semibold text-xs uppercase h-9 px-3 text-center">
              Home
            </TableHead>
            {match.aggregatedOdds.draw && (
              <TableHead className="text-muted-foreground font-semibold text-xs uppercase h-9 px-3 text-center">
                Draw
              </TableHead>
            )}
            <TableHead className="text-muted-foreground font-semibold text-xs uppercase h-9 px-3 text-center">
              Away
            </TableHead>
            <TableHead className="text-muted-foreground font-semibold text-xs uppercase h-9 px-3 text-center">
              Best
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
                className="border-border hover-lift"
              >
                <TableCell className="font-medium text-xs px-3">
                  {source.sourceName}
                </TableCell>
                <TableCell
                  className={`text-center font-mono text-xs px-3 ${
                    isBestHome ? "text-signal font-semibold" : ""
                  }`}
                >
                  {source.odds.home.toFixed(2)}
                </TableCell>
                {match.aggregatedOdds.draw && (
                  <TableCell className="text-center font-mono text-xs px-3">
                    {source.odds.draw?.toFixed(2) || "-"}
                  </TableCell>
                )}
                <TableCell
                  className={`text-center font-mono text-xs px-3 ${
                    isBestAway ? "text-signal font-semibold" : ""
                  }`}
                >
                  {source.odds.away.toFixed(2)}
                </TableCell>
                <TableCell className="text-center px-3">
                  {isBestHome && (
                    <Badge variant="default" className="text-[10px]">Home</Badge>
                  )}
                  {isBestDraw && (
                    <Badge variant="default" className="text-[10px]">Draw</Badge>
                  )}
                  {isBestAway && (
                    <Badge variant="default" className="text-[10px]">Away</Badge>
                  )}
                  {!isBestHome && !isBestAway && !isBestDraw && (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Value Alert */}
      {match.value > 5 && (
        <div className="mt-4 border border-border bg-muted/10 p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-foreground mb-1">
                Value opportunity detected
              </div>
              <div className="text-xs text-muted-foreground font-mono">
                +{match.value.toFixed(1)}% | Best: {getBestSource("home")} {bestHome.toFixed(2)} vs avg {match.aggregatedOdds.home.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Line Movement Chart */}
      <div className="mt-4">
        <h4 className="text-xs font-semibold uppercase tracking-wide mb-2 text-muted-foreground">
          Odds Movement (Last 6 Hours)
        </h4>
        <ChartContainer config={chartConfig} className="h-[200px]">
          <LineChart data={oddsHistory}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="time"
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: "10px" }}
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
              strokeWidth={3}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="home"
              stroke="hsl(var(--primary))"
              strokeWidth={1}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="away"
              stroke="hsl(var(--muted-foreground))"
              strokeWidth={1}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </div>
    </div>
  );
};

export default OddsAggregator;
