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
      odds: { home: 1.95, draw: 3.6, away: 3.8 },
      value: 12.5,
      confidence: 87,
    },
    {
      id: "2",
      time: "19:00",
      home: "Real Madrid",
      away: "Barcelona",
      odds: { home: 2.1, draw: 3.4, away: 3.5 },
      value: 8.3,
      confidence: 72,
    },
    {
      id: "3",
      time: "20:45",
      home: "Bayern Munich",
      away: "Dortmund",
      odds: { home: 1.75, draw: 3.8, away: 4.2 },
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
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Time
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Match
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                1
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                X
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                2
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Value %
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Confidence
              </th>
            </tr>
          </thead>
          <tbody>
            {matches.map((match) => (
              <tr
                key={match.id}
                className={cn(
                  "border-b border-border/50 transition-colors hover:bg-primary/5",
                  match.value > 10 && "border-primary/20 bg-primary/5"
                )}
              >
                <td className="px-4 py-4">
                  <span className="text-signal font-mono">{match.time}</span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium">{match.home}</span>
                    <span className="text-xs text-muted-foreground">{match.away}</span>
                  </div>
                </td>
                <td className="px-4 py-4 text-center">
                  <span className="inline-block rounded bg-muted px-3 py-1 font-mono">
                    {match.odds.home.toFixed(2)}
                  </span>
                </td>
                <td className="px-4 py-4 text-center">
                  <span className="inline-block rounded bg-muted px-3 py-1 font-mono">
                    {match.odds.draw.toFixed(2)}
                  </span>
                </td>
                <td className="px-4 py-4 text-center">
                  <span className="inline-block rounded bg-muted px-3 py-1 font-mono">
                    {match.odds.away.toFixed(2)}
                  </span>
                </td>
                <td className="px-4 py-4 text-center">
                  <span
                    className={cn(
                      "inline-block rounded px-3 py-1 font-mono font-bold",
                      match.value > 10
                        ? "border border-primary/50 bg-primary/20 text-primary"
                        : "bg-muted"
                    )}
                  >
                    {match.value.toFixed(1)}%
                  </span>
                </td>
                <td className="px-4 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          "h-full transition-all",
                          match.confidence > 80 ? "bg-primary" : "bg-muted-foreground"
                        )}
                        style={{ width: `${match.confidence}%` }}
                      />
                    </div>
                    <span className="w-8 font-mono text-xs">{match.confidence}%</span>
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
