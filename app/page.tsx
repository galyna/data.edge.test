"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import UnifiedSportsFeed from "@/components/UnifiedSportsFeed";
import MultiSourceComparison from "@/components/MultiSourceComparison";
import OddsAggregator from "@/components/OddsAggregator";
import ScheduleCalendar from "@/components/ScheduleCalendar";
import ValueRadar from "@/components/ValueRadar";
import { mockMatches, mockDataSources, mockValueSignals } from "@/data/mockMatches";
import { useRealtimeData } from "@/hooks/useRealtimeData";
import { Match } from "@/types/match";
import MatchDetailDialog from "@/components/MatchDetailDialog";

export default function Home() {
  const { matches, lastUpdate } = useRealtimeData(mockMatches, mockDataSources, 8000);
  
  // Initialize selectedMatch with first match that has sources (using function to avoid re-computation)
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(() => {
    // This function runs only once during initial render
    return mockMatches.find(m => m.sources && m.sources.length > 0) || null;
  });
  
  const [dialogOpen, setDialogOpen] = useState(false);

  // Update selectedMatch if it becomes null and matches are available
  useEffect(() => {
    if (!selectedMatch && matches.length > 0) {
      const firstMatchWithSources = matches.find(m => m.sources && m.sources.length > 0);
      if (firstMatchWithSources) {
        setSelectedMatch(firstMatchWithSources);
      }
    }
  }, [matches, selectedMatch]);

  const handleMatchClick = (match: Match) => {
    setSelectedMatch(match);
    setDialogOpen(true);
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
        <Header />

        {/* Dashboard Content */}
        <main className="flex-1 p-2 overflow-auto">
          <div className="max-w-[2000px] mx-auto grid grid-cols-12 gap-2">
            
            {/* Left Column (Main Content) */}
            <div className="col-span-9 space-y-2">
              {/* Hero: Unified Sports Feed */}
              <div>
                <UnifiedSportsFeed matches={matches} onMatchClick={handleMatchClick} />
              </div>

              {/* Multi-Source Comparison */}
              <div>
                <MultiSourceComparison 
                  match={selectedMatch} 
                  matches={matches}
                  onMatchSelect={handleMatchSelect}
                />
              </div>

              {/* Grid for OddsAggregator and ScheduleCalendar */}
              <div className="grid grid-cols-9 gap-2">
                {/* Odds Aggregator */}
                <div className="col-span-4">
                  <OddsAggregator match={selectedMatch} />
                </div>
                
                {/* Schedule Calendar */}
                <div className="col-span-5">
                  <ScheduleCalendar matches={matches} />
                </div>
              </div>
            </div>

            {/* Right Column (Value Signals) */}
            <div className="col-span-3">
              <ValueRadar signals={mockValueSignals} />
            </div>

          </div>
        </main>
      </div>

      {/* Match Detail Dialog */}
      <MatchDetailDialog 
        match={selectedMatch}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}

