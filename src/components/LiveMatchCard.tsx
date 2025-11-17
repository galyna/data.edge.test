"use client";

import { Circle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Match } from "@/types/match";
import { TeamLogo } from "./TeamLogo";

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
    const primarySource =
      match.sources.find((s) => s.sourceName === match.bestSource) || match.sources[0];
    return primarySource?.sourceName || match.bestSource || "Unknown";
  };

  const getHomeScore = () => match.liveData?.homeScore ?? match.homeTeam.logo;
  const getAwayScore = () => match.liveData?.awayScore ?? match.awayTeam.logo;

  return (
    <div className="terminal-card hover-lift cursor-pointer p-3">
      {/* Header: Sport, League, Status */}
      <div className="mb-3 flex items-center justify-between border-b border-border pb-2">
        <div className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            {match.sport}
          </span>
          <span className="text-[10px] text-muted-foreground/70">{match.league}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Circle
              className={`h-2 w-2 fill-current ${getStatusColor()} ${
                match.status === "live" ? "animate-pulse" : ""
              }`}
            />
            <span
              className={`text-[10px] font-semibold uppercase tracking-wider ${getStatusColor()}`}
            >
              {getStatusText()}
            </span>
          </div>
          {showSource && (
            <Tooltip>
              <TooltipTrigger>
                <div className="inline-flex items-center border border-border px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                  {getSourceBadge()}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-1 text-xs">
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
          <div className="flex flex-1 items-center gap-2">
            <TeamLogo team={match.homeTeam} sport={match.sport.toLowerCase()} size="md" />
            <span className="truncate text-sm font-medium text-foreground">
              {match.homeTeam.name}
            </span>
          </div>
          {match.liveData && (
            <span className="ml-2 font-mono text-2xl font-bold text-foreground">
              {getHomeScore()}
            </span>
          )}
        </div>

        {/* Away Team */}
        <div className="flex items-center justify-between">
          <div className="flex flex-1 items-center gap-2">
            <TeamLogo team={match.awayTeam} sport={match.sport.toLowerCase()} size="md" />
            <span className="truncate text-sm font-medium text-foreground">
              {match.awayTeam.name}
            </span>
          </div>
          {match.liveData && (
            <span className="ml-2 font-mono text-2xl font-bold text-foreground">
              {getAwayScore()}
            </span>
          )}
        </div>
      </div>

      {/* Stats (if available and enabled) */}
      {showStats && match.liveData && (
        <div className="mt-3 space-y-2 border-t border-border pt-3">
          {/* Example: Possession or other stats */}
          <div>
            <div className="mb-1 flex justify-between text-xs">
              <span className="text-muted-foreground">Value</span>
              <span className="text-signal font-mono">+{match.value.toFixed(1)}%</span>
            </div>
            <Progress value={Math.min(match.value * 10, 100)} className="h-1" />
          </div>
        </div>
      )}

      {/* Footer: Time/Period */}
      <div className="mt-3 border-t border-border pt-2">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-muted-foreground" suppressHydrationWarning>
            {match.liveData?.time ||
              (() => {
                const date = new Date(match.startTime);
                const hours = date.getUTCHours().toString().padStart(2, "0");
                const minutes = date.getUTCMinutes().toString().padStart(2, "0");
                return `${hours}:${minutes}`;
              })()}
          </span>
          {match.liveData?.period && (
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {match.liveData.period}
            </span>
          )}
          {!match.liveData && (
            <span
              className="text-[10px] uppercase tracking-wider text-muted-foreground"
              suppressHydrationWarning
            >
              {(() => {
                const date = new Date(match.startTime);
                const day = date.getUTCDate().toString().padStart(2, "0");
                const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
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
