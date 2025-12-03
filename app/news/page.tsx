"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
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
  { id: "nfl", label: "NFL" },
  { id: "mlb", label: "MLB" },
  { id: "hockey", label: "Hockey" },
  { id: "tennis", label: "Tennis" },
  { id: "f1", label: "F1" },
  { id: "golf", label: "Golf" },
  { id: "mma", label: "MMA" },
  { id: "boxing", label: "Boxing" },
  { id: "cricket", label: "Cricket" },
  { id: "college", label: "College" },
  { id: "olympics", label: "Olympics" },
  { id: "esports", label: "E-sports" },
];

// Placeholder image for articles without images
const PLACEHOLDER_IMAGE = "/placeholder.svg";

export default function NewsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewsContent />
    </Suspense>
  );
}

function NewsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedSport, setSelectedSport] = useState(searchParams.get("sport") || "all");
  const [selectedSource, setSelectedSource] = useState(searchParams.get("source") || "All");
  const [availableSources, setAvailableSources] = useState<string[]>([]);
  const [sourcesLoading, setSourcesLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [mounted, setMounted] = useState(false);

  // Sync URL with state
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (selectedSport && selectedSport !== "all") {
      params.set("sport", selectedSport);
    } else {
      params.delete("sport");
    }

    if (selectedSource && selectedSource !== "All") {
      params.set("source", selectedSource);
    } else {
      params.delete("source");
    }

    // Only update if params changed to avoid loops
    const currentString = searchParams.toString();
    const newString = params.toString();
    
    if (currentString !== newString) {
      router.replace(`?${newString}`, { scroll: false });
    }
  }, [selectedSport, selectedSource, router, searchParams]);

  // Fetch sources for selected sport
  const fetchSources = useCallback(async (sport: string) => {
    setSourcesLoading(true);
    try {
      const response = await fetch(`/api/news/sources?sport=${sport}`);
      const data = await response.json();
      if (data.sources) {
        setAvailableSources(data.sources);
      }
    } catch (error) {
      console.error("Error fetching sources:", error);
      setAvailableSources([]);
    } finally {
      setSourcesLoading(false);
    }
  }, []);

  // Load sources when sport changes
  useEffect(() => {
    fetchSources(selectedSport);
    // Only reset source if the current source is not in the new available sources (handled in fetchSources or manually)
    // But for now, we want to respect the URL source if it matches the sport, otherwise reset.
    // However, availableSources is async.
    // Simpler: If sport changed and source is not "All", check if we need to reset.
    // If the user manually changes sport, we usually reset source.
    // But if it comes from URL mount, we want to keep it.
    
    // We'll trust the user/URL for now. If they switch sport manually, we might want to reset source.
    // But we can't easily distinguish manual switch vs initial load here without more state.
    // The previous code reset it: setSelectedSource("All");
    
    // Let's modify to: if the sport in URL changed, we probably don't want to reset source immediately if it was just loaded.
    // But if selectedSport changes, we should probably reset source unless it's the initial load.
  }, [selectedSport, fetchSources]);

  const handleSportChange = (sportId: string) => {
    setSelectedSport(sportId);
    setSelectedSource("All"); // Reset source when sport changes manually
  };

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

  // Fetch news from API with pagination
  const { 
    articles, 
    isLoading, 
    error, 
    total, 
    totalPages,
    currentPage,
    hasMore,
    lastUpdate, 
    refetch,
    goToPage,
    nextPage,
    prevPage,
  } = useNewsData(
    selectedSport,
    selectedSource === "All" ? null : selectedSource,
    debouncedSearch || null,
    10 // 10 articles per page
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
                        onClick={() => handleSportChange(sport.id)}
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
                    {selectedSport === "esports" ? "Discipline" : "Source"} {sourcesLoading && <span className="text-primary">(loading...)</span>}
                    {!sourcesLoading && availableSources.length > 0 && (
                      <span className="ml-1 text-muted-foreground/60">
                        ({availableSources.length} available)
                      </span>
                    )}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => setSelectedSource("All")}
                      variant={selectedSource === "All" ? "default" : "outline"}
                      size="sm"
                      className="text-xs"
                    >
                      All
                    </Button>
                    {availableSources.map((source) => (
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

            {/* Pagination */}
            {!error && totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 py-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevPage}
                  disabled={currentPage === 1 || isLoading}
                  className="text-xs"
                >
                  ← Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {(() => {
                    // Calculate window
                    const windowSize = 5;
                    let startPage = Math.max(1, currentPage - 2);
                    let endPage = Math.min(totalPages, startPage + windowSize - 1);
                    
                    // Adjust if we're at the end to show full window if possible
                    if (endPage - startPage + 1 < windowSize) {
                      startPage = Math.max(1, endPage - windowSize + 1);
                    }

                    const pages = [];
                    // First page
                    if (startPage > 1) {
                      pages.push(
                        <Button
                          key="page-1"
                          variant={currentPage === 1 ? "default" : "outline"}
                          size="sm"
                          onClick={() => goToPage(1)}
                          disabled={isLoading}
                          className="h-8 w-8 p-0 text-xs"
                        >
                          1
                        </Button>
                      );
                      if (startPage > 2) {
                        pages.push(<span key="start-ellipsis" className="px-1 text-muted-foreground">...</span>);
                      }
                    }

                    // Window pages
                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(
                        <Button
                          key={`page-${i}`}
                          variant={currentPage === i ? "default" : "outline"}
                          size="sm"
                          onClick={() => goToPage(i)}
                          disabled={isLoading}
                          className="h-8 w-8 p-0 text-xs"
                        >
                          {i}
                        </Button>
                      );
                    }

                    // Last page
                    if (endPage < totalPages) {
                      if (endPage < totalPages - 1) {
                        pages.push(<span key="end-ellipsis" className="px-1 text-muted-foreground">...</span>);
                      }
                      pages.push(
                        <Button
                          key={`page-${totalPages}`}
                          variant={currentPage === totalPages ? "default" : "outline"}
                          size="sm"
                          onClick={() => goToPage(totalPages)}
                          disabled={isLoading}
                          className="h-8 w-8 p-0 text-xs"
                        >
                          {totalPages}
                        </Button>
                      );
                    }

                    return pages;
                  })()}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextPage}
                  disabled={!hasMore || isLoading}
                  className="text-xs"
                >
                  Next →
                </Button>
              </div>
            )}

            {/* Page info */}
            {!error && totalPages > 0 && (
              <div className="text-center text-xs text-muted-foreground">
                Page {currentPage} of {totalPages} • {total} articles
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
