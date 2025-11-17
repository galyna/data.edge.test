"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, ExternalLink, TrendingUp } from "lucide-react";
import { mockNews } from "@/data/mockNews";

const sports = ["All", "Football", "NBA", "MLB", "Tennis", "E-sports"];
const sources = ["All", "ESPN", "BBC Sport", "Sky Sports", "The Athletic"];

export default function NewsPage() {
  const [selectedSport, setSelectedSport] = useState("All");
  const [selectedSource, setSelectedSource] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [mounted, setMounted] = useState(false);
  const [headerSport, setHeaderSport] = useState<string>("football");

  useEffect(() => {
    setMounted(true);
  }, []);

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
    if (!mounted) {
      // Return a stable value during SSR to avoid hydration mismatch
      return "";
    }
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="grid-pattern flex min-h-screen bg-background">
      <Sidebar />

      <div className="flex flex-1 flex-col">
        <Header selectedSport={headerSport} onSportChange={setHeaderSport} />

        <main className="flex-1 overflow-auto p-3">
          <div className="mx-auto max-w-[2000px] space-y-3">
            {/* Filters Section */}
            <div className="terminal-card p-3">
              <div className="flex flex-col gap-3">
                {/* Sport Filters */}
                <div>
                  <span className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
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
                  <span className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
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
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="flex-1">
                    <span className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
                      Search
                    </span>
                    <input
                      type="text"
                      placeholder="Search articles..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full border border-border bg-card px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <span className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
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
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                {filteredNews.length} {filteredNews.length === 1 ? "Article" : "Articles"} Found
              </span>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-3 w-3 text-primary" />
                <span className="text-xs text-muted-foreground">Latest news</span>
              </div>
            </div>

            {/* News Grid/List */}
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3"
                  : "space-y-3"
              }
            >
              {filteredNews.map((article) => (
                <div
                  key={article.id}
                  className="terminal-card hover-lift group cursor-pointer p-3"
                  onClick={() => window.open(article.url, "_blank")}
                >
                  {/* Image */}
                  <div className="relative mb-3 aspect-video overflow-hidden border border-border bg-muted/30">
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>

                  {/* Breaking Badge */}
                  {article.isBreaking && (
                    <Badge variant="destructive" className="mb-2 text-[9px]">
                      BREAKING
                    </Badge>
                  )}

                  {/* Title */}
                  <h3 className="mb-2 line-clamp-2 text-sm font-semibold transition-colors group-hover:text-primary">
                    {article.title}
                  </h3>

                  {/* Description */}
                  <p className="mb-3 line-clamp-3 text-xs text-muted-foreground">
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
                  <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                    <div
                      className="flex items-center gap-1 text-[10px] text-muted-foreground"
                      suppressHydrationWarning
                    >
                      <Clock className="h-3 w-3" />
                      <span>{getTimeAgo(article.publishedAt) || "Just now"}</span>
                    </div>
                    <ExternalLink className="h-3 w-3 text-muted-foreground transition-colors group-hover:text-primary" />
                  </div>
                </div>
              ))}
            </div>

            {/* No Results */}
            {filteredNews.length === 0 && (
              <div className="terminal-card flex items-center justify-center p-8">
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
