import { TrendingUp, Circle, TrendingDown } from "lucide-react";
import { ValueSignal } from "@/types/match";
import AnimatedValue from "./AnimatedValue";

interface ValueRadarProps {
  signals: ValueSignal[];
}

const ValueRadar = ({ signals }: ValueRadarProps) => {
  return (
    <div className="terminal-card p-2.5">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-4 h-4 text-signal" />
        <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">VALUE SIGNALS</h3>
      </div>

      <div className="space-y-1.5">
        {signals.slice(0, 4).map((signal) => (
          <div 
            key={signal.id} 
            className="border border-border p-1.5 hover:bg-muted/20 cursor-pointer transition-colors"
          >
            <div className="flex items-start justify-between mb-1">
              <div className="flex items-center gap-1 flex-1 min-w-0">
                <Circle className="w-1 h-1 fill-primary text-primary flex-shrink-0 mt-1" />
                <span className="text-[9px] font-medium truncate">{signal.match}</span>
              </div>
              <span className={`text-[8px] px-1 py-0 ${
                signal.spread === "Low" 
                  ? "bg-positive text-primary-foreground" 
                  : signal.spread === "High"
                  ? "bg-negative text-destructive-foreground"
                  : "bg-muted text-muted-foreground"
              }`}>
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
                <span className="text-muted-foreground">Src:</span>
                <span className="font-mono">{signal.sources}</span>
              </div>
            </div>

            {/* Confidence bar */}
            <div className="mt-1 pt-1 border-t border-border/50">
              <div className="flex items-center justify-between text-[8px] mb-0.5">
                <span className="text-muted-foreground">Conf</span>
                <span className="font-mono text-foreground">{signal.confidence}%</span>
              </div>
              <div className="h-0.5 bg-muted/30 overflow-hidden">
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
