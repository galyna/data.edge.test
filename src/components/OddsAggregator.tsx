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
    <div className="terminal-card p-3">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">
            ODDS: {match.homeTeam.shortName} vs {match.awayTeam.shortName}
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
                  BEST
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
                          isBestHome ? "text-signal" : "text-foreground"
                        }`}
                      >
                        {source.odds.home.toFixed(2)}
                      </TableCell>
                {match.aggregatedOdds.draw && (
                  <TableCell className="text-center font-mono text-[10px] px-2">
                    {source.odds.draw?.toFixed(2) || "-"}
                  </TableCell>
                )}
                <TableCell
                  className={`text-center font-mono text-[10px] px-2 ${
                    isBestAway ? "text-signal font-semibold" : ""
                  }`}
                >
                  {source.odds.away.toFixed(2)}
                </TableCell>
                <TableCell className="text-center px-2">
                  {isBestHome && (
                    <Badge variant="default" className="text-[9px] px-1.5 py-0">H</Badge>
                  )}
                  {isBestDraw && (
                    <Badge variant="default" className="text-[9px] px-1.5 py-0">D</Badge>
                  )}
                  {isBestAway && (
                    <Badge variant="default" className="text-[9px] px-1.5 py-0">A</Badge>
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

        {/* Line Movement Chart */}
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h4 className="text-xs font-semibold uppercase tracking-wide text-foreground">
              ODDS MOVEMENT
            </h4>
            <span className="text-[10px] text-muted-foreground ml-auto">Last 6 hours</span>
          </div>
          <ChartContainer config={chartConfig} className="h-[240px]">
            <LineChart data={oddsHistory} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis
                dataKey="time"
                stroke="hsl(var(--foreground))"
                style={{ fontSize: "11px", fontWeight: 500 }}
                tick={{ fill: "hsl(var(--foreground))" }}
              />
              <YAxis
                stroke="hsl(var(--foreground))"
                style={{ fontSize: "11px", fontWeight: 500 }}
                tick={{ fill: "hsl(var(--foreground))" }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="aggregate"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={false}
                strokeOpacity={1}
              />
              <Line
                type="monotone"
                dataKey="home"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
                strokeOpacity={0.8}
              />
              <Line
                type="monotone"
                dataKey="away"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={2}
                dot={false}
                strokeOpacity={0.7}
              />
            </LineChart>
          </ChartContainer>
        </div>
    </div>
  );
};

export default OddsAggregator;
