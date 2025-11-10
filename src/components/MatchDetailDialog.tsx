import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Match } from "@/types/match";
import { Clock, TrendingUp, Database, AlertCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

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
            <span className="text-2xl">{match.homeTeam.logo}</span>
            <span className="text-foreground">{match.homeTeam.name}</span>
            <span className="text-muted-foreground text-sm">vs</span>
            <span className="text-foreground">{match.awayTeam.name}</span>
            <span className="text-2xl">{match.awayTeam.logo}</span>
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
                  <Line 
                    type="monotone" 
                    dataKey="aggregate" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                  />
                  {match.sources.map((source, index) => (
                    <Line 
                      key={source.sourceId}
                      type="monotone" 
                      dataKey={source.sourceName} 
                      stroke={`hsl(${180 + index * 40}, 60%, 50%)`}
                      strokeWidth={1}
                      dot={false}
                    />
                  ))}
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
