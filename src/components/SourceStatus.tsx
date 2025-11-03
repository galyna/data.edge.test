import { Circle, AlertTriangle } from "lucide-react";

interface DataSource {
  id: string;
  name: string;
  provider: string;
  status: "online" | "slow" | "offline";
  latency: number;
  lastUpdate: string;
}

interface Anomaly {
  id: string;
  sport: string;
  match: string;
  description: string;
  severity: "high" | "medium" | "low";
}

const sources: DataSource[] = [
  { id: "1", name: "Source A", provider: "BetAPI", status: "online", latency: 120, lastUpdate: "3s ago" },
  { id: "2", name: "Source B", provider: "StatsPro", status: "online", latency: 95, lastUpdate: "4s ago" },
  { id: "3", name: "Source C", provider: "OddsFeed", status: "slow", latency: 450, lastUpdate: "12s ago" },
  { id: "4", name: "Source D", provider: "LiveData", status: "offline", latency: 0, lastUpdate: "2m ago" },
  { id: "5", name: "Source E", provider: "QuickOdds", status: "online", latency: 180, lastUpdate: "5s ago" },
];

const anomalies: Anomaly[] = [
  {
    id: "1",
    sport: "Football",
    match: "Arsenal vs Chelsea",
    description: "Source C deviates +0.15 from aggregate",
    severity: "high",
  },
  {
    id: "2",
    sport: "NBA",
    match: "Lakers vs Warriors",
    description: "Unusual volume spike detected",
    severity: "medium",
  },
  {
    id: "3",
    sport: "Football",
    match: "Bayern vs Dortmund",
    description: "Source A late update (45s delay)",
    severity: "low",
  },
];

const SourceStatus = () => {
  return (
    <div className="space-y-4">
      {/* Data Sources */}
      <div className="terminal-card p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide mb-3">Data Sources</h3>
        <div className="space-y-2.5">
          {sources.map((source) => (
            <div key={source.id} className="flex items-start gap-2 text-xs">
              <Circle 
                className={`w-2 h-2 mt-0.5 flex-shrink-0 ${
                  source.status === "online" 
                    ? "fill-primary text-primary" 
                    : source.status === "slow"
                    ? "fill-yellow-500 text-yellow-500"
                    : "fill-destructive text-destructive"
                }`} 
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between mb-0.5">
                  <span className="font-medium">
                    {source.name} <span className="text-muted-foreground">({source.provider})</span>
                  </span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <span className="font-mono">
                    Latency: <span className={source.latency > 300 ? "text-negative" : "text-foreground"}>
                      {source.latency}ms
                    </span>
                  </span>
                  <span className="font-mono">Last: {source.lastUpdate}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Aggregation Anomalies */}
      <div className="terminal-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold uppercase tracking-wide">Aggregation Anomalies</h3>
        </div>
        <div className="space-y-2.5">
          {anomalies.map((anomaly) => (
            <div 
              key={anomaly.id} 
              className="border border-border p-2.5 hover-lift cursor-pointer"
            >
              <div className="flex items-start justify-between mb-1">
                <span className="text-xs font-medium text-muted-foreground uppercase">
                  [{anomaly.sport}]
                </span>
                <Circle 
                  className={`w-2 h-2 mt-0.5 ${
                    anomaly.severity === "high" 
                      ? "fill-primary text-primary" 
                      : "fill-muted-foreground text-muted-foreground"
                  }`} 
                />
              </div>
              <div className="text-xs mb-1.5">{anomaly.match}</div>
              <div className="text-xs text-muted-foreground leading-relaxed">
                {anomaly.description}
              </div>
              {anomaly.severity === "high" && (
                <div className="mt-1.5 text-xs text-signal">
                  Possible inefficiency detected
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SourceStatus;
