"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// Universal Sport IDs
export type SportId = 
  | "soccer" 
  | "american_football" 
  | "basketball" 
  | "baseball" 
  | "ice_hockey" 
  | "tennis" 
  | "mma"
  | "esports";

interface League {
  id: string;
  name: string;
}

interface SportConfig {
  id: SportId;
  label: string;
  leagues: League[];
}

export const SPORTS_CONFIG: SportConfig[] = [
  {
    id: "soccer",
    label: "Soccer",
    leagues: [
      { id: "all", name: "All Leagues" },
      { id: "epl", name: "Premier League" },
      { id: "laliga", name: "La Liga" },
      { id: "seriea", name: "Serie A" },
      { id: "bundesliga", name: "Bundesliga" },
      { id: "ligue1", name: "Ligue 1" },
      { id: "ucl", name: "Champions League" },
      { id: "mls", name: "MLS" },
    ]
  },
  {
    id: "american_football",
    label: "Am. Football",
    leagues: [
      { id: "all", name: "All" },
      { id: "nfl", name: "NFL" },
      { id: "ncaaf", name: "NCAA Football" },
    ]
  },
  {
    id: "basketball",
    label: "Basketball",
    leagues: [
      { id: "all", name: "All" },
      { id: "nba", name: "NBA" },
      { id: "euroleague", name: "Euroleague" },
      { id: "ncaab", name: "NCAA Basketball" },
    ]
  },
  {
    id: "baseball",
    label: "Baseball",
    leagues: [
      { id: "all", name: "All" },
      { id: "mlb", name: "MLB" },
      { id: "npb", name: "NPB (Japan)" },
    ]
  },
  {
    id: "ice_hockey",
    label: "Hockey",
    leagues: [
      { id: "all", name: "All" },
      { id: "nhl", name: "NHL" },
      { id: "khl", name: "KHL" },
    ]
  },
  {
    id: "tennis",
    label: "Tennis",
    leagues: [
      { id: "all", name: "All" },
      { id: "atp", name: "ATP" },
      { id: "wta", name: "WTA" },
      { id: "grand_slam", name: "Grand Slam" },
    ]
  },
  {
    id: "mma",
    label: "MMA / Boxing",
    leagues: [
      { id: "all", name: "All" },
      { id: "ufc", name: "UFC" },
      { id: "bellator", name: "Bellator" },
      { id: "boxing", name: "Boxing" },
    ]
  },
  {
    id: "esports",
    label: "Esports",
    leagues: [
      { id: "all", name: "All Events" },
      { id: "lol", name: "LoL" },
      { id: "csgo", name: "CS:GO" },
      { id: "dota2", name: "Dota 2" },
    ]
  }
];

interface SportsNavigationProps {
  selectedSport: string;
  selectedLeague: string;
  onSportChange: (sport: string) => void;
  onLeagueChange: (league: string) => void;
}

export default function SportsNavigation({
  selectedSport,
  selectedLeague,
  onSportChange,
  onLeagueChange
}: SportsNavigationProps) {
  
  // Fallback to "soccer" if selectedSport is not found (e.g. old state "football")
  const activeSportId = SPORTS_CONFIG.some(s => s.id === selectedSport) ? selectedSport : "soccer";
  const currentSportConfig = SPORTS_CONFIG.find(s => s.id === activeSportId);

  return (
    <div className="space-y-3 mb-6">
      {/* Level 1: Main Sports */}
      <div className="terminal-card p-1">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex w-max space-x-1 p-1">
            {SPORTS_CONFIG.map((sport) => {
              const isActive = activeSportId === sport.id;
              
              return (
                <Button
                  key={sport.id}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => {
                    onSportChange(sport.id);
                    // Reset league to first one when switching sport
                    if (sport.leagues.length > 0) {
                      onLeagueChange(sport.leagues[0].id);
                    }
                  }}
                  className={cn(
                    "h-8 px-4 text-xs transition-all rounded-none border border-transparent",
                    isActive 
                      ? "bg-primary text-primary-foreground border-primary shadow-[0_0_10px_rgba(0,255,157,0.2)]" 
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50 hover:border-primary/30"
                  )}
                >
                  <span className="uppercase tracking-wider font-bold">
                    {sport.label}
                  </span>
                </Button>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" className="h-2" />
        </ScrollArea>
      </div>

      {/* Level 2: Leagues (Sub-navigation) */}
      {currentSportConfig && currentSportConfig.leagues.length > 1 && (
        <div className="px-1 animate-in fade-in slide-in-from-top-2 duration-300">
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex w-max space-x-2 pb-2">
              {currentSportConfig.leagues.map((league) => {
                const isActive = selectedLeague === league.id;
                return (
                  <button
                    key={league.id}
                    onClick={() => onLeagueChange(league.id)}
                    className={cn(
                      "text-[10px] uppercase tracking-wide px-3 py-1.5 border transition-all duration-200",
                      isActive
                        ? "bg-secondary text-neon-cyan border-neon-cyan shadow-[0_0_5px_rgba(0,255,255,0.15)] font-bold"
                        : "bg-background/50 text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                    )}
                  >
                    {league.name}
                  </button>
                );
              })}
            </div>
            <ScrollBar orientation="horizontal" className="h-1.5" />
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
