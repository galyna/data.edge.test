import { useState, useEffect, useCallback } from "react";

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  imageUrl: string | null;
  source: string;
  sport: string;
  category: string;
  author: string | null;
  publishedAt: string;
  isBreaking: boolean;
}

interface NewsResponse {
  success: boolean;
  articles: NewsArticle[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
  hasMore: boolean;
  sport: string;
  source: string | null;
  search: string | null;
  timestamp: string;
  error: string | null;
}

interface UseNewsDataResult {
  articles: NewsArticle[];
  isLoading: boolean;
  error: string | null;
  total: number;
  totalPages: number;
  currentPage: number;
  hasMore: boolean;
  lastUpdate: string | null;
  refetch: () => Promise<void>;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
}

// Backend URL - uses Next.js API route as proxy
const API_BASE = "/api/news";

/**
 * Hook for fetching news data from backend with pagination
 * @param sport - Sport filter (football, nba, mlb, tennis, esports, all)
 * @param source - Source filter (ESPN, BBC Sport, etc.)
 * @param search - Search query
 * @param limit - Articles per page (default: 10)
 */
export function useNewsData(
  sport: string = "all",
  source: string | null = null,
  search: string | null = null,
  limit: number = 10
): UseNewsDataResult {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  const fetchNews = useCallback(async (page: number = currentPage) => {
    try {
      setIsLoading(true);
      setError(null);

      // Build query params
      const params = new URLSearchParams();
      params.set("sport", sport.toLowerCase());
      if (source && source !== "All") {
        params.set("source", source);
      }
      if (search) {
        params.set("search", search);
      }
      params.set("page", page.toString());
      params.set("limit", limit.toString());

      const response = await fetch(`${API_BASE}?${params.toString()}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch news: ${response.status}`);
      }

      const data: NewsResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch news");
      }

      setArticles(data.articles);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setCurrentPage(data.page);
      setHasMore(data.hasMore);
      setLastUpdate(data.timestamp);
    } catch (err) {
      console.error("Error fetching news:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setArticles([]);
      setTotal(0);
      setTotalPages(0);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [sport, source, search, limit, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
    fetchNews(1);
  }, [sport, source, search, limit]);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      fetchNews(page);
    }
  }, [totalPages, fetchNews]);

  const nextPage = useCallback(() => {
    if (hasMore) {
      goToPage(currentPage + 1);
    }
  }, [hasMore, currentPage, goToPage]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  }, [currentPage, goToPage]);

  return {
    articles,
    isLoading,
    error,
    total,
    totalPages,
    currentPage,
    hasMore,
    lastUpdate,
    refetch: () => fetchNews(currentPage),
    goToPage,
    nextPage,
    prevPage,
  };
}

/**
 * Fetch available news sources
 */
export async function fetchNewsSources(): Promise<string[]> {
  try {
    const response = await fetch(`${API_BASE}/sources`);
    if (!response.ok) return [];
    const data = await response.json();
    return data.sources || [];
  } catch {
    return [];
  }
}

/**
 * Fetch available sports
 */
export async function fetchNewsSports(): Promise<string[]> {
  try {
    const response = await fetch(`${API_BASE}/sports`);
    if (!response.ok) return [];
    const data = await response.json();
    return data.sports || [];
  } catch {
    return [];
  }
}

