import { TrendingUp, Circle } from "lucide-react";

interface ValueSignal {
  id: string;
  match: string;
  avg: number;
  best: number;
  edge: number;
  sources: number;
  spread: "Low" | "Medium" | "High";
}

const signals: ValueSignal[] = [
  {
    id: "1",
    match: "Arsenal vs Chelsea",
    avg: 2.15,
    best: 2.25,
    edge: 4.7,
    sources: 5,
    spread: "Low",
  },
  {
    id: "2",
    match: "Man City vs Liverpool",
    avg: 1.85,
    best: 1.92,
    edge: 3.8,
    sources: 4,
    spread: "Low",
  },
  {
    id: "3",
    match: "Barcelona vs Real Madrid",
    avg: 2.45,
    best: 2.58,
    edge: 5.3,
    sources: 5,
    spread: "Medium",
  },
  {
    id: "4",
    match: "Bayern vs Dortmund",
    avg: 1.75,
    best: 1.81,
    edge: 3.4,
    sources: 3,
    spread: "Low",
  },
  {
    id: "5",
    match: "PSG vs Marseille",
    avg: 1.55,
    best: 1.62,
    edge: 4.5,
    sources: 4,
    spread: "Medium",
  },
];

const ValueRadar = () => {
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
            className="border border-border p-3 hover-lift cursor-pointer"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Circle className="w-2 h-2 fill-primary text-primary" />
                <span className="text-xs font-medium">{signal.match}</span>
              </div>
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

            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg:</span>
                <span className="font-mono">{signal.avg.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Best:</span>
                <span className="font-mono text-signal">{signal.best.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Edge:</span>
                <span className="font-mono text-positive font-semibold">+{signal.edge.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sources:</span>
                <span className="font-mono">{signal.sources}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ValueRadar;
