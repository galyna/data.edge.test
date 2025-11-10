import { TrendingUp, Circle, TrendingDown } from "lucide-react";
import { ValueSignal } from "@/types/match";
import AnimatedValue from "./AnimatedValue";

interface ValueRadarProps {
  signals: ValueSignal[];
}

const ValueRadar = ({ signals }: ValueRadarProps) => {
  return (
    <div className="terminal-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-4 h-4 text-signal" />
        <h3 className="text-sm font-semibold uppercase tracking-wide">Value Signals from Aggregation</h3>
      </div>

      <div className="space-y-3">
        {signals.map((signal) => (
          <div 
            key={signal.id} 
            className="border border-border p-3 hover-lift cursor-pointer transition-all hover:border-primary/50"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2 flex-1">
                <Circle className="w-2 h-2 fill-primary text-primary flex-shrink-0" />
                <span className="text-xs font-medium">{signal.match}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-1.5 py-0.5 ${
                  signal.spread === "Low" 
                    ? "bg-positive text-primary-foreground" 
                    : signal.spread === "High"
                    ? "bg-negative text-destructive-foreground"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {signal.spread}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg:</span>
                <span className="font-mono">{signal.avg.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Best:</span>
                <AnimatedValue 
                  value={signal.best}
                  format={(val) => val.toFixed(2)}
                  className="font-mono text-signal"
                />
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Edge:</span>
                <AnimatedValue 
                  value={signal.edge}
                  format={(val) => `+${val.toFixed(1)}%`}
                  className="font-mono text-positive font-semibold"
                />
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sources:</span>
                <span className="font-mono">{signal.sources}</span>
              </div>
            </div>

            {/* Confidence bar */}
            <div className="mt-2.5 pt-2.5 border-t border-border/50">
              <div className="flex items-center justify-between text-[10px] mb-1">
                <span className="text-muted-foreground uppercase">Confidence</span>
                <span className="font-mono text-foreground">{signal.confidence}%</span>
              </div>
              <div className="h-1.5 bg-muted/30 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${
                    signal.confidence >= 90 ? 'bg-signal' : 
                    signal.confidence >= 80 ? 'bg-primary' : 'bg-muted-foreground'
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
