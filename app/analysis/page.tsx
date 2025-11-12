"use client";

import { useState } from "react";
import { Search, TrendingUp, Award, Target, ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface Prediction {
  id: string;
  match: string;
  league: string;
  sport: string;
  prediction: string;
  confidence: number;
  analyst: string;
  timestamp: string;
  roi: number;
  status: "pending" | "won" | "lost";
}

const mockPredictions: Prediction[] = [
  {
    id: "1",
    match: "Manchester City vs Arsenal",
    league: "Premier League",
    sport: "Football",
    prediction: "Manchester City Win",
    confidence: 87,
    analyst: "Alex Thompson",
    timestamp: "2 hours ago",
    roi: 15.4,
    status: "pending"
  },
  {
    id: "2",
    match: "Lakers vs Warriors",
    league: "NBA",
    sport: "Basketball",
    prediction: "Over 225.5 Points",
    confidence: 92,
    analyst: "Sarah Mitchell",
    timestamp: "4 hours ago",
    roi: 22.1,
    status: "won"
  },
  {
    id: "3",
    match: "Real Madrid vs Barcelona",
    league: "La Liga",
    sport: "Football",
    prediction: "BTTS Yes",
    confidence: 78,
    analyst: "James Rodriguez",
    timestamp: "5 hours ago",
    roi: 18.7,
    status: "pending"
  },
  {
    id: "4",
    match: "Djokovic vs Alcaraz",
    league: "ATP Finals",
    sport: "Tennis",
    prediction: "Alcaraz Win",
    confidence: 65,
    analyst: "Emma Wilson",
    timestamp: "1 day ago",
    roi: -5.2,
    status: "lost"
  }
];

export default function AnalysisPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSport, setSelectedSport] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const sports = ["all", "Football", "Basketball", "Tennis"];
  const statuses = ["all", "pending", "won", "lost"];

  const filteredPredictions = mockPredictions.filter(prediction => {
    const matchesSearch = prediction.match.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
    switch(status) {
      case "won":
        return <Badge className="bg-signal/20 text-signal border-signal/50">Won</Badge>;
      case "lost":
        return <Badge className="bg-destructive/20 text-destructive border-destructive/50">Lost</Badge>;
      default:
        return <Badge className="bg-muted/50 text-muted-foreground border-border">Pending</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Header />
        
        <main className="flex-1 p-6">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-2">Expert Analysis & Match Tips</h1>
            <p className="text-sm text-muted-foreground">Professional predictions and insights from our expert analysts</p>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search predictions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border text-sm focus:outline-none focus:border-primary transition-colors"
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
                      ? "bg-primary/20 text-primary border border-primary/50"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted border border-transparent"
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
                      ? "bg-primary/20 text-primary border border-primary/50"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted border border-transparent"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4 bg-card border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 border border-primary/30 flex items-center justify-center">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Win Rate</p>
                  <p className="text-xl font-bold text-signal">73.5%</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-card border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 border border-primary/30 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Avg ROI</p>
                  <p className="text-xl font-bold text-signal">+18.3%</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-card border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 border border-primary/30 flex items-center justify-center">
                  <Award className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total Tips</p>
                  <p className="text-xl font-bold text-foreground">1,247</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-card border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 border border-primary/30 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Active Now</p>
                  <p className="text-xl font-bold text-primary">28</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Predictions List */}
          <div className="space-y-4">
            {filteredPredictions.map((prediction) => (
              <Card key={prediction.id} className="p-4 bg-card border-border hover:border-primary/50 transition-all cursor-pointer group">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                        {prediction.match}
                      </h3>
                      {getStatusBadge(prediction.status)}
                    </div>
                    
                    <div className="flex items-center gap-4 mb-3">
                      <span className="text-xs text-muted-foreground">{prediction.league}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{prediction.sport}</span>
                    </div>

                    <div className="flex items-center gap-6 mb-3">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Prediction</p>
                        <p className="text-sm font-medium text-foreground">{prediction.prediction}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Confidence</p>
                        <p className={`text-sm font-bold ${getConfidenceColor(prediction.confidence)}`}>
                          {prediction.confidence}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">ROI</p>
                        <p className={`text-sm font-bold ${prediction.roi > 0 ? 'text-signal' : 'text-destructive'}`}>
                          {prediction.roi > 0 ? '+' : ''}{prediction.roi}%
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>By {prediction.analyst}</span>
                      <span>•</span>
                      <span>{prediction.timestamp}</span>
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </Card>
            ))}
          </div>

          {filteredPredictions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No predictions found</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

