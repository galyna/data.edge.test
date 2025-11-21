"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ChevronDown } from "lucide-react";
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
    label: "SOCCER",
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
    label: "FOOTBALL",
    leagues: [
      { id: "all", name: "All" },
      { id: "nfl", name: "NFL" },
      { id: "ncaaf", name: "NCAA Football" },
    ]
  },
  {
    id: "basketball",
    label: "BASKETBALL",
    leagues: [
      { id: "all", name: "All" },
      { id: "nba", name: "NBA" },
      { id: "euroleague", name: "Euroleague" },
      { id: "ncaab", name: "NCAA Basketball" },
    ]
  },
  {
    id: "baseball",
    label: "BASEBALL",
    leagues: [
      { id: "all", name: "All" },
      { id: "mlb", name: "MLB" },
      { id: "npb", name: "NPB (Japan)" },
    ]
  },
  {
    id: "ice_hockey",
    label: "HOCKEY",
    leagues: [
      { id: "all", name: "All" },
      { id: "nhl", name: "NHL" },
      { id: "khl", name: "KHL" },
    ]
  },
  {
    id: "tennis",
    label: "TENNIS",
    leagues: [
      { id: "all", name: "All" },
      { id: "atp", name: "ATP" },
      { id: "wta", name: "WTA" },
      { id: "grand_slam", name: "Grand Slam" },
    ]
  },
  {
    id: "mma",
    label: "MMA",
    leagues: [
      { id: "all", name: "All" },
      { id: "ufc", name: "UFC" },
      { id: "bellator", name: "Bellator" },
      { id: "boxing", name: "Boxing" },
    ]
  },
  {
    id: "esports",
    label: "ESPORTS",
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
  const [isLeagueDropdownOpen, setIsLeagueDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Fallback to "soccer" if selectedSport is not found (e.g. old state "football")
  const activeSportId = SPORTS_CONFIG.some(s => s.id === selectedSport) ? selectedSport : "soccer";
  const currentSportConfig = SPORTS_CONFIG.find(s => s.id === activeSportId);
  const selectedLeagueName = currentSportConfig?.leagues.find(l => l.id === selectedLeague)?.name || "All";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsLeagueDropdownOpen(false);
      }
    };

    if (isLeagueDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isLeagueDropdownOpen]);

  return (
    <div className="relative mb-3">
      {/* Horizontal layout: Sports + League Dropdown */}
      <div className="terminal-card p-1 flex items-center gap-2">
        {/* Level 1: Main Sports */}
        <ScrollArea className="flex-1 whitespace-nowrap">
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
                  <span className="tracking-wider font-bold">
                    {sport.label}
                  </span>
                </Button>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" className="h-2" />
        </ScrollArea>

        {/* Level 2: League Dropdown Button */}
        {currentSportConfig && currentSportConfig.leagues.length > 1 && (
          <div className="relative z-10" ref={dropdownRef}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsLeagueDropdownOpen(!isLeagueDropdownOpen)}
              className={cn(
                "h-8 px-3 text-xs border transition-all whitespace-nowrap",
                isLeagueDropdownOpen
                  ? "border-primary text-primary bg-secondary/50"
                  : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
              )}
            >
              <span className="uppercase tracking-wide font-medium">
                {selectedLeagueName}
              </span>
              <ChevronDown className={cn(
                "ml-2 h-3 w-3 transition-transform",
                isLeagueDropdownOpen && "rotate-180"
              )} />
            </Button>
          </div>
        )}
      </div>

      {/* Dropdown Menu - Outside card, absolute positioned */}
      {currentSportConfig && currentSportConfig.leagues.length > 1 && isLeagueDropdownOpen && (
        <div 
          className="absolute right-0 top-[calc(100%-0.75rem)] z-50 min-w-[160px] terminal-card border border-primary/30 shadow-[0_0_20px_rgba(0,255,157,0.3)] animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="p-1 max-h-[300px] overflow-y-auto">
            {currentSportConfig.leagues.map((league) => {
              const isActive = selectedLeague === league.id;
              return (
                <button
                  key={league.id}
                  onClick={() => {
                    onLeagueChange(league.id);
                    setIsLeagueDropdownOpen(false);
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 text-xs uppercase tracking-wide transition-all duration-150 rounded-none",
                    isActive
                      ? "bg-secondary text-neon-cyan font-bold"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  )}
                >
                  {league.name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
