import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:3001";

/**
 * GET /api/live-data?sport=mlb
 * Proxy endpoint to backend /api/initial
 * @param {string} sport - Sport filter (football, nba, mlb, nhl, tennis, esports)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sport = searchParams.get("sport") || "football";
    const league = searchParams.get("league") || "all";
    const source = searchParams.get("source") || "sem";
    
    const response = await fetch(`${BACKEND_URL}/api/initial?sport=${encodeURIComponent(sport)}&league=${encodeURIComponent(league)}&source=${encodeURIComponent(source)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // Disable caching for live data
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(
        `Backend error: ${response.status} ${response.statusText}`
      );
      return NextResponse.json(
        {
          error: "Failed to fetch data from backend",
          status: response.status,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("Error fetching live data:", error);

    return NextResponse.json(
      {
        error: "Backend service unavailable",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}

