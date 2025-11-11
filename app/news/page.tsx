"use client";

import { useState } from "react";

export const dynamic = "force-dynamic";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, ExternalLink, TrendingUp } from "lucide-react";

const sports = ["All", "Football", "NBA", "MLB", "Tennis", "E-sports"];
const sources = ["All", "ESPN", "BBC Sport", "Sky Sports", "The Athletic"];

interface NewsArticle {
  id: string;
  title: string;
  description: string;
  image: string;
  source: string;
  author?: string;
  publishedAt: string;
  sport: string;
  category: string;
  isBreaking?: boolean;
  url: string;
}

const mockNews: NewsArticle[] = [
  {
    id: "1",
    title: "Arsenal Secure Dramatic Victory Over Chelsea in Premier League Clash",
    description: "Arsenal came from behind to beat Chelsea 2-1 in a thrilling encounter at Emirates Stadium, with late goals securing three crucial points.",
    image: "⚽",
    source: "ESPN",
    author: "John Smith",
    publishedAt: new Date(Date.now() - 30 * 60000).toISOString(),
    sport: "Football",
    category: "Match Report",
    isBreaking: true,
    url: "#"
  },
  {
    id: "2",
    title: "Lakers Star Reveals Training Secrets Ahead of Playoffs",
    description: "In an exclusive interview, the Lakers' superstar discusses his preparation regimen and what it takes to perform at the highest level.",
    image: "🏀",
    source: "The Athletic",
    author: "Sarah Johnson",
    publishedAt: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
    sport: "NBA",
    category: "Interview",
    url: "#"
  },
  {
    id: "3",
    title: "Real Madrid vs Barcelona: El Clásico Preview and Tactical Analysis",
    description: "Everything you need to know about tonight's massive showdown, including predicted lineups, key battles, and historical context.",
    image: "⚽",
    source: "Sky Sports",
    author: "Michael Davies",
    publishedAt: new Date(Date.now() - 4 * 60 * 60000).toISOString(),
    sport: "Football",
    category: "Preview",
    url: "#"
  },
  {
    id: "4",
    title: "Djokovic Advances to Semi-Finals After Epic Five-Set Battle",
    description: "The Serbian champion showed incredible resilience to overcome his opponent in a match lasting over four hours.",
    image: "🎾",
    source: "BBC Sport",
    author: "Emma Wilson",
    publishedAt: new Date(Date.now() - 5 * 60 * 60000).toISOString(),
    sport: "Tennis",
    category: "Match Report",
    url: "#"
  },
  {
    id: "5",
    title: "Yankees Trade Deadline Moves: Breaking Down the Acquisitions",
    description: "Analyzing the impact of the Yankees' recent trades and how they strengthen the roster for the playoff push.",
    image: "⚾",
    source: "ESPN",
    author: "David Martinez",
    publishedAt: new Date(Date.now() - 6 * 60 * 60000).toISOString(),
    sport: "MLB",
    category: "Analysis",
    url: "#"
  },
  {
    id: "6",
    title: "G2 Esports Dominate Opening Week of LEC Spring Split",
    description: "The defending champions continue their impressive form with a perfect 3-0 start to the season.",
    image: "🎮",
    source: "ESPN Esports",
    author: "Alex Chen",
    publishedAt: new Date(Date.now() - 8 * 60 * 60000).toISOString(),
    sport: "E-sports",
    category: "Match Report",
    isBreaking: false,
    url: "#"
  },
  {
    id: "7",
    title: "Bayern Munich Manager Discusses Tactical Evolution This Season",
    description: "An in-depth look at how Bayern have adapted their playing style and what it means for their title challenge.",
    image: "⚽",
    source: "The Athletic",
    author: "Thomas Mueller",
    publishedAt: new Date(Date.now() - 10 * 60 * 60000).toISOString(),
    sport: "Football",
    category: "Tactical Analysis",
    url: "#"
  },
  {
    id: "8",
    title: "NBA Draft Prospects: Top 10 Players to Watch This Season",
    description: "Scouting reports and projections for the most exciting prospects in college basketball ahead of the upcoming draft.",
    image: "🏀",
    source: "ESPN",
    author: "Chris Roberts",
    publishedAt: new Date(Date.now() - 12 * 60 * 60000).toISOString(),
    sport: "NBA",
    category: "Draft",
    url: "#"
  }
];

export default function NewsPage() {
  const [selectedSport, setSelectedSport] = useState("All");
  const [selectedSource, setSelectedSource] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredNews = mockNews.filter((article) => {
    const sportMatch = selectedSport === "All" || article.sport === selectedSport;
    const sourceMatch = selectedSource === "All" || article.source === selectedSource;
    const searchMatch = 
      searchQuery === "" ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    return sportMatch && sourceMatch && searchMatch;
  });

  const getTimeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="min-h-screen bg-background grid-pattern flex">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header />

        <main className="flex-1 p-3 overflow-auto">
          <div className="max-w-[2000px] mx-auto space-y-3">
            
            {/* Filters Section */}
            <div className="terminal-card p-3">
              <div className="flex flex-col gap-3">
                
                {/* Sport Filters */}
                <div>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                    Sport
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {sports.map((sport) => (
                      <Button
                        key={sport}
                        onClick={() => setSelectedSport(sport)}
                        variant={selectedSport === sport ? "default" : "outline"}
                        size="sm"
                        className="text-xs"
                      >
                        {sport}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Source Filters */}
                <div>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                    Source
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {sources.map((source) => (
                      <Button
                        key={source}
                        onClick={() => setSelectedSource(source)}
                        variant={selectedSource === source ? "default" : "outline"}
                        size="sm"
                        className="text-xs"
                      >
                        {source}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Search and View Mode */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                      Search
                    </span>
                    <input
                      type="text"
                      placeholder="Search articles..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-card border border-border px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                      View
                    </span>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setViewMode("grid")}
                        variant={viewMode === "grid" ? "default" : "outline"}
                        size="sm"
                        className="text-xs"
                      >
                        Grid
                      </Button>
                      <Button
                        onClick={() => setViewMode("list")}
                        variant={viewMode === "list" ? "default" : "outline"}
                        size="sm"
                        className="text-xs"
                      >
                        List
                      </Button>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between px-1">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                {filteredNews.length} {filteredNews.length === 1 ? 'Article' : 'Articles'} Found
              </span>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-3 w-3 text-primary" />
                <span className="text-xs text-muted-foreground">
                  Latest news
                </span>
              </div>
            </div>

            {/* News Grid/List */}
            <div className={viewMode === "grid" 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
              : "space-y-3"
            }>
              {filteredNews.map((article) => (
                <div
                  key={article.id}
                  className="terminal-card p-3 hover-lift cursor-pointer group"
                  onClick={() => window.open(article.url, "_blank")}
                >
                  {/* Image/Icon */}
                  <div className="mb-3 text-5xl text-center bg-muted/30 py-6 border border-border">
                    {article.image}
                  </div>

                  {/* Breaking Badge */}
                  {article.isBreaking && (
                    <Badge variant="destructive" className="text-[9px] mb-2">
                      BREAKING
                    </Badge>
                  )}

                  {/* Title */}
                  <h3 className="text-sm font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-3">
                    {article.description}
                  </p>

                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
                    <Badge variant="outline" className="text-[9px]">
                      {article.category}
                    </Badge>
                    <span className="font-medium">{article.source}</span>
                    {article.author && (
                      <>
                        <span>•</span>
                        <span>{article.author}</span>
                      </>
                    )}
                  </div>

                  {/* Time and Link */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{getTimeAgo(article.publishedAt)}</span>
                    </div>
                    <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              ))}
            </div>

            {/* No Results */}
            {filteredNews.length === 0 && (
              <div className="terminal-card p-8 flex items-center justify-center">
                <span className="text-sm text-muted-foreground">
                  No articles found. Try adjusting your filters.
                </span>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}

