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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

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

  // Sort by edge (highest first) and limit to top 10
  return signals.sort((a, b) => b.edge - a.edge).slice(0, 10);
}

export default function Home() {
  const [selectedSport, setSelectedSport] = useState("soccer");
  const [selectedLeague, setSelectedLeague] = useState("all");
  const [selectedSource, setSelectedSource] = useState<"sem" | "bill">("sem");
  
  // ⚠️ Автообновление отключено (0) - только один запрос при загрузке для экономии квоты
  const { matches, sources, isLoading, lastUpdate, error } = useLiveSportsData(0, selectedSport, selectedLeague, selectedSource); // No auto refetch

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
  // Also reset if current match is not in the new filtered list
  useEffect(() => {
    if (filteredMatches.length === 0) {
      // Clear match if no matches available
      if (selectedMatch) {
        setSelectedMatch(null);
      }
      return;
    }

    // If selected match exists but is not in filtered matches, clear it
    if (selectedMatch && !filteredMatches.find((m) => m.id === selectedMatch.id)) {
      setSelectedMatch(null);
      return;
    }

    // Auto-select first match with sources if none selected
    if (!selectedMatch) {
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

  const handleSourceChange = useCallback((source: "sem" | "bill") => {
    setSelectedSource(source);
    setSelectedMatch(null); // Clear selected match when switching sources
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
          {/* Source Tabs */}
          <div className="mx-auto max-w-[2000px] mb-2">
            <Tabs value={selectedSource} onValueChange={(value) => handleSourceChange(value as "sem" | "bill")}>
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="sem">Sem</TabsTrigger>
                <TabsTrigger value="bill">Bill</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Sports Navigation */}
          <div className="mx-auto max-w-[2000px]">
             <SportsNavigation
                selectedSport={selectedSport}
                selectedLeague={selectedLeague}
                onSportChange={handleSportChange}
                onLeagueChange={handleLeagueChange}
             />
          </div>

          {error ? (
            <div className="mx-auto max-w-[2000px]">
              <div className="terminal-card p-6 text-center">
                <h3 className="text-lg font-semibold mb-2 text-red-500">Error Loading Data</h3>
                <p className="text-sm text-muted-foreground">{error}</p>
                {selectedSource === "bill" && (
                  <p className="text-xs text-muted-foreground mt-4">
                    Sportradar API requires activation. Please check your API key at marketplace.sportradar.com
                  </p>
                )}
              </div>
            </div>
          ) : isLoading && matches.length === 0 ? (
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
