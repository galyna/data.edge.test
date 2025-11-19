"use client";

import { useState, useEffect, useMemo, useCallback, lazy, Suspense } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import UnifiedSportsFeed from "@/components/UnifiedSportsFeed";
import OddsAggregator from "@/components/OddsAggregator";
import ValueRadar from "@/components/ValueRadar";
import SportsNavigation from "@/components/SportsNavigation";
import { useLiveSportsData } from "@/hooks/useLiveSportsData";
import { Match, ValueSignal } from "@/types/match";
import { useMatchDetail } from "@/store/matchStore";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load heavy components
const MultiSourceComparison = lazy(() => import("@/components/MultiSourceComparison"));
const MatchDetailDialog = lazy(() => import("@/components/MatchDetailDialog"));

/**
 * Generate value signals from matches
 * A value signal is when the best odds significantly exceed the average
 */
function generateValueSignals(matches: Match[]): ValueSignal[] {
  const signals: ValueSignal[] = [];

  matches.forEach((match) => {
    if (!match.sources || match.sources.length < 2) return;

    // Calculate best odds for home
    const bestHomeOdds = Math.max(...match.sources.map((s) => s.odds.home));
    const avgHomeOdds = match.aggregatedOdds.home;
    const homeEdge = avgHomeOdds > 0 ? ((bestHomeOdds - avgHomeOdds) / avgHomeOdds) * 100 : 0;

    // Calculate best odds for away
    const bestAwayOdds = Math.max(...match.sources.map((s) => s.odds.away));
    const avgAwayOdds = match.aggregatedOdds.away;
    const awayEdge = avgAwayOdds > 0 ? ((bestAwayOdds - avgAwayOdds) / avgAwayOdds) * 100 : 0;

    // Only show signals with edge > 2%
    const threshold = 2;

    if (homeEdge > threshold) {
      signals.push({
        id: `${match.id}-home`,
        matchId: match.id,
        match: `${match.homeTeam.shortName} vs ${match.awayTeam.shortName}`,
        avg: avgHomeOdds,
        best: bestHomeOdds,
        edge: homeEdge,
        sources: match.sources.length,
        spread: match.spreadQuality === "low" ? "Low" : match.spreadQuality === "high" ? "High" : "Medium",
        confidence: Math.min(95, 70 + match.sources.length * 5), // More sources = higher confidence
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
      });
    }

    if (awayEdge > threshold) {
      signals.push({
        id: `${match.id}-away`,
        matchId: match.id,
        match: `${match.homeTeam.shortName} vs ${match.awayTeam.shortName}`,
        avg: avgAwayOdds,
        best: bestAwayOdds,
        edge: awayEdge,
        sources: match.sources.length,
        spread: match.spreadQuality === "low" ? "Low" : match.spreadQuality === "high" ? "High" : "Medium",
        confidence: Math.min(95, 70 + match.sources.length * 5),
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
      });
    }
  });

  // Sort by edge (highest first) and limit to top 5
  return signals.sort((a, b) => b.edge - a.edge).slice(0, 5);
}

export default function Home() {
  const [selectedSport, setSelectedSport] = useState("soccer");
  const [selectedLeague, setSelectedLeague] = useState("all");
  
  // ⚠️ Автообновление отключено (0) - только один запрос при загрузке для экономии квоты
  const { matches, sources, isLoading, lastUpdate } = useLiveSportsData(0, selectedSport, selectedLeague); // No auto refetch

  // Use optimized Zustand selectors - prevents unnecessary re-renders
  const {
    match: selectedMatch,
    isOpen: isMatchDetailDialogOpen,
    setMatch: setSelectedMatch,
    setOpen: setMatchDetailDialogOpen,
  } = useMatchDetail();

  // Backend already filters by sport, so we can use matches directly
  // Keep filteredMatches for compatibility, but backend handles filtering
  const filteredMatches = useMemo(
    () => matches, // Backend already filters by selectedSport
    [matches]
  );

  // Generate value signals from real match data
  const valueSignals = useMemo(
    () => generateValueSignals(filteredMatches),
    [filteredMatches]
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
    setSelectedLeague("all");
    setSelectedMatch(null);
  }, [setSelectedMatch]);

  const handleLeagueChange = useCallback((league: string) => {
    setSelectedLeague(league);
    setSelectedMatch(null);
  }, [setSelectedMatch]);

  return (
    <div className="grid-pattern flex min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <Header 
          sources={sources}
          lastUpdate={lastUpdate}
        />

        {/* Dashboard Content */}
        <main className="flex-1 overflow-auto p-2">
          {/* Sports Navigation */}
          <div className="mx-auto max-w-[2000px]">
             <SportsNavigation
                selectedSport={selectedSport}
                selectedLeague={selectedLeague}
                onSportChange={handleSportChange}
                onLeagueChange={handleLeagueChange}
             />
          </div>

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
                <ValueRadar signals={valueSignals} />
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
