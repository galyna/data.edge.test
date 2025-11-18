"use client";

import { useState, useEffect, useMemo, useCallback, lazy, Suspense } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import UnifiedSportsFeed from "@/components/UnifiedSportsFeed";
import OddsAggregator from "@/components/OddsAggregator";
import ValueRadar from "@/components/ValueRadar";
import { mockValueSignals } from "@/data/mockMatches";
import { useLiveSportsData } from "@/hooks/useLiveSportsData";
import { Match } from "@/types/match";
import { useMatchDetail } from "@/store/matchStore";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load heavy components
const MultiSourceComparison = lazy(() => import("@/components/MultiSourceComparison"));
const MatchDetailDialog = lazy(() => import("@/components/MatchDetailDialog"));

export default function Home() {
  const { matches, sources, isLoading, lastUpdate } = useLiveSportsData(30000); // Auto refetch every 30s
  const [selectedSport, setSelectedSport] = useState("football");

  // Use optimized Zustand selectors - prevents unnecessary re-renders
  const {
    match: selectedMatch,
    isOpen: isMatchDetailDialogOpen,
    setMatch: setSelectedMatch,
    setOpen: setMatchDetailDialogOpen,
  } = useMatchDetail();

  // Memoize filtered matches to avoid recalculation
  const filteredMatches = useMemo(
    () => matches.filter((m) => m.sport.toLowerCase() === selectedSport),
    [matches, selectedSport]
  );

  // Initialize selectedMatch with first match that has sources
  useEffect(() => {
    if (!selectedMatch && filteredMatches.length > 0) {
      const firstMatchWithSources = filteredMatches.find((m) => m.sources && m.sources.length > 0);
      if (firstMatchWithSources) {
        setSelectedMatch(firstMatchWithSources);
      }
    }
  }, [filteredMatches, selectedMatch, setSelectedMatch]);

  // Memoize callback to prevent unnecessary re-renders
  const handleMatchSelect = useCallback(
    (match: Match) => {
      setSelectedMatch(match);
    },
    [setSelectedMatch]
  );

  const handleSportChange = useCallback((sport: string) => {
    setSelectedSport(sport);
  }, []);

  return (
    <div className="grid-pattern flex min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <Header 
          selectedSport={selectedSport} 
          onSportChange={handleSportChange}
          sources={sources}
          lastUpdate={lastUpdate}
        />

        {/* Dashboard Content */}
        <main className="flex-1 overflow-auto p-2">
          {isLoading && matches.length === 0 ? (
            <div className="mx-auto max-w-[2000px] space-y-2">
              <Skeleton className="h-96 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : (
            <div className="mx-auto grid max-w-[2000px] grid-cols-12 gap-2">
            {/* Left Column (Main Content) */}
            <div className="col-span-8 space-y-2">
              {/* Hero: Unified Sports Feed */}
              <div>
                <UnifiedSportsFeed matches={filteredMatches} selectedSport={selectedSport} />
              </div>

              {/* Multi-Source Comparison - Lazy loaded */}
              <div>
                <Suspense
                  fallback={
                    <div className="terminal-card p-4">
                      <Skeleton className="h-64 w-full" />
                    </div>
                  }
                >
                  <MultiSourceComparison
                    match={selectedMatch}
                    matches={filteredMatches}
                    onMatchSelect={handleMatchSelect}
                  />
                </Suspense>
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
          )}
        </main>
      </div>

      {/* Match Detail Dialog - Lazy loaded */}
      <Suspense fallback={null}>
        <MatchDetailDialog
          match={selectedMatch}
          open={isMatchDetailDialogOpen}
          onOpenChange={setMatchDetailDialogOpen}
        />
      </Suspense>
    </div>
  );
}
