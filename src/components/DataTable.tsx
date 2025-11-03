import { cn } from "@/lib/utils";

interface Match {
  id: string;
  time: string;
  home: string;
  away: string;
  odds: {
    home: number;
    draw: number;
    away: number;
  };
  value: number;
  confidence: number;
}

const DataTable = () => {
  const matches: Match[] = [
    {
      id: "1",
      time: "18:30",
      home: "Manchester City",
      away: "Liverpool",
      odds: { home: 1.95, draw: 3.60, away: 3.80 },
      value: 12.5,
      confidence: 87,
    },
    {
      id: "2",
      time: "19:00",
      home: "Real Madrid",
      away: "Barcelona",
      odds: { home: 2.10, draw: 3.40, away: 3.50 },
      value: 8.3,
      confidence: 72,
    },
    {
      id: "3",
      time: "20:45",
      home: "Bayern Munich",
      away: "Dortmund",
      odds: { home: 1.75, draw: 3.80, away: 4.20 },
      value: 15.2,
      confidence: 91,
    },
  ];

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-muted-foreground font-medium uppercase text-xs tracking-wider">Time</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-medium uppercase text-xs tracking-wider">Match</th>
              <th className="text-center py-3 px-4 text-muted-foreground font-medium uppercase text-xs tracking-wider">1</th>
              <th className="text-center py-3 px-4 text-muted-foreground font-medium uppercase text-xs tracking-wider">X</th>
              <th className="text-center py-3 px-4 text-muted-foreground font-medium uppercase text-xs tracking-wider">2</th>
              <th className="text-center py-3 px-4 text-muted-foreground font-medium uppercase text-xs tracking-wider">Value %</th>
              <th className="text-center py-3 px-4 text-muted-foreground font-medium uppercase text-xs tracking-wider">Confidence</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((match, idx) => (
              <tr
                key={match.id}
                className={cn(
                  "border-b border-border/50 hover:bg-primary/5 transition-colors",
                  match.value > 10 && "bg-primary/5 border-primary/20"
                )}
              >
                <td className="py-4 px-4">
                  <span className="text-signal font-mono">{match.time}</span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium">{match.home}</span>
                    <span className="text-muted-foreground text-xs">{match.away}</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block px-3 py-1 rounded bg-muted font-mono">
                    {match.odds.home.toFixed(2)}
                  </span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block px-3 py-1 rounded bg-muted font-mono">
                    {match.odds.draw.toFixed(2)}
                  </span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block px-3 py-1 rounded bg-muted font-mono">
                    {match.odds.away.toFixed(2)}
                  </span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className={cn(
                    "inline-block px-3 py-1 rounded font-mono font-bold",
                    match.value > 10
                      ? "bg-primary/20 text-primary border border-primary/50"
                      : "bg-muted"
                  )}>
                    {match.value.toFixed(1)}%
                  </span>
                </td>
                <td className="py-4 px-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full transition-all",
                          match.confidence > 80 ? "bg-primary" : "bg-muted-foreground"
                        )}
                        style={{ width: `${match.confidence}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono w-8">{match.confidence}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
