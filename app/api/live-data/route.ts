import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

/**
 * GET /api/live-data
 * Proxy endpoint to backend /api/initial
 */
export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/initial`, {
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

