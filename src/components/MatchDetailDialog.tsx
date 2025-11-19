import { Fragment } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Match } from "@/types/match";
import { Clock, TrendingUp, Database, AlertCircle } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TeamLogo } from "./TeamLogo";

interface MatchDetailDialogProps {
  match: Match | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MatchDetailDialog = ({ match, open, onOpenChange }: MatchDetailDialogProps) => {
  if (!match) return null;

  if (!match.sources || match.sources.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold uppercase tracking-wide">
              {match.homeTeam.name} vs {match.awayTeam.name}
            </DialogTitle>
          </DialogHeader>
          <div className="py-8 text-center">
            <p className="text-sm text-muted-foreground">No source data available</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Generate historical data for spread visualization
  const spreadHistory = match.sources.map((source, index) => ({
    time: `T-${(match.sources.length - index) * 5}m`,
    aggregate: match.aggregatedOdds.home,
    [source.sourceName]: source.odds.home,
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto border-border bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-lg font-semibold uppercase tracking-wide">
            <TeamLogo team={match.homeTeam} sport={match.sport.toLowerCase()} size="lg" />
            <span className="text-foreground">{match.homeTeam.name}</span>
            <span className="text-sm text-muted-foreground">vs</span>
            <span className="text-foreground">{match.awayTeam.name}</span>
            <TeamLogo team={match.awayTeam} sport={match.sport.toLowerCase()} size="lg" />
          </DialogTitle>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="uppercase">{match.league}</span>
            <span>•</span>
            <span>{new Date(match.startTime).toLocaleString()}</span>
          </div>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {/* Aggregated Odds Summary */}
          <div className="terminal-card p-4">
            <div className="mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold uppercase tracking-wide">Aggregated Odds</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="border border-border bg-muted/30 p-3 text-center">
                <div className="mb-1 text-xs uppercase text-muted-foreground">
                  {match.homeTeam.shortName}
                </div>
                <div className="text-signal font-mono text-2xl font-bold">
                  {match.aggregatedOdds.home.toFixed(2)}
                </div>
              </div>
              {match.aggregatedOdds.draw && (
                <div className="border border-border bg-muted/30 p-3 text-center">
                  <div className="mb-1 text-xs uppercase text-muted-foreground">Draw</div>
                  <div className="font-mono text-2xl font-bold text-foreground">
                    {match.aggregatedOdds.draw.toFixed(2)}
                  </div>
                </div>
              )}
              <div className="border border-border bg-muted/30 p-3 text-center">
                <div className="mb-1 text-xs uppercase text-muted-foreground">
                  {match.awayTeam.shortName}
                </div>
                <div className="font-mono text-2xl font-bold text-foreground">
                  {match.aggregatedOdds.away.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Source Comparison */}
          <div className="terminal-card p-4">
            <div className="mb-3 flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold uppercase tracking-wide">Source Comparison</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-3 py-2 text-left font-semibold uppercase text-muted-foreground">
                      Source
                    </th>
                    <th className="px-3 py-2 text-center font-semibold uppercase text-muted-foreground">
                      {match.homeTeam.shortName}
                    </th>
                    {match.aggregatedOdds.draw && (
                      <th className="px-3 py-2 text-center font-semibold uppercase text-muted-foreground">
                        Draw
                      </th>
                    )}
                    <th className="px-3 py-2 text-center font-semibold uppercase text-muted-foreground">
                      {match.awayTeam.shortName}
                    </th>
                    <th className="px-3 py-2 text-right font-semibold uppercase text-muted-foreground">
                      Latency
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {match.sources.map((source) => (
                    <tr
                      key={source.sourceId}
                      className="border-b border-border/50 hover:bg-muted/20"
                    >
                      <td className="px-3 py-2 font-medium">{source.sourceName}</td>
                      <td className="px-3 py-2 text-center font-mono">
                        <span
                          className={
                            source.odds.home === Math.max(...match.sources.map((s) => s.odds.home))
                              ? "text-signal"
                              : ""
                          }
                        >
                          {source.odds.home.toFixed(2)}
                        </span>
                      </td>
                      {source.odds.draw && (
                        <td className="px-3 py-2 text-center font-mono">
                          {source.odds.draw.toFixed(2)}
                        </td>
                      )}
                      <td className="px-3 py-2 text-center font-mono">
                        <span
                          className={
                            source.odds.away === Math.max(...match.sources.map((s) => s.odds.away))
                              ? "text-signal"
                              : ""
                          }
                        >
                          {source.odds.away.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-muted-foreground">
                        {source.latency}ms
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Line Movement Chart */}
          <div className="terminal-card p-4">
            <div className="mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide">
                <span>Odds Movement:</span>
                <TeamLogo team={match.homeTeam} sport={match.sport.toLowerCase()} size="sm" />
                <span>{match.homeTeam.name} to Win</span>
              </h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={spreadHistory}>
                  <defs>
                    {/* Intense lightning-like glow filters for aggregated line */}
                    <filter
                      id="glow-aggregate-dialog-outer"
                      x="-100%"
                      y="-100%"
                      width="300%"
                      height="300%"
                    >
                      <feGaussianBlur stdDeviation="12" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                      </feMerge>
                    </filter>
                    <filter
                      id="glow-aggregate-dialog-large"
                      x="-100%"
                      y="-100%"
                      width="300%"
                      height="300%"
                    >
                      <feGaussianBlur stdDeviation="8" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                      </feMerge>
                    </filter>
                    <filter
                      id="glow-aggregate-dialog-medium"
                      x="-100%"
                      y="-100%"
                      width="300%"
                      height="300%"
                    >
                      <feGaussianBlur stdDeviation="5" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                      </feMerge>
                    </filter>
                    <filter
                      id="glow-aggregate-dialog-close"
                      x="-100%"
                      y="-100%"
                      width="300%"
                      height="300%"
                    >
                      <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                    {/* Subtle glow for source lines */}
                    <filter id="glow-source-dialog" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="time"
                    stroke="hsl(var(--muted-foreground))"
                    style={{ fontSize: "11px" }}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: "11px" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0px",
                      fontSize: "11px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  {/* Aggregated line with intense lightning-like glow - multiple layers */}
                  <Line
                    key="aggregate-dialog-outer"
                    type="monotone"
                    dataKey="aggregate"
                    stroke="#00ff88"
                    strokeWidth={10}
                    dot={false}
                    strokeOpacity={0.12}
                    filter="url(#glow-aggregate-dialog-outer)"
                    legendType="none"
                  />
                  <Line
                    key="aggregate-dialog-large"
                    type="monotone"
                    dataKey="aggregate"
                    stroke="#00ff88"
                    strokeWidth={8}
                    dot={false}
                    strokeOpacity={0.2}
                    filter="url(#glow-aggregate-dialog-large)"
                    legendType="none"
                  />
                  <Line
                    key="aggregate-dialog-medium"
                    type="monotone"
                    dataKey="aggregate"
                    stroke="#00ff88"
                    strokeWidth={6}
                    dot={false}
                    strokeOpacity={0.3}
                    filter="url(#glow-aggregate-dialog-medium)"
                    legendType="none"
                  />
                  <Line
                    key="aggregate-dialog-close"
                    type="monotone"
                    dataKey="aggregate"
                    stroke="#00ff88"
                    strokeWidth={5}
                    dot={false}
                    strokeOpacity={0.5}
                    filter="url(#glow-aggregate-dialog-close)"
                    legendType="none"
                  />
                  <Line
                    key="aggregate-dialog-opacity-7"
                    type="monotone"
                    dataKey="aggregate"
                    stroke="#00ff88"
                    strokeWidth={4}
                    dot={false}
                    strokeOpacity={0.7}
                    legendType="none"
                  />
                  <Line
                    key="aggregate-dialog-main"
                    type="monotone"
                    dataKey="aggregate"
                    name="Aggregate"
                    stroke="#00ff88"
                    strokeWidth={3}
                    dot={{ fill: "#00ff88", r: 4 }}
                    strokeOpacity={1}
                  />
                  {match.sources.map((source, index) => {
                    // Use distinct, vibrant colors
                    const sourceColors = ["#3b82f6", "#ef4444", "#eab308", "#8b5cf6", "#22c55e"];
                    return (
                      <Fragment key={source.sourceId}>
                        <Line
                          type="monotone"
                          dataKey={source.sourceName}
                          stroke={sourceColors[index % sourceColors.length]}
                          strokeWidth={2}
                          dot={false}
                          strokeOpacity={0.4}
                          filter="url(#glow-source-dialog)"
                          legendType="none"
                        />
                        <Line
                          type="monotone"
                          dataKey={source.sourceName}
                          name={source.sourceName}
                          stroke={sourceColors[index % sourceColors.length]}
                          strokeWidth={1.5}
                          dot={false}
                          strokeOpacity={0.8}
                        />
                      </Fragment>
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Analytics */}
          <div className="terminal-card p-4">
            <div className="mb-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold uppercase tracking-wide">Analytics</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <div className="border border-border bg-muted/30 p-3">
                <div className="mb-1 text-xs text-muted-foreground">Spread</div>
                <div className="font-mono text-lg">±{match.spread.toFixed(2)}</div>
                <div
                  className={`mt-1 text-[10px] uppercase ${
                    match.spreadQuality === "low"
                      ? "text-positive"
                      : match.spreadQuality === "high"
                        ? "text-negative"
                        : "text-muted-foreground"
                  }`}
                >
                  {match.spreadQuality}
                </div>
              </div>
              <div className="border border-border bg-muted/30 p-3">
                <div className="mb-1 text-xs text-muted-foreground">Value</div>
                <div className="text-signal font-mono text-lg">+{match.value.toFixed(1)}%</div>
                <div className="mt-1 text-[10px] uppercase text-muted-foreground">Edge</div>
              </div>
              <div className="border border-border bg-muted/30 p-3">
                <div className="mb-1 text-xs text-muted-foreground">Sources</div>
                <div className="font-mono text-lg">{match.sources.length}</div>
                <div className="mt-1 text-[10px] uppercase text-muted-foreground">Active</div>
              </div>
              <div className="border border-border bg-muted/30 p-3">
                <div className="mb-1 text-xs text-muted-foreground">Best Source</div>
                <div className="truncate text-sm font-medium">{match.bestSource}</div>
                <div className="mt-1 text-[10px] uppercase text-muted-foreground">Highest Odds</div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MatchDetailDialog;
