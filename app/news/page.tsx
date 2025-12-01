"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, ExternalLink, TrendingUp, RefreshCw } from "lucide-react";
import { useNewsData, NewsArticle } from "@/hooks/useNewsData";

// Sport mapping for API (lowercase) vs display (Title Case)
const SPORTS_CONFIG = [
  { id: "all", label: "All" },
  { id: "football", label: "Football" },
  { id: "nba", label: "NBA" },
  { id: "mlb", label: "MLB" },
  { id: "tennis", label: "Tennis" },
  { id: "esports", label: "E-sports" },
  { id: "nfl", label: "NFL" },
  { id: "hockey", label: "Hockey" },
];

// Sources from backend
const SOURCES = ["All", "ESPN", "BBC Sport", "Sky Sports", "Bleacher Report"];

// Placeholder image for articles without images
const PLACEHOLDER_IMAGE = "/placeholder.svg";

export default function NewsPage() {
  const [selectedSport, setSelectedSport] = useState("all");
  const [selectedSource, setSelectedSource] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [mounted, setMounted] = useState(false);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch news from API
  const { articles, isLoading, error, total, lastUpdate, refetch } = useNewsData(
    selectedSport,
    selectedSource === "All" ? null : selectedSource,
    debouncedSearch || null,
    50
  );

  const getTimeAgo = (date: string) => {
    if (!mounted) return "";
    
    try {
      const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
      
      if (seconds < 0) return "Just now";
      if (seconds < 60) return `${seconds}s ago`;
      if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
      if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
      return `${Math.floor(seconds / 86400)}d ago`;
    } catch {
      return "Just now";
    }
  };

  const getSportLabel = (sportId: string): string => {
    const config = SPORTS_CONFIG.find(s => s.id === sportId.toLowerCase());
    return config?.label || sportId;
  };

  return (
    <div className="grid-pattern flex min-h-screen bg-background">
      <Sidebar />

      <div className="flex flex-1 flex-col">
        <Header />

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
                    {SPORTS_CONFIG.map((sport) => (
                      <Button
                        key={sport.id}
                        onClick={() => setSelectedSport(sport.id)}
                        variant={selectedSport === sport.id ? "default" : "outline"}
                        size="sm"
                        className="text-xs"
                      >
                        {sport.label}
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
                    {SOURCES.map((source) => (
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

            {/* Results Count & Refresh */}
            <div className="flex items-center justify-between px-1">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                {isLoading ? "Loading..." : `${total} ${total === 1 ? "Article" : "Articles"} Found`}
              </span>
              <div className="flex items-center gap-3">
                {lastUpdate && (
                  <span className="text-[10px] text-muted-foreground">
                    Updated: {getTimeAgo(lastUpdate)}
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => refetch()}
                  disabled={isLoading}
                  className="h-6 px-2"
                >
                  <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
                </Button>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-3 w-3 text-primary" />
                  <span className="text-xs text-muted-foreground">Live news</span>
                </div>
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="terminal-card border-destructive p-4">
                <p className="text-sm text-destructive">Error: {error}</p>
                <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2">
                  Try Again
                </Button>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3"
                    : "space-y-3"
                }
              >
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="terminal-card p-3">
                    <Skeleton className="mb-3 aspect-video w-full" />
                    <Skeleton className="mb-2 h-4 w-3/4" />
                    <Skeleton className="mb-2 h-3 w-full" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))}
              </div>
            )}

            {/* News Grid/List */}
            {!isLoading && !error && (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3"
                    : "space-y-3"
                }
              >
                {articles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    getTimeAgo={getTimeAgo}
                    getSportLabel={getSportLabel}
                  />
                ))}
              </div>
            )}

            {/* No Results */}
            {!isLoading && !error && articles.length === 0 && (
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

// Separate component for article card to avoid re-renders
function ArticleCard({
  article,
  getTimeAgo,
  getSportLabel,
}: {
  article: NewsArticle;
  getTimeAgo: (date: string) => string;
  getSportLabel: (sport: string) => string;
}) {
  const [imageError, setImageError] = useState(false);
  const imageSrc = article.imageUrl && !imageError ? article.imageUrl : PLACEHOLDER_IMAGE;

  return (
    <div
      className="terminal-card hover-lift group cursor-pointer p-3"
      onClick={() => article.url && window.open(article.url, "_blank")}
    >
      {/* Image */}
      <div className="relative mb-3 aspect-video overflow-hidden border border-border bg-muted/30">
        <Image
          src={imageSrc}
          alt={article.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          onError={() => setImageError(true)}
          unoptimized={imageSrc.startsWith("http")}
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
        <Badge variant="secondary" className="text-[9px]">
          {getSportLabel(article.sport)}
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
  );
}
