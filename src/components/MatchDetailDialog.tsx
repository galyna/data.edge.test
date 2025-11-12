import { Fragment } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Match } from "@/types/match";
import { Clock, TrendingUp, Database, AlertCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold uppercase tracking-wide">
              {match.homeTeam.name} vs {match.awayTeam.name}
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold uppercase tracking-wide flex items-center gap-3">
            <TeamLogo team={match.homeTeam} sport={match.sport.toLowerCase()} size="lg" />
            <span className="text-foreground">{match.homeTeam.name}</span>
            <span className="text-muted-foreground text-sm">vs</span>
            <span className="text-foreground">{match.awayTeam.name}</span>
            <TeamLogo team={match.awayTeam} sport={match.sport.toLowerCase()} size="lg" />
          </DialogTitle>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="uppercase">{match.league}</span>
            <span>•</span>
            <span>{new Date(match.startTime).toLocaleString()}</span>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          
          {/* Aggregated Odds Summary */}
          <div className="terminal-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold uppercase tracking-wide">Aggregated Odds</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-muted/30 border border-border">
                <div className="text-xs text-muted-foreground mb-1 uppercase">{match.homeTeam.shortName}</div>
                <div className="text-2xl font-mono font-bold text-signal">{match.aggregatedOdds.home.toFixed(2)}</div>
              </div>
              {match.aggregatedOdds.draw && (
                <div className="text-center p-3 bg-muted/30 border border-border">
                  <div className="text-xs text-muted-foreground mb-1 uppercase">Draw</div>
                  <div className="text-2xl font-mono font-bold text-foreground">{match.aggregatedOdds.draw.toFixed(2)}</div>
                </div>
              )}
              <div className="text-center p-3 bg-muted/30 border border-border">
                <div className="text-xs text-muted-foreground mb-1 uppercase">{match.awayTeam.shortName}</div>
                <div className="text-2xl font-mono font-bold text-foreground">{match.aggregatedOdds.away.toFixed(2)}</div>
              </div>
            </div>
          </div>

          {/* Source Comparison */}
          <div className="terminal-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Database className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold uppercase tracking-wide">Source Comparison</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 text-muted-foreground font-semibold uppercase">Source</th>
                    <th className="text-center py-2 px-3 text-muted-foreground font-semibold uppercase">{match.homeTeam.shortName}</th>
                    {match.aggregatedOdds.draw && (
                      <th className="text-center py-2 px-3 text-muted-foreground font-semibold uppercase">Draw</th>
                    )}
                    <th className="text-center py-2 px-3 text-muted-foreground font-semibold uppercase">{match.awayTeam.shortName}</th>
                    <th className="text-right py-2 px-3 text-muted-foreground font-semibold uppercase">Latency</th>
                  </tr>
                </thead>
                <tbody>
                  {match.sources.map((source) => (
                    <tr key={source.sourceId} className="border-b border-border/50 hover:bg-muted/20">
                      <td className="py-2 px-3 font-medium">{source.sourceName}</td>
                      <td className="py-2 px-3 text-center font-mono">
                        <span className={source.odds.home === Math.max(...match.sources.map(s => s.odds.home)) ? "text-signal" : ""}>
                          {source.odds.home.toFixed(2)}
                        </span>
                      </td>
                      {source.odds.draw && (
                        <td className="py-2 px-3 text-center font-mono">{source.odds.draw.toFixed(2)}</td>
                      )}
                      <td className="py-2 px-3 text-center font-mono">
                        <span className={source.odds.away === Math.max(...match.sources.map(s => s.odds.away)) ? "text-signal" : ""}>
                          {source.odds.away.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-muted-foreground">{source.latency}ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Line Movement Chart */}
          <div className="terminal-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold uppercase tracking-wide">Home Odds Movement</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={spreadHistory}>
                  <defs>
                    {/* Intense lightning-like glow filters for aggregated line */}
                    <filter id="glow-aggregate-dialog-outer" x="-100%" y="-100%" width="300%" height="300%">
                      <feGaussianBlur stdDeviation="12" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                      </feMerge>
                    </filter>
                    <filter id="glow-aggregate-dialog-large" x="-100%" y="-100%" width="300%" height="300%">
                      <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                      </feMerge>
                    </filter>
                    <filter id="glow-aggregate-dialog-medium" x="-100%" y="-100%" width="300%" height="300%">
                      <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                      </feMerge>
                    </filter>
                    <filter id="glow-aggregate-dialog-close" x="-100%" y="-100%" width="300%" height="300%">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                    {/* Subtle glow for source lines */}
                    <filter id="glow-source-dialog" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="time" 
                    stroke="hsl(var(--muted-foreground))"
                    style={{ fontSize: '11px' }}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    style={{ fontSize: '11px' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0px',
                      fontSize: '11px'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '11px' }}
                  />
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
                  />
                  <Line 
                    key="aggregate-dialog-opacity-7"
                    type="monotone" 
                    dataKey="aggregate" 
                    stroke="#00ff88" 
                    strokeWidth={4}
                    dot={false}
                    strokeOpacity={0.7}
                  />
                  <Line 
                    key="aggregate-dialog-main"
                    type="monotone" 
                    dataKey="aggregate" 
                    stroke="#00ff88" 
                    strokeWidth={3}
                    dot={{ fill: '#00ff88', r: 4 }}
                    strokeOpacity={1}
                  />
                  {match.sources.map((source, index) => {
                    // Light grey-blue colors for individual sources
                    const sourceColors = ["#9ca3af", "#a5b4c3", "#b0c4d6", "#9db5d0", "#a8c0d8"];
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
                        />
                        <Line 
                          type="monotone" 
                          dataKey={source.sourceName} 
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
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold uppercase tracking-wide">Analytics</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 bg-muted/30 border border-border">
                <div className="text-xs text-muted-foreground mb-1">Spread</div>
                <div className="font-mono text-lg">±{match.spread.toFixed(2)}</div>
                <div className={`text-[10px] mt-1 uppercase ${
                  match.spreadQuality === "low" ? "text-positive" : 
                  match.spreadQuality === "high" ? "text-negative" : "text-muted-foreground"
                }`}>
                  {match.spreadQuality}
                </div>
              </div>
              <div className="p-3 bg-muted/30 border border-border">
                <div className="text-xs text-muted-foreground mb-1">Value</div>
                <div className="font-mono text-lg text-signal">+{match.value.toFixed(1)}%</div>
                <div className="text-[10px] mt-1 uppercase text-muted-foreground">Edge</div>
              </div>
              <div className="p-3 bg-muted/30 border border-border">
                <div className="text-xs text-muted-foreground mb-1">Sources</div>
                <div className="font-mono text-lg">{match.sources.length}</div>
                <div className="text-[10px] mt-1 uppercase text-muted-foreground">Active</div>
              </div>
              <div className="p-3 bg-muted/30 border border-border">
                <div className="text-xs text-muted-foreground mb-1">Best Source</div>
                <div className="text-sm font-medium truncate">{match.bestSource}</div>
                <div className="text-[10px] mt-1 uppercase text-muted-foreground">Highest Odds</div>
              </div>
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MatchDetailDialog;
