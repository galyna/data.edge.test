"use client";

import { useState } from "react";
import { Search, Trophy, Users, TrendingUp, Gamepad2 } from "lucide-react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { mockEsportsMatches } from "@/data/mockEsports";

const games = ["all", "CS:GO", "League of Legends", "Dota 2", "Valorant"];
const statuses = ["all", "live", "upcoming", "finished"];

export default function EsportsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGame, setSelectedGame] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [headerSport, setHeaderSport] = useState<string>("esports");

  const filteredMatches = mockEsportsMatches.filter((match) => {
    const matchesSearch =
      match.teams[0].toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.teams[1].toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.tournament.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGame = selectedGame === "all" || match.game === selectedGame;
    const matchesStatus = selectedStatus === "all" || match.status === selectedStatus;
    return matchesSearch && matchesGame && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "live":
        return (
          <Badge className="bg-signal/20 text-signal border-signal/50 animate-pulse">
            <span className="bg-signal mr-1.5 h-1.5 w-1.5 animate-pulse rounded-full" />
            LIVE
          </Badge>
        );
      case "upcoming":
        return <Badge className="border-primary/50 bg-primary/20 text-primary">Upcoming</Badge>;
      case "finished":
        return <Badge className="border-border bg-muted/50 text-muted-foreground">Finished</Badge>;
    }
  };

  const getGameIcon = (_game: string) => {
    return <Gamepad2 className="h-4 w-4" />;
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <div className="flex flex-1 flex-col">
        <Header selectedSport={headerSport} onSportChange={setHeaderSport} />

        <main className="flex-1 p-6">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="mb-2 text-2xl font-bold text-foreground">E-sports & Niche Sports</h1>
            <p className="text-sm text-muted-foreground">
              Live matches, tournaments, and specialized statistics for competitive gaming
            </p>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="relative min-w-[300px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search teams or tournaments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-border bg-muted/50 py-2 pl-10 pr-4 text-sm transition-colors focus:border-primary focus:outline-none"
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
                      ? "border border-primary/50 bg-primary/20 text-primary"
                      : "border border-transparent bg-muted/50 text-muted-foreground hover:bg-muted"
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
                      ? "border border-primary/50 bg-primary/20 text-primary"
                      : "border border-transparent bg-muted/50 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Stats Overview */}
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
            <Card className="border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center border border-primary/30 bg-primary/10">
                  <Gamepad2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">Live Matches</p>
                  <p className="text-signal text-xl font-bold">12</p>
                </div>
              </div>
            </Card>

            <Card className="border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center border border-primary/30 bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">Total Viewers</p>
                  <p className="text-xl font-bold text-foreground">347K</p>
                </div>
              </div>
            </Card>

            <Card className="border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center border border-primary/30 bg-primary/10">
                  <Trophy className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">Tournaments</p>
                  <p className="text-xl font-bold text-foreground">28</p>
                </div>
              </div>
            </Card>

            <Card className="border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center border border-primary/30 bg-primary/10">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">Markets Open</p>
                  <p className="text-xl font-bold text-primary">156</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Matches Grid */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {filteredMatches.map((match) => (
              <Card
                key={match.id}
                className="cursor-pointer border-border bg-card p-4 transition-all hover:border-primary/50"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getGameIcon(match.game)}
                    <span className="text-xs font-medium text-muted-foreground">{match.game}</span>
                  </div>
                  {getStatusBadge(match.status)}
                </div>

                <div className="mb-3">
                  <p className="mb-1 text-xs text-muted-foreground">{match.tournament}</p>
                  {match.viewers && match.viewers > 0 && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      <span>{(match.viewers / 1000).toFixed(1)}K watching</span>
                    </div>
                  )}
                </div>

                <div className="mb-3 space-y-3">
                  {/* Team 1 */}
                  <div className="flex items-center justify-between">
                    <div className="flex flex-1 items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center border border-primary/30 bg-primary/10">
                        <span className="text-xs font-bold text-primary">
                          {match.teams[0].slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-foreground">{match.teams[0]}</span>
                    </div>
                    {match.score && (
                      <span className="ml-4 text-xl font-bold text-foreground">
                        {match.score[0]}
                      </span>
                    )}
                    {match.odds && !match.score && (
                      <span className="ml-4 font-mono text-sm text-muted-foreground">
                        {match.odds.team1.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Team 2 */}
                  <div className="flex items-center justify-between">
                    <div className="flex flex-1 items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center border border-border bg-muted/50">
                        <span className="text-xs font-bold text-muted-foreground">
                          {match.teams[1].slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-foreground">{match.teams[1]}</span>
                    </div>
                    {match.score && (
                      <span className="ml-4 text-xl font-bold text-foreground">
                        {match.score[1]}
                      </span>
                    )}
                    {match.odds && !match.score && (
                      <span className="ml-4 font-mono text-sm text-muted-foreground">
                        {match.odds.team2.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="border-t border-border pt-3">
                  <p className="text-xs text-muted-foreground">{match.time}</p>
                </div>
              </Card>
            ))}
          </div>

          {filteredMatches.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No matches found</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
