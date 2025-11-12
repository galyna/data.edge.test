"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import UnifiedSportsFeed from "@/components/UnifiedSportsFeed";
import MultiSourceComparison from "@/components/MultiSourceComparison";
import ScheduleCalendar from "@/components/ScheduleCalendar";
import OddsAggregator from "@/components/OddsAggregator";
import ValueRadar from "@/components/ValueRadar";
import { mockMatches, mockDataSources, mockValueSignals } from "@/data/mockMatches";
import { useRealtimeData } from "@/hooks/useRealtimeData";
import { Match } from "@/types/match";
import MatchDetailDialog from "@/components/MatchDetailDialog";
import { useMatchStore } from "@/store/matchStore";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; - No longer needed

export default function Home() {
  const { matches, lastUpdate } = useRealtimeData(mockMatches, mockDataSources, 8000);
  const [selectedSport, setSelectedSport] = useState("football");
  
  const { selectedMatch, setSelectedMatch, isMatchDetailDialogOpen, setMatchDetailDialogOpen } = useMatchStore();

  // Initialize selectedMatch with first match that has sources (using function to avoid re-computation)
  useEffect(() => {
    if (!selectedMatch && matches.length > 0) {
      const firstMatchWithSources = matches.find(m => m.sources && m.sources.length > 0);
      if (firstMatchWithSources) {
        setSelectedMatch(firstMatchWithSources);
      }
    }
  }, [matches, selectedMatch, setSelectedMatch]);

  const handleMatchClick = (match: Match) => {
    setSelectedMatch(match);
    setMatchDetailDialogOpen(true);
  };

  const handleMatchSelect = (match: Match) => {
    setSelectedMatch(match);
    // Don't open dialog, just select for comparison
  };

  return (
    <div className="min-h-screen bg-background grid-pattern flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header selectedSport={selectedSport} onSportChange={setSelectedSport} />

        {/* Dashboard Content */}
        <main className="flex-1 p-2 overflow-auto">
          <div className="max-w-[2000px] mx-auto grid grid-cols-12 gap-2">
            
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

