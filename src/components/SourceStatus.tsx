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
        <div className="mb-3 flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold uppercase tracking-wide">Data Sources</h3>
        </div>
        <div className="space-y-2.5">
          {sources.map((source) => (
            <div
              key={source.id}
              className="-mx-2 flex items-start gap-2 p-2 text-xs transition-colors hover:bg-muted/20"
            >
              <Circle
                className={`mt-0.5 h-2 w-2 flex-shrink-0 ${
                  source.status === "online"
                    ? "animate-pulse fill-primary text-primary"
                    : source.status === "slow"
                      ? "fill-yellow-500 text-yellow-500"
                      : "fill-destructive text-destructive"
                }`}
              />
              <div className="min-w-0 flex-1">
                <div className="mb-0.5 flex items-baseline justify-between">
                  <span className="font-medium">
                    {source.name} <span className="text-muted-foreground">({source.provider})</span>
                  </span>
                  <span className="ml-2 font-mono text-[10px] text-muted-foreground">
                    {source.reliability}%
                  </span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <span className="font-mono">
                    Latency:{" "}
                    <span className={source.latency > 300 ? "text-negative" : "text-foreground"}>
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
        <div className="mb-3 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold uppercase tracking-wide">Aggregation Anomalies</h3>
        </div>
        <div className="space-y-2.5">
          {anomalies.map((anomaly) => (
            <div
              key={anomaly.id}
              className="hover-lift cursor-pointer border border-border p-2.5 transition-all hover:border-primary/30"
            >
              <div className="mb-1 flex items-start justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium uppercase text-muted-foreground">
                    [{anomaly.sport}]
                  </span>
                  <Circle
                    className={`h-2 w-2 ${
                      anomaly.severity === "high"
                        ? "animate-pulse fill-primary text-primary"
                        : anomaly.severity === "medium"
                          ? "fill-yellow-500 text-yellow-500"
                          : "fill-muted-foreground text-muted-foreground"
                    }`}
                  />
                </div>
                <span
                  className="font-mono text-[10px] text-muted-foreground"
                  suppressHydrationWarning
                >
                  {(() => {
                    const date = new Date(anomaly.timestamp);
                    const hours = date.getUTCHours().toString().padStart(2, "0");
                    const minutes = date.getUTCMinutes().toString().padStart(2, "0");
                    return `${hours}:${minutes}`;
                  })()}
                </span>
              </div>
              <div className="mb-1.5 text-xs font-medium">{anomaly.match}</div>
              <div className="text-xs leading-relaxed text-muted-foreground">
                {anomaly.description}
              </div>
              {anomaly.severity === "high" && (
                <div className="text-signal mt-1.5 flex items-center gap-1 text-xs">
                  <TrendingUp className="h-3 w-3" />
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
