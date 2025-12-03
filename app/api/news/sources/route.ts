import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:3001";

/**
 * GET /api/news/sources
 * Get available news sources, optionally filtered by sport
 * 
 * Query params:
 * - sport: Filter sources by sport (optional)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sport = searchParams.get("sport") || "";

    // Build backend URL
    const params = new URLSearchParams();
    if (sport) params.set("sport", sport);

    const response = await fetch(
      `${BACKEND_URL}/api/news/sources?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.error(`Backend error: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        {
          sources: [],
          sport: sport || "all",
          total: 0,
          error: "Failed to fetch sources",
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error("Error fetching sources:", error);

    return NextResponse.json(
      {
        sources: [],
        sport: "all",
        total: 0,
        error: "Sources service unavailable",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 }
    );
  }
}

