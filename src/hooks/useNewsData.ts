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
  lastUpdate: string | null;
  refetch: () => Promise<void>;
}

// Backend URL - uses Next.js API route as proxy
const API_BASE = "/api/news";

/**
 * Hook for fetching news data from backend
 * @param sport - Sport filter (football, nba, mlb, tennis, esports, all)
 * @param source - Source filter (ESPN, BBC Sport, etc.)
 * @param search - Search query
 * @param limit - Maximum articles to return
 */
export function useNewsData(
  sport: string = "all",
  source: string | null = null,
  search: string | null = null,
  limit: number = 20
): UseNewsDataResult {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  const fetchNews = useCallback(async () => {
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
      setLastUpdate(data.timestamp);
    } catch (err) {
      console.error("Error fetching news:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setArticles([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [sport, source, search, limit]);

  // Fetch on mount and when filters change
  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  return {
    articles,
    isLoading,
    error,
    total,
    lastUpdate,
    refetch: fetchNews,
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

