"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import UnifiedSportsFeed from "@/components/UnifiedSportsFeed";
import MultiSourceComparison from "@/components/MultiSourceComparison";
import OddsAggregator from "@/components/OddsAggregator";
import ValueRadar from "@/components/ValueRadar";
import { mockMatches, mockDataSources, mockValueSignals } from "@/data/mockMatches";
import { useRealtimeData } from "@/hooks/useRealtimeData";
import { Match } from "@/types/match";
import MatchDetailDialog from "@/components/MatchDetailDialog";
import { useMatchStore } from "@/store/matchStore";

export default function Home() {
  const { matches } = useRealtimeData(mockMatches, mockDataSources, 8000);
  const [selectedSport, setSelectedSport] = useState("football");

  const { selectedMatch, setSelectedMatch, isMatchDetailDialogOpen, setMatchDetailDialogOpen } =
    useMatchStore();

  // Initialize selectedMatch with first match that has sources (using function to avoid re-computation)
  useEffect(() => {
    if (!selectedMatch && matches.length > 0) {
      const firstMatchWithSources = matches.find((m) => m.sources && m.sources.length > 0);
      if (firstMatchWithSources) {
        setSelectedMatch(firstMatchWithSources);
      }
    }
  }, [matches, selectedMatch, setSelectedMatch]);

  const handleMatchSelect = (match: Match) => {
    setSelectedMatch(match);
    // Don't open dialog, just select for comparison
  };

  return (
    <div className="grid-pattern flex min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <Header selectedSport={selectedSport} onSportChange={setSelectedSport} />

        {/* Dashboard Content */}
        <main className="flex-1 overflow-auto p-2">
          <div className="mx-auto grid max-w-[2000px] grid-cols-12 gap-2">
            {/* Left Column (Main Content) */}
            <div className="col-span-8 space-y-2">
              {/* Hero: Unified Sports Feed */}
              <div>
                <UnifiedSportsFeed matches={matches} selectedSport={selectedSport} />
              </div>

              {/* Multi-Source Comparison */}
              <div>
                <MultiSourceComparison
                  match={selectedMatch}
                  matches={matches}
                  onMatchSelect={handleMatchSelect}
                />
              </div>
            </div>

            {/* Right Column (Odds Aggregator & Value Signals) */}
            <div className="col-span-4 space-y-2">
              {/* Odds Aggregator */}
              <div>
                <OddsAggregator match={selectedMatch} />
              </div>

              {/* Value Signals */}
              <div>
                <ValueRadar signals={mockValueSignals} />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Match Detail Dialog */}
      <MatchDetailDialog
        match={selectedMatch}
        open={isMatchDetailDialogOpen}
        onOpenChange={setMatchDetailDialogOpen}
      />
    </div>
  );
}
