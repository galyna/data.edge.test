import { TrendingUp, Circle } from "lucide-react";
import { ValueSignal } from "@/types/match";

interface ValueRadarProps {
  signals: ValueSignal[];
}

const ValueRadar = ({ signals }: ValueRadarProps) => {
  return (
    <div className="terminal-card p-2.5">
      <div className="mb-3 flex items-center gap-2">
        <TrendingUp className="text-signal h-4 w-4" />
        <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">VALUE SIGNALS</h3>
      </div>

      <div className="space-y-1.5">
        {signals.map((signal) => (
          <div
            key={signal.id}
            className="cursor-pointer border border-border p-1.5 transition-colors hover:bg-muted/20"
          >
            <div className="mb-1 flex items-start justify-between">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <Circle className="mt-1 h-1 w-1 flex-shrink-0 fill-primary text-primary" />
                <span className="truncate text-[9px] font-medium">{signal.match}</span>
              </div>
              <span
                className={`px-1 py-0 text-[8px] ${
                  signal.spread === "Low"
                    ? "bg-positive text-primary-foreground"
                    : signal.spread === "High"
                      ? "bg-negative text-destructive-foreground"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {signal.spread}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-x-1.5 gap-y-0.5 text-[9px]">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg:</span>
                <span className="font-mono">{signal.avg.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Best:</span>
                <span className="text-signal font-mono">{signal.best.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Edge:</span>
                <span className="text-positive font-mono font-semibold">+{signal.edge.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Src:</span>
                <span className="font-mono">{signal.sources}</span>
              </div>
            </div>

            {/* Confidence bar */}
            <div className="mt-1 border-t border-border/50 pt-1">
              <div className="mb-0.5 flex items-center justify-between text-[8px]">
                <span className="text-muted-foreground">Conf</span>
                <span className="font-mono text-foreground">{signal.confidence}%</span>
              </div>
              <div className="h-0.5 overflow-hidden bg-muted/30">
                <div
                  className={`h-full transition-all duration-500 ${
                    signal.confidence >= 90
                      ? "bg-signal"
                      : signal.confidence >= 80
                        ? "bg-primary"
                        : "bg-muted-foreground"
                  }`}
                  style={{ width: `${signal.confidence}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ValueRadar;
