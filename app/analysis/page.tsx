"use client";

import { useState } from "react";
import { Search, TrendingUp, Award, Target, ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { TeamLogo } from "@/components/TeamLogo";
import { mockPredictions } from "@/data/mockPredictions";

export default function AnalysisPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSport, setSelectedSport] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const sports = ["all", "Football", "Basketball", "Tennis"];
  const statuses = ["all", "pending", "won", "lost"];

  const filteredPredictions = mockPredictions.filter((prediction) => {
    const matchesSearch =
      prediction.match.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prediction.league.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSport = selectedSport === "all" || prediction.sport === selectedSport;
    const matchesStatus = selectedStatus === "all" || prediction.status === selectedStatus;
    return matchesSearch && matchesSport && matchesStatus;
  });

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-signal";
    if (confidence >= 60) return "text-warning";
    return "text-muted-foreground";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "won":
        return <Badge className="bg-signal/20 text-signal border-signal/50">Won</Badge>;
      case "lost":
        return (
          <Badge className="border-destructive/50 bg-destructive/20 text-destructive">Lost</Badge>
        );
      default:
        return <Badge className="border-border bg-muted/50 text-muted-foreground">Pending</Badge>;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <div className="flex flex-1 flex-col">
        <Header />

        <main className="flex-1 p-6">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="mb-2 text-2xl font-bold text-foreground">
              Expert Analysis & Match Tips
            </h1>
            <p className="text-sm text-muted-foreground">
              Professional predictions and insights from our expert analysts
            </p>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="relative min-w-[300px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search predictions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-border bg-muted/50 py-2 pl-10 pr-4 text-sm transition-colors focus:border-primary focus:outline-none"
              />
            </div>

            {/* Sport Filter */}
            <div className="flex gap-2">
              {sports.map((sport) => (
                <button
                  key={sport}
                  onClick={() => setSelectedSport(sport)}
                  className={`px-4 py-2 text-xs font-medium uppercase tracking-wider transition-all ${
                    selectedSport === sport
                      ? "border border-primary/50 bg-primary/20 text-primary"
                      : "border border-transparent bg-muted/50 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {sport}
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
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">Win Rate</p>
                  <p className="text-signal text-xl font-bold">73.5%</p>
                </div>
              </div>
            </Card>

            <Card className="border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center border border-primary/30 bg-primary/10">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">Avg ROI</p>
                  <p className="text-signal text-xl font-bold">+18.3%</p>
                </div>
              </div>
            </Card>

            <Card className="border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center border border-primary/30 bg-primary/10">
                  <Award className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">Total Tips</p>
                  <p className="text-xl font-bold text-foreground">1,247</p>
                </div>
              </div>
            </Card>

            <Card className="border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center border border-primary/30 bg-primary/10">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">Active Now</p>
                  <p className="text-xl font-bold text-primary">28</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Predictions List */}
          <div className="space-y-4">
            {filteredPredictions.map((prediction) => (
              <Card
                key={prediction.id}
                className="group cursor-pointer border-border bg-card p-4 transition-all hover:border-primary/50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <TeamLogo
                        team={prediction.homeTeam}
                        sport={prediction.sport.toLowerCase()}
                        size="sm"
                      />
                      <h3 className="text-base font-bold text-foreground transition-colors group-hover:text-primary">
                        {prediction.homeTeam.shortName} vs {prediction.awayTeam.shortName}
                      </h3>
                      <TeamLogo
                        team={prediction.awayTeam}
                        sport={prediction.sport.toLowerCase()}
                        size="sm"
                      />
                      {getStatusBadge(prediction.status)}
                    </div>

                    <div className="mb-3 flex items-center gap-4">
                      <span className="text-xs text-muted-foreground">{prediction.league}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{prediction.sport}</span>
                    </div>

                    <div className="mb-3 flex items-center gap-6">
                      <div>
                        <p className="mb-1 text-xs text-muted-foreground">Prediction</p>
                        <p className="text-sm font-medium text-foreground">
                          {prediction.prediction}
                        </p>
                      </div>
                      <div>
                        <p className="mb-1 text-xs text-muted-foreground">Confidence</p>
                        <p
                          className={`text-sm font-bold ${getConfidenceColor(prediction.confidence)}`}
                        >
                          {prediction.confidence}%
                        </p>
                      </div>
                      <div>
                        <p className="mb-1 text-xs text-muted-foreground">ROI</p>
                        <p
                          className={`text-sm font-bold ${prediction.roi > 0 ? "text-signal" : "text-destructive"}`}
                        >
                          {prediction.roi > 0 ? "+" : ""}
                          {prediction.roi}%
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>By {prediction.analyst}</span>
                      <span>•</span>
                      <span>{prediction.timestamp}</span>
                    </div>
                  </div>

                  <ChevronRight className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" />
                </div>
              </Card>
            ))}
          </div>

          {filteredPredictions.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No predictions found</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
