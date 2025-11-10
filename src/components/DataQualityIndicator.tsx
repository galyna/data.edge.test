import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DataSource } from "@/types/match";
import { Activity, AlertTriangle } from "lucide-react";

interface DataQualityIndicatorProps {
  sources: DataSource[];
}

const DataQualityIndicator = ({ sources }: DataQualityIndicatorProps) => {
  const getQualityColor = (quality: number) => {
    if (quality >= 90) return "text-primary";
    if (quality >= 80) return "text-yellow-500";
    return "text-destructive";
  };

  const getQualityLabel = (quality: number) => {
    if (quality >= 90) return "Excellent";
    if (quality >= 80) return "Good";
    if (quality >= 70) return "Fair";
    return "Poor";
  };

  const getStatusIcon = (status: DataSource["status"]) => {
    switch (status) {
      case "online":
        return "🟢";
      case "slow":
        return "🟡";
      case "offline":
        return "🔴";
    }
  };

  const averageLatency = Math.round(
    sources.reduce((sum, s) => sum + s.latency, 0) / sources.length
  );
  const averageReliability = Math.round(
    sources.reduce((sum, s) => sum + s.reliability, 0) / sources.length
  );
  const onlineCount = sources.filter((s) => s.status === "online").length;

  return (
    <div className="terminal-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Activity className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold uppercase tracking-wide">Data Quality</h3>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="p-2 bg-muted/30 border border-border">
          <div className="text-xs text-muted-foreground mb-1">Online</div>
          <div className="font-mono text-lg text-signal">
            {onlineCount}/{sources.length}
          </div>
        </div>
        <div className="p-2 bg-muted/30 border border-border">
          <div className="text-xs text-muted-foreground mb-1">Avg Latency</div>
          <div className={`font-mono text-lg ${
            averageLatency > 300 ? "text-destructive" : "text-foreground"
          }`}>
            {averageLatency}ms
          </div>
        </div>
      </div>

      {/* Sources List */}
      <div className="space-y-2">
        {sources.map((source) => (
          <div
            key={source.id}
            className="flex items-center justify-between p-2 border border-border hover:bg-muted/20 transition-colors"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Tooltip>
                <TooltipTrigger>
                  <span className="text-xs">{getStatusIcon(source.status)}</span>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-xs space-y-1">
                    <p>Status: {source.status}</p>
                    <p>Latency: {source.latency}ms</p>
                    <p>Reliability: {source.reliability}%</p>
                    <p>Last update: {source.lastUpdate}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between mb-0.5">
                  <span className="text-xs font-medium truncate">
                    {source.name}
                  </span>
                  <Badge
                    variant={source.reliability >= 90 ? "default" : "secondary"}
                    className="text-[10px] ml-2"
                  >
                    {source.reliability}%
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span className="font-mono">
                    {source.latency}ms
                  </span>
                  <span className="font-mono">{source.lastUpdate}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-2">
              <Progress
                value={source.reliability}
                className="w-16 h-2"
              />
              <span className={`text-xs font-mono w-12 text-right ${getQualityColor(source.reliability)}`}>
                {getQualityLabel(source.reliability)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Warnings */}
      {averageReliability < 85 && (
        <div className="mt-3 border border-border bg-muted/10 p-2.5">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="text-xs text-muted-foreground font-mono">
              Reliability below threshold: {averageReliability}%
            </div>
          </div>
        </div>
      )}

      {averageLatency > 300 && (
        <div className="mt-2 border border-border bg-muted/10 p-2.5">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="text-xs text-muted-foreground font-mono">
              High latency: {averageLatency}ms
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataQualityIndicator;
