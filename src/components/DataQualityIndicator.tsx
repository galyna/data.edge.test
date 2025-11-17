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
    <div className="terminal-card p-3">
      <div className="mb-3 flex items-center gap-2">
        <Activity className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">
          IN-HOUSE SYSTEMS STATUS
        </h3>
      </div>

      {/* Summary */}
      <div className="mb-2 grid grid-cols-2 gap-1.5">
        <div className="border border-border bg-muted/30 p-1.5">
          <div className="mb-0.5 text-[10px] text-muted-foreground">Online</div>
          <div className="text-signal font-mono text-base">
            {onlineCount}/{sources.length}
          </div>
        </div>
        <div className="border border-border bg-muted/30 p-1.5">
          <div className="mb-0.5 text-[10px] text-muted-foreground">Latency</div>
          <div
            className={`font-mono text-base ${
              averageLatency > 50 ? "text-destructive" : "text-signal"
            }`}
          >
            {averageLatency}ms
          </div>
        </div>
      </div>

      {/* Sources List */}
      <div className="space-y-1.5">
        {sources.map((source) => (
          <div
            key={source.id}
            className="flex items-center justify-between border border-border p-1.5 transition-colors hover:bg-muted/20"
          >
            <div className="flex min-w-0 flex-1 items-center gap-1.5">
              <Tooltip>
                <TooltipTrigger>
                  <span className="text-[10px]">{getStatusIcon(source.status)}</span>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1 text-xs">
                    <p>Status: {source.status}</p>
                    <p>Latency: {source.latency}ms</p>
                    <p>Reliability: {source.reliability}%</p>
                    <p>Last update: {source.lastUpdate}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between">
                  <span className="truncate text-[10px] font-medium">{source.name}</span>
                  <Badge
                    variant={source.reliability >= 90 ? "default" : "secondary"}
                    className="ml-1.5 px-1.5 py-0 text-[9px]"
                  >
                    {source.reliability}%
                  </Badge>
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-[9px] text-muted-foreground">
                  <span className="font-mono">{source.latency}ms</span>
                  <span className="font-mono">{source.lastUpdate}</span>
                </div>
              </div>
            </div>

            <div className="ml-1.5 flex items-center gap-1.5">
              <Progress value={source.reliability} className="h-1.5 w-12" />
              <span
                className={`w-10 text-right font-mono text-[9px] ${getQualityColor(source.reliability)}`}
              >
                {getQualityLabel(source.reliability)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Warnings */}
      {averageReliability < 95 && (
        <div className="mt-2 border border-border bg-muted/10 p-1.5">
          <div className="flex items-start gap-1.5">
            <AlertTriangle className="mt-0.5 h-2.5 w-2.5 flex-shrink-0 text-muted-foreground" />
            <div className="font-mono text-[10px] text-muted-foreground">
              In-House Reliability: {averageReliability}%
            </div>
          </div>
        </div>
      )}

      {averageLatency > 50 && (
        <div className="mt-1.5 border border-border bg-muted/10 p-1.5">
          <div className="flex items-start gap-1.5">
            <AlertTriangle className="mt-0.5 h-2.5 w-2.5 flex-shrink-0 text-muted-foreground" />
            <div className="font-mono text-[10px] text-muted-foreground">
              In-House Latency: {averageLatency}ms
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataQualityIndicator;
