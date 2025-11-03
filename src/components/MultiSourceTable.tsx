import { ArrowUp, ArrowDown } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Match {
  id: string;
  match: string;
  aggregatedOdds: string;
  spread: number;
  spreadQuality: "low" | "medium" | "high";
  bestSource: string;
  value: number;
}

const matches: Match[] = [
  {
    id: "1",
    match: "Arsenal vs Chelsea",
    aggregatedOdds: "2.15 / 3.40 / 3.20",
    spread: 0.08,
    spreadQuality: "low",
    bestSource: "Source B",
    value: 12.3,
  },
  {
    id: "2",
    match: "Man City vs Liverpool",
    aggregatedOdds: "1.85 / 3.60 / 4.20",
    spread: 0.15,
    spreadQuality: "high",
    bestSource: "Source A",
    value: 8.7,
  },
  {
    id: "3",
    match: "Barcelona vs Real Madrid",
    aggregatedOdds: "2.45 / 3.30 / 2.90",
    spread: 0.06,
    spreadQuality: "low",
    bestSource: "Source C",
    value: 15.2,
  },
  {
    id: "4",
    match: "Bayern vs Dortmund",
    aggregatedOdds: "1.75 / 3.80 / 4.50",
    spread: 0.12,
    spreadQuality: "medium",
    bestSource: "Source B",
    value: 6.4,
  },
  {
    id: "5",
    match: "PSG vs Marseille",
    aggregatedOdds: "1.55 / 4.20 / 5.80",
    spread: 0.18,
    spreadQuality: "high",
    bestSource: "Source A",
    value: 4.1,
  },
];

const MultiSourceTable = () => {
  return (
    <div className="terminal-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide">Multi-Source Odds Comparison</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Aggregated data from active sources</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Auto-update:</span>
          <span className="text-xs font-mono text-signal">10s</span>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-muted-foreground font-semibold text-xs uppercase h-9 px-3">Match</TableHead>
            <TableHead className="text-muted-foreground font-semibold text-xs uppercase h-9 px-3">Aggregated Odds</TableHead>
            <TableHead className="text-muted-foreground font-semibold text-xs uppercase h-9 px-3">Spread</TableHead>
            <TableHead className="text-muted-foreground font-semibold text-xs uppercase h-9 px-3">Best Source</TableHead>
            <TableHead className="text-muted-foreground font-semibold text-xs uppercase h-9 px-3 text-right">Value %</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {matches.map((match) => (
            <TableRow key={match.id} className="border-border hover-lift cursor-pointer h-11">
              <TableCell className="font-medium text-xs px-3">{match.match}</TableCell>
              <TableCell className="font-mono text-xs px-3">{match.aggregatedOdds}</TableCell>
              <TableCell className="px-3">
                <div className="flex items-center gap-1.5">
                  <span className={`font-mono text-xs ${
                    match.spreadQuality === "low" 
                      ? "text-positive" 
                      : match.spreadQuality === "high" 
                      ? "text-negative" 
                      : "text-muted-foreground"
                  }`}>
                    ±{match.spread.toFixed(2)}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 ${
                    match.spreadQuality === "low" 
                      ? "bg-positive text-primary-foreground" 
                      : match.spreadQuality === "high" 
                      ? "bg-negative text-destructive-foreground" 
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {match.spreadQuality.toUpperCase()}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-xs px-3">{match.bestSource}</TableCell>
              <TableCell className="text-right px-3">
                <div className="flex items-center justify-end gap-1">
                  {match.value > 10 ? (
                    <ArrowUp className="w-3 h-3 text-positive" />
                  ) : (
                    <ArrowDown className="w-3 h-3 text-muted-foreground" />
                  )}
                  <span className={`font-mono text-xs font-semibold ${
                    match.value > 10 ? "text-signal" : "text-foreground"
                  }`}>
                    +{match.value.toFixed(1)}%
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default MultiSourceTable;
