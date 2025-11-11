import { useState } from "react";
import { Search, Trophy, Users, TrendingUp, Gamepad2 } from "lucide-react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface EsportsMatch {
  id: string;
  teams: [string, string];
  game: string;
  tournament: string;
  status: "live" | "upcoming" | "finished";
  score?: [number, number];
  time: string;
  viewers?: number;
  odds?: {
    team1: number;
    team2: number;
  };
}

const mockMatches: EsportsMatch[] = [
  {
    id: "1",
    teams: ["Team Liquid", "FaZe Clan"],
    game: "CS:GO",
    tournament: "IEM Katowice",
    status: "live",
    score: [13, 11],
    time: "Live",
    viewers: 125000,
    odds: { team1: 1.85, team2: 1.95 }
  },
  {
    id: "2",
    teams: ["T1", "Gen.G"],
    game: "League of Legends",
    tournament: "LCK Spring",
    status: "live",
    score: [1, 0],
    time: "Live",
    viewers: 89000,
    odds: { team1: 1.45, team2: 2.75 }
  },
  {
    id: "3",
    teams: ["OG", "Team Secret"],
    game: "Dota 2",
    tournament: "DPC WEU",
    status: "upcoming",
    time: "2 hours",
    viewers: 0,
    odds: { team1: 2.10, team2: 1.70 }
  },
  {
    id: "4",
    teams: ["100 Thieves", "Sentinels"],
    game: "Valorant",
    tournament: "VCT Americas",
    status: "upcoming",
    time: "4 hours",
    viewers: 0,
    odds: { team1: 2.25, team2: 1.62 }
  },
  {
    id: "5",
    teams: ["G2 Esports", "Fnatic"],
    game: "CS:GO",
    tournament: "ESL Pro League",
    status: "finished",
    score: [16, 14],
    time: "2 hours ago",
    viewers: 0
  }
];

const games = ["all", "CS:GO", "League of Legends", "Dota 2", "Valorant"];
const statuses = ["all", "live", "upcoming", "finished"];

const Esports = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGame, setSelectedGame] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const filteredMatches = mockMatches.filter(match => {
    const matchesSearch = match.teams[0].toLowerCase().includes(searchQuery.toLowerCase()) ||
                         match.teams[1].toLowerCase().includes(searchQuery.toLowerCase()) ||
                         match.tournament.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGame = selectedGame === "all" || match.game === selectedGame;
    const matchesStatus = selectedStatus === "all" || match.status === selectedStatus;
    return matchesSearch && matchesGame && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "live":
        return (
          <Badge className="bg-signal/20 text-signal border-signal/50 animate-pulse">
            <span className="w-1.5 h-1.5 bg-signal rounded-full mr-1.5 animate-pulse" />
            LIVE
          </Badge>
        );
      case "upcoming":
        return <Badge className="bg-primary/20 text-primary border-primary/50">Upcoming</Badge>;
      case "finished":
        return <Badge className="bg-muted/50 text-muted-foreground border-border">Finished</Badge>;
    }
  };

  const getGameIcon = (game: string) => {
    return <Gamepad2 className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Header />
        
        <main className="flex-1 p-6">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-2">E-sports & Niche Sports</h1>
            <p className="text-sm text-muted-foreground">Live matches, tournaments, and specialized statistics for competitive gaming</p>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search teams or tournaments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            {/* Game Filter */}
            <div className="flex gap-2">
              {games.map((game) => (
                <button
                  key={game}
                  onClick={() => setSelectedGame(game)}
                  className={`px-4 py-2 text-xs font-medium uppercase tracking-wider transition-all ${
                    selectedGame === game
                      ? "bg-primary/20 text-primary border border-primary/50"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted border border-transparent"
                  }`}
                >
                  {game}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              {statuses.map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-4 py-2 text-xs font-medium uppercase tracking-wider transition-all ${
                    selectedStatus === status
                      ? "bg-primary/20 text-primary border border-primary/50"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted border border-transparent"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4 bg-card border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 border border-primary/30 flex items-center justify-center">
                  <Gamepad2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Live Matches</p>
                  <p className="text-xl font-bold text-signal">12</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-card border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 border border-primary/30 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total Viewers</p>
                  <p className="text-xl font-bold text-foreground">347K</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-card border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 border border-primary/30 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Tournaments</p>
                  <p className="text-xl font-bold text-foreground">28</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-card border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 border border-primary/30 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Markets Open</p>
                  <p className="text-xl font-bold text-primary">156</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Matches Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredMatches.map((match) => (
              <Card key={match.id} className="p-4 bg-card border-border hover:border-primary/50 transition-all cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getGameIcon(match.game)}
                    <span className="text-xs font-medium text-muted-foreground">{match.game}</span>
                  </div>
                  {getStatusBadge(match.status)}
                </div>

                <div className="mb-3">
                  <p className="text-xs text-muted-foreground mb-1">{match.tournament}</p>
                  {match.viewers && match.viewers > 0 && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="w-3 h-3" />
                      <span>{(match.viewers / 1000).toFixed(1)}K watching</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3 mb-3">
                  {/* Team 1 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-8 h-8 bg-primary/10 border border-primary/30 flex items-center justify-center">
                        <span className="text-xs font-bold text-primary">{match.teams[0].slice(0, 2).toUpperCase()}</span>
                      </div>
                      <span className="text-sm font-medium text-foreground">{match.teams[0]}</span>
                    </div>
                    {match.score && (
                      <span className="text-xl font-bold text-foreground ml-4">{match.score[0]}</span>
                    )}
                    {match.odds && !match.score && (
                      <span className="text-sm font-mono text-muted-foreground ml-4">{match.odds.team1.toFixed(2)}</span>
                    )}
                  </div>

                  {/* Team 2 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-8 h-8 bg-muted/50 border border-border flex items-center justify-center">
                        <span className="text-xs font-bold text-muted-foreground">{match.teams[1].slice(0, 2).toUpperCase()}</span>
                      </div>
                      <span className="text-sm font-medium text-foreground">{match.teams[1]}</span>
                    </div>
                    {match.score && (
                      <span className="text-xl font-bold text-foreground ml-4">{match.score[1]}</span>
                    )}
                    {match.odds && !match.score && (
                      <span className="text-sm font-mono text-muted-foreground ml-4">{match.odds.team2.toFixed(2)}</span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground">{match.time}</p>
                </div>
              </Card>
            ))}
          </div>

          {filteredMatches.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No matches found</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Esports;
