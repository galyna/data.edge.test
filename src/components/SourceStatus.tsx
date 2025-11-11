import { Circle, AlertTriangle, Activity, TrendingUp } from "lucide-react";
import { DataSource, Anomaly } from "@/types/match";

interface SourceStatusProps {
  sources: DataSource[];
  anomalies: Anomaly[];
}

const SourceStatus = ({ sources, anomalies }: SourceStatusProps) => {
  return (
    <div className="space-y-3">
      {/* Data Sources */}
      <div className="terminal-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold uppercase tracking-wide">Data Sources</h3>
        </div>
        <div className="space-y-2.5">
          {sources.map((source) => (
            <div key={source.id} className="flex items-start gap-2 text-xs hover:bg-muted/20 p-2 -mx-2 transition-colors">
              <Circle 
                className={`w-2 h-2 mt-0.5 flex-shrink-0 ${
                  source.status === "online" 
                    ? "fill-primary text-primary animate-pulse" 
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
                  <span className="text-[10px] text-muted-foreground font-mono ml-2">
                    {source.reliability}%
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
              className="border border-border p-2.5 hover-lift cursor-pointer transition-all hover:border-primary/30"
            >
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-muted-foreground uppercase">
                    [{anomaly.sport}]
                  </span>
                  <Circle 
                    className={`w-2 h-2 ${
                      anomaly.severity === "high" 
                        ? "fill-primary text-primary animate-pulse" 
                        : anomaly.severity === "medium"
                        ? "fill-yellow-500 text-yellow-500"
                        : "fill-muted-foreground text-muted-foreground"
                    }`} 
                  />
                </div>
                <span className="text-[10px] text-muted-foreground font-mono" suppressHydrationWarning>
                  {(() => {
                    const date = new Date(anomaly.timestamp);
                    const hours = date.getUTCHours().toString().padStart(2, '0');
                    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
                    return `${hours}:${minutes}`;
                  })()}
                </span>
              </div>
              <div className="text-xs mb-1.5 font-medium">{anomaly.match}</div>
              <div className="text-xs text-muted-foreground leading-relaxed">
                {anomaly.description}
              </div>
              {anomaly.severity === "high" && (
                <div className="mt-1.5 text-xs text-signal flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>Possible value opportunity detected</span>
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
