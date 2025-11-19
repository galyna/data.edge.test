"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import LiveMatchCard from "@/components/LiveMatchCard";
import { Button } from "@/components/ui/button";
import { mockLiveScores } from "@/data/mockLiveScores";

const sports = ["All", "Football", "NBA", "MLB", "Tennis", "E-sports"];
const statuses = ["All", "Live", "Scheduled", "Finished"];

export default function LiveScoresPage() {
  const [selectedSport, setSelectedSport] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMatches = mockLiveScores.filter((match) => {
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
    <div className="grid-pattern flex min-h-screen bg-background">
      <Sidebar />

      <div className="flex flex-1 flex-col">
        <Header />

        <main className="flex-1 overflow-auto p-3">
          <div className="mx-auto max-w-[2000px] space-y-3">
            {/* Filters Section */}
            <div className="terminal-card p-3">
              <div className="flex flex-col gap-3">
                {/* Sport Filters */}
                <div>
                  <span className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
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
                  <span className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
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
                  <span className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
                    Search
                  </span>
                  <input
                    type="text"
                    placeholder="Search teams or leagues..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full max-w-md border border-border bg-card px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between px-1">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                {filteredMatches.length} {filteredMatches.length === 1 ? "Match" : "Matches"} Found
              </span>
              <span className="text-xs text-muted-foreground">
                Auto-refresh: <span className="text-primary">ON</span>
              </span>
            </div>

            {/* Match Cards Grid */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {filteredMatches.map((match) => (
                <LiveMatchCard key={match.id} match={match} />
              ))}
            </div>

            {/* No Results */}
            {filteredMatches.length === 0 && (
              <div className="terminal-card flex items-center justify-center p-8">
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
