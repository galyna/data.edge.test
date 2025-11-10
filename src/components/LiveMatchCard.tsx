import { Circle } from "lucide-react";

interface Match {
  id: string;
  sport: string;
  league: string;
  status: "live" | "scheduled" | "finished";
  homeTeam: {
    name: string;
    logo: string;
    score?: number;
  };
  awayTeam: {
    name: string;
    logo: string;
    score?: number;
  };
  time: string;
  period?: string;
  startTime?: string;
}

interface LiveMatchCardProps {
  match: Match;
}

const LiveMatchCard = ({ match }: LiveMatchCardProps) => {
  const getStatusColor = () => {
    switch (match.status) {
      case "live":
        return "text-negative";
      case "scheduled":
        return "text-primary";
      case "finished":
        return "text-muted-foreground";
      default:
        return "text-muted-foreground";
    }
  };

  const getStatusText = () => {
    switch (match.status) {
      case "live":
        return "LIVE";
      case "scheduled":
        return "SCHEDULED";
      case "finished":
        return "FINISHED";
    }
  };

  return (
    <div className="terminal-card p-3 hover-lift cursor-pointer">
      
      {/* Header: Sport, League, Status */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            {match.sport}
          </span>
          <span className="text-[10px] text-muted-foreground/70">
            {match.league}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Circle 
            className={`h-2 w-2 fill-current ${getStatusColor()} ${
              match.status === 'live' ? 'animate-pulse' : ''
            }`}
          />
          <span className={`text-[10px] uppercase tracking-wider font-semibold ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
      </div>

      {/* Match Content */}
      <div className="space-y-3">
        
        {/* Home Team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-2xl">{match.homeTeam.logo}</span>
            <span className="text-sm text-foreground font-medium truncate">
              {match.homeTeam.name}
            </span>
          </div>
          {match.homeTeam.score !== undefined && (
            <span className="text-2xl font-mono font-bold text-foreground ml-2">
              {match.homeTeam.score}
            </span>
          )}
        </div>

        {/* Away Team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-2xl">{match.awayTeam.logo}</span>
            <span className="text-sm text-foreground font-medium truncate">
              {match.awayTeam.name}
            </span>
          </div>
          {match.awayTeam.score !== undefined && (
            <span className="text-2xl font-mono font-bold text-foreground ml-2">
              {match.awayTeam.score}
            </span>
          )}
        </div>

      </div>

      {/* Footer: Time/Period */}
      <div className="mt-3 pt-2 border-t border-border">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-mono">
            {match.time}
          </span>
          {match.period && (
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
              {match.period}
            </span>
          )}
          {match.startTime && !match.period && (
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Starts at {match.startTime}
            </span>
          )}
        </div>
      </div>

    </div>
  );
};

export default LiveMatchCard;
