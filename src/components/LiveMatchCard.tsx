"use client";

import { Circle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Match } from "@/types/match";

interface LiveMatchCardProps {
  match: Match;
  showSource?: boolean;
  showStats?: boolean;
}

const LiveMatchCard = ({ match, showSource = true, showStats = false }: LiveMatchCardProps) => {
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

  const getSourceBadge = () => {
    if (!match.sources || match.sources.length === 0) {
      return match.bestSource || "Unknown";
    }
    const primarySource = match.sources.find((s) => s.sourceName === match.bestSource) || match.sources[0];
    return primarySource?.sourceName || match.bestSource || "Unknown";
  };

  const getHomeScore = () => match.liveData?.homeScore ?? match.homeTeam.logo;
  const getAwayScore = () => match.liveData?.awayScore ?? match.awayTeam.logo;

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
        <div className="flex items-center gap-2">
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
          {showSource && (
            <Tooltip>
              <TooltipTrigger>
                <div className="inline-flex items-center px-2 py-0.5 text-[10px] font-mono text-muted-foreground border border-border">
                  {getSourceBadge()}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-xs space-y-1">
                  <p>Primary source: {getSourceBadge()}</p>
                  <p>Total sources: {match.sources?.length || 0}</p>
                  <p>Best source: {match.bestSource || "Unknown"}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          )}
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
          {match.liveData && (
            <span className="text-2xl font-mono font-bold text-foreground ml-2">
              {getHomeScore()}
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
          {match.liveData && (
            <span className="text-2xl font-mono font-bold text-foreground ml-2">
              {getAwayScore()}
            </span>
          )}
        </div>

      </div>

      {/* Stats (if available and enabled) */}
      {showStats && match.liveData && (
        <div className="mt-3 pt-3 border-t border-border space-y-2">
          {/* Example: Possession or other stats */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Value</span>
              <span className="font-mono text-signal">+{match.value.toFixed(1)}%</span>
            </div>
            <Progress value={Math.min(match.value * 10, 100)} className="h-1" />
          </div>
        </div>
      )}

      {/* Footer: Time/Period */}
      <div className="mt-3 pt-2 border-t border-border">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-mono" suppressHydrationWarning>
            {match.liveData?.time || (() => {
              const date = new Date(match.startTime);
              const hours = date.getUTCHours().toString().padStart(2, '0');
              const minutes = date.getUTCMinutes().toString().padStart(2, '0');
              return `${hours}:${minutes}`;
            })()}
          </span>
          {match.liveData?.period && (
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
              {match.liveData.period}
            </span>
          )}
          {!match.liveData && (
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider" suppressHydrationWarning>
              {(() => {
                const date = new Date(match.startTime);
                const day = date.getUTCDate().toString().padStart(2, '0');
                const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
                return `${day}.${month}`;
              })()}
            </span>
          )}
        </div>
      </div>

    </div>
  );
};

export default LiveMatchCard;
