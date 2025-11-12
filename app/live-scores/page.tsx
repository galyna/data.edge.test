"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import LiveMatchCard from "@/components/LiveMatchCard";
import { Button } from "@/components/ui/button";
import { Match } from "@/types/match";

const sports = ["All", "Football", "NBA", "MLB", "Tennis", "E-sports"];
const statuses = ["All", "Live", "Scheduled", "Finished"];

const mockMatches: Match[] = [
  {
    id: "1",
    sport: "Football",
    league: "Premier League",
    status: "live",
    homeTeam: { name: "Arsenal", logo: "⚽", shortName: "ARS" },
    awayTeam: { name: "Chelsea", logo: "⚽", shortName: "CHE" },
    startTime: new Date(Date.now() - 67 * 60000).toISOString(),
    aggregatedOdds: { home: 2.15, draw: 3.40, away: 3.20 },
    sources: [],
    spread: 0.05,
    spreadQuality: "low",
    value: 4.5,
    bestSource: "Source A",
    liveData: {
      homeScore: 2,
      awayScore: 1,
      period: "2nd Half",
      time: "67'",
      lastUpdate: new Date().toISOString()
    }
  },
  {
    id: "2",
    sport: "NBA",
    league: "NBA Regular Season",
    status: "live",
    homeTeam: { name: "Lakers", logo: "🏀", shortName: "LAL" },
    awayTeam: { name: "Warriors", logo: "🏀", shortName: "GSW" },
    startTime: new Date(Date.now() - 125 * 60000).toISOString(),
    aggregatedOdds: { home: 1.95, draw: 0, away: 1.85 },
    sources: [],
    spread: 0.03,
    spreadQuality: "low",
    value: 2.8,
    bestSource: "Source B",
    liveData: {
      homeScore: 98,
      awayScore: 102,
      period: "3rd Quarter",
      time: "Q3 8:24",
      lastUpdate: new Date().toISOString()
    }
  },
  {
    id: "3",
    sport: "Football",
    league: "La Liga",
    status: "scheduled",
    homeTeam: { name: "Real Madrid", logo: "⚽", shortName: "RMA" },
    awayTeam: { name: "Barcelona", logo: "⚽", shortName: "FCB" },
    startTime: new Date(Date.now() + 2 * 60 * 60000).toISOString(),
    aggregatedOdds: { home: 2.45, draw: 3.20, away: 2.90 },
    sources: [],
    spread: 0.08,
    spreadQuality: "medium",
    value: 6.2,
    bestSource: "Source C"
  },
  {
    id: "4",
    sport: "Tennis",
    league: "ATP Tour",
    status: "live",
    homeTeam: { name: "Djokovic", logo: "🎾", shortName: "DJO" },
    awayTeam: { name: "Alcaraz", logo: "🎾", shortName: "ALC" },
    startTime: new Date(Date.now() - 180 * 60000).toISOString(),
    aggregatedOdds: { home: 1.65, draw: 0, away: 2.25 },
    sources: [],
    spread: 0.04,
    spreadQuality: "low",
    value: 3.1,
    bestSource: "Source A",
    liveData: {
      homeScore: 2,
      awayScore: 1,
      period: "4th Set",
      time: "Set 4",
      lastUpdate: new Date().toISOString()
    }
  },
  {
    id: "5",
    sport: "MLB",
    league: "MLB Regular Season",
    status: "finished",
    homeTeam: { name: "Yankees", logo: "⚾", shortName: "NYY" },
    awayTeam: { name: "Red Sox", logo: "⚾", shortName: "BOS" },
    startTime: new Date(Date.now() - 240 * 60000).toISOString(),
    aggregatedOdds: { home: 1.75, draw: 0, away: 2.05 },
    sources: [],
    spread: 0.02,
    spreadQuality: "low",
    value: 1.5,
    bestSource: "Source B",
    liveData: {
      homeScore: 5,
      awayScore: 3,
      period: "Game Finished",
      time: "Final",
      lastUpdate: new Date(Date.now() - 30 * 60000).toISOString()
    }
  },
  {
    id: "6",
    sport: "E-sports",
    league: "LEC Spring",
    status: "live",
    homeTeam: { name: "G2 Esports", logo: "🎮", shortName: "G2" },
    awayTeam: { name: "Fnatic", logo: "🎮", shortName: "FNC" },
    startTime: new Date(Date.now() - 45 * 60000).toISOString(),
    aggregatedOdds: { home: 1.55, draw: 0, away: 2.40 },
    sources: [],
    spread: 0.06,
    spreadQuality: "medium",
    value: 4.8,
    bestSource: "Source D",
    liveData: {
      homeScore: 1,
      awayScore: 0,
      period: "Best of 3",
      time: "Game 2",
      lastUpdate: new Date().toISOString()
    }
  },
  {
    id: "7",
    sport: "Football",
    league: "Bundesliga",
    status: "live",
    homeTeam: { name: "Bayern", logo: "⚽", shortName: "BAY" },
    awayTeam: { name: "Dortmund", logo: "⚽", shortName: "DOR" },
    startTime: new Date(Date.now() - 78 * 60000).toISOString(),
    aggregatedOdds: { home: 1.85, draw: 3.60, away: 4.20 },
    sources: [],
    spread: 0.07,
    spreadQuality: "medium",
    value: 5.5,
    bestSource: "Source A",
    liveData: {
      homeScore: 3,
      awayScore: 2,
      period: "2nd Half",
      time: "78'",
      lastUpdate: new Date().toISOString()
    }
  },
  {
    id: "8",
    sport: "NBA",
    league: "NBA Regular Season",
    status: "scheduled",
    homeTeam: { name: "Celtics", logo: "🏀", shortName: "BOS" },
    awayTeam: { name: "Heat", logo: "🏀", shortName: "MIA" },
    startTime: new Date(Date.now() + 90 * 60000).toISOString(),
    aggregatedOdds: { home: 1.70, draw: 0, away: 2.10 },
    sources: [],
    spread: 0.05,
    spreadQuality: "low",
    value: 3.4,
    bestSource: "Source C"
  }
];

export default function LiveScoresPage() {
  const [selectedSport, setSelectedSport] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMatches = mockMatches.filter((match) => {
    const sportMatch = selectedSport === "All" || match.sport === selectedSport;
    const statusMatch = selectedStatus === "All" || match.status === selectedStatus.toLowerCase();
    const searchMatch = 
      searchQuery === "" ||
      match.homeTeam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.awayTeam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.league.toLowerCase().includes(searchQuery.toLowerCase());
    
    return sportMatch && statusMatch && searchMatch;
  });

  return (
    <div className="min-h-screen bg-background grid-pattern flex">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header />

        <main className="flex-1 p-3 overflow-auto">
          <div className="max-w-[2000px] mx-auto space-y-3">
            
            {/* Filters Section */}
            <div className="terminal-card p-3">
              <div className="flex flex-col gap-3">
                
                {/* Sport Filters */}
                <div>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                    Sport
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {sports.map((sport) => (
                      <Button
                        key={sport}
                        onClick={() => setSelectedSport(sport)}
                        variant={selectedSport === sport ? "default" : "outline"}
                        size="sm"
                        className="text-xs"
                      >
                        {sport}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Status Filters */}
                <div>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                    Status
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {statuses.map((status) => (
                      <Button
                        key={status}
                        onClick={() => setSelectedStatus(status)}
                        variant={selectedStatus === status ? "default" : "outline"}
                        size="sm"
                        className="text-xs"
                      >
                        {status}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Search */}
                <div>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                    Search
                  </span>
                  <input
                    type="text"
                    placeholder="Search teams or leagues..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full max-w-md bg-card border border-border px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                  />
                </div>

              </div>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between px-1">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                {filteredMatches.length} {filteredMatches.length === 1 ? 'Match' : 'Matches'} Found
              </span>
              <span className="text-xs text-muted-foreground">
                Auto-refresh: <span className="text-primary">ON</span>
              </span>
            </div>

            {/* Match Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredMatches.map((match) => (
                <LiveMatchCard key={match.id} match={match} />
              ))}
            </div>

            {/* No Results */}
            {filteredMatches.length === 0 && (
              <div className="terminal-card p-8 flex items-center justify-center">
                <span className="text-sm text-muted-foreground">
                  No matches found. Try adjusting your filters.
                </span>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}

