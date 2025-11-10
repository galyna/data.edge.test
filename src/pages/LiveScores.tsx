import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import LiveMatchCard from "@/components/LiveMatchCard";
import { Button } from "@/components/ui/button";

const sports = ["All", "Football", "NBA", "MLB", "Tennis", "E-sports"];
const statuses = ["All", "Live", "Scheduled", "Finished"];

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

const mockMatches: Match[] = [
  {
    id: "1",
    sport: "Football",
    league: "Premier League",
    status: "live",
    homeTeam: { name: "Arsenal", logo: "⚽", score: 2 },
    awayTeam: { name: "Chelsea", logo: "⚽", score: 1 },
    time: "67'",
    period: "2nd Half"
  },
  {
    id: "2",
    sport: "NBA",
    league: "NBA Regular Season",
    status: "live",
    homeTeam: { name: "Lakers", logo: "🏀", score: 98 },
    awayTeam: { name: "Warriors", logo: "🏀", score: 102 },
    time: "Q3 8:24",
    period: "3rd Quarter"
  },
  {
    id: "3",
    sport: "Football",
    league: "La Liga",
    status: "scheduled",
    homeTeam: { name: "Real Madrid", logo: "⚽" },
    awayTeam: { name: "Barcelona", logo: "⚽" },
    startTime: "20:00",
    time: "20:00"
  },
  {
    id: "4",
    sport: "Tennis",
    league: "ATP Tour",
    status: "live",
    homeTeam: { name: "Djokovic", logo: "🎾", score: 2 },
    awayTeam: { name: "Alcaraz", logo: "🎾", score: 1 },
    time: "Set 4",
    period: "4th Set"
  },
  {
    id: "5",
    sport: "MLB",
    league: "MLB Regular Season",
    status: "finished",
    homeTeam: { name: "Yankees", logo: "⚾", score: 5 },
    awayTeam: { name: "Red Sox", logo: "⚾", score: 3 },
    time: "Final",
    period: "Game Finished"
  },
  {
    id: "6",
    sport: "E-sports",
    league: "LEC Spring",
    status: "live",
    homeTeam: { name: "G2 Esports", logo: "🎮", score: 1 },
    awayTeam: { name: "Fnatic", logo: "🎮", score: 0 },
    time: "Game 2",
    period: "Best of 3"
  },
  {
    id: "7",
    sport: "Football",
    league: "Bundesliga",
    status: "live",
    homeTeam: { name: "Bayern", logo: "⚽", score: 3 },
    awayTeam: { name: "Dortmund", logo: "⚽", score: 2 },
    time: "78'",
    period: "2nd Half"
  },
  {
    id: "8",
    sport: "NBA",
    league: "NBA Regular Season",
    status: "scheduled",
    homeTeam: { name: "Celtics", logo: "🏀" },
    awayTeam: { name: "Heat", logo: "🏀" },
    startTime: "19:30",
    time: "19:30"
  }
];

const LiveScores = () => {
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
};

export default LiveScores;
