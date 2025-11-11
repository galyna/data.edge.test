"use client";

import { useState, useEffect } from "react";

export const dynamic = "force-dynamic";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import UnifiedSportsFeed from "@/components/UnifiedSportsFeed";
import MultiSourceComparison from "@/components/MultiSourceComparison";
import OddsAggregator from "@/components/OddsAggregator";
import ScheduleCalendar from "@/components/ScheduleCalendar";
import DataQualityIndicator from "@/components/DataQualityIndicator";
import ValueRadar from "@/components/ValueRadar";
import { mockMatches, mockDataSources, mockValueSignals } from "@/data/mockMatches";
import { useRealtimeData } from "@/hooks/useRealtimeData";
import { Match } from "@/types/match";
import MatchDetailDialog from "@/components/MatchDetailDialog";

export default function Home() {
  const { matches, dataSources, lastUpdate } = useRealtimeData(mockMatches, mockDataSources, 8000);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Auto-select first match with sources when matches are loaded
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
          <div className="max-w-[2000px] mx-auto space-y-2">
            
            {/* Hero: Unified Sports Feed */}
            <div className="col-span-12">
              <UnifiedSportsFeed matches={matches} onMatchClick={handleMatchClick} />
            </div>

            {/* Main Grid Layout - Optimized for data analytics */}
            <div className="grid grid-cols-12 gap-2">
              
              {/* Row 1: Priority Components - Data Analysis */}
              {/* Multi-Source Comparison - 8 columns (PRIORITY: Core analytics) */}
              <div className="col-span-8">
                <MultiSourceComparison 
                  match={selectedMatch} 
                  matches={matches}
                  onMatchSelect={handleMatchSelect}
                />
              </div>
              
              {/* Odds Aggregator - 4 columns (PRIORITY: Odds comparison) */}
              <div className="col-span-4">
                <OddsAggregator match={selectedMatch} />
              </div>
              
              {/* Row 2: Secondary Components - Efficient space usage */}
              {/* Schedule Calendar - 5 columns (Compact) */}
              <div className="col-span-5">
                <ScheduleCalendar matches={matches} />
              </div>
              
              {/* Data Quality Indicator - 4 columns (PRIORITY: Source monitoring) */}
              <div className="col-span-4">
                <DataQualityIndicator sources={dataSources} />
              </div>
              
              {/* Value Radar - 3 columns (Compact signals) */}
              <div className="col-span-3">
                <ValueRadar signals={mockValueSignals} />
              </div>
              
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

