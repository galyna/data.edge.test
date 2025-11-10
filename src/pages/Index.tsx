import { useState, useEffect } from "react";
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

const Index = () => {
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
        <main className="flex-1 p-3 overflow-auto">
          <div className="max-w-[2000px] mx-auto space-y-3">
            
            {/* Hero: Unified Sports Feed */}
            <div className="col-span-12">
              <UnifiedSportsFeed matches={matches} onMatchClick={handleMatchClick} />
            </div>

            {/* Main Grid Layout */}
            <div className="grid grid-cols-12 gap-3">
              
              {/* Multi-Source Comparison - 8 columns */}
              <div className="col-span-8">
                <MultiSourceComparison 
                  match={selectedMatch} 
                  matches={matches}
                  onMatchSelect={handleMatchSelect}
                />
              </div>
              
              {/* Odds Aggregator - 4 columns */}
              <div className="col-span-4">
                <OddsAggregator match={selectedMatch} />
              </div>
              
              {/* Schedule Calendar - 8 columns */}
              <div className="col-span-8">
                <ScheduleCalendar matches={matches} />
              </div>
              
              {/* Data Quality Indicator + Value Radar - 4 columns */}
              <div className="col-span-4 flex flex-col gap-3">
                <DataQualityIndicator sources={dataSources} />
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
};

export default Index;
