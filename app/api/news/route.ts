import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:3001";

/**
 * GET /api/news
 * Proxy endpoint to backend /api/news
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sport = searchParams.get("sport") || "all";
    const source = searchParams.get("source") || "";
    const search = searchParams.get("search") || "";
    const limit = searchParams.get("limit") || "20";

    // Build backend URL
    const params = new URLSearchParams();
    params.set("sport", sport);
    if (source) params.set("source", source);
    if (search) params.set("search", search);
    params.set("limit", limit);

    const response = await fetch(`${BACKEND_URL}/api/news?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(`Backend error: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch news from backend",
          articles: [],
          total: 0,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, max-age=300", // Cache for 5 minutes
      },
    });
  } catch (error) {
    console.error("Error fetching news:", error);

    return NextResponse.json(
      {
        success: false,
        error: "News service unavailable",
        articles: [],
        total: 0,
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 }
    );
  }
}

