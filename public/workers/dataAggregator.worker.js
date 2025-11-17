/**
 * Web Worker for heavy data aggregation calculations
 * Offloads CPU-intensive operations from main thread
 */

// Calculate aggregated odds from multiple sources
function calculateAggregatedOdds(sources) {
  if (!sources || sources.length === 0) {
    return null;
  }

  const homeOdds = sources.map((s) => s.odds.home);
  const awayOdds = sources.map((s) => s.odds.away);
  const drawOdds = sources
    .filter((s) => s.odds.draw !== undefined)
    .map((s) => s.odds.draw);

  return {
    home: homeOdds.reduce((a, b) => a + b, 0) / homeOdds.length,
    away: awayOdds.reduce((a, b) => a + b, 0) / awayOdds.length,
    draw: drawOdds.length > 0
      ? drawOdds.reduce((a, b) => a + b, 0) / drawOdds.length
      : undefined,
  };
}

// Calculate spread between sources
function calculateSpread(sources) {
  if (!sources || sources.length === 0) {
    return 0;
  }

  const homeOdds = sources.map((s) => s.odds.home);
  return Math.max(...homeOdds) - Math.min(...homeOdds);
}

// Calculate value signals
function calculateValue(aggregatedOdds, spread, sources) {
  // Simple value calculation: higher spread = lower confidence
  const spreadPenalty = Math.min(spread * 10, 50);
  const baseValue = (1 / aggregatedOdds.home) * 100;
  const sourceBonus = Math.min(sources.length * 2, 20);

  return Math.max(0, baseValue + sourceBonus - spreadPenalty);
}

// Determine best source (lowest latency with good reliability)
function findBestSource(sources) {
  if (!sources || sources.length === 0) {
    return "Unknown";
  }

  const scored = sources.map((source) => ({
    name: source.sourceName,
    score: (1000 - source.latency) * 0.7 + (source.reliability || 90) * 0.3,
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored[0].name;
}

// Process batch of matches
function processBatchMatches(matches) {
  return matches.map((match) => {
    const aggregatedOdds = calculateAggregatedOdds(match.sources);
    const spread = calculateSpread(match.sources);
    const value = calculateValue(aggregatedOdds, spread, match.sources);
    const bestSource = findBestSource(match.sources);

    const spreadQuality =
      spread < 0.1 ? "low" : spread > 0.3 ? "high" : "medium";

    return {
      id: match.id,
      aggregatedOdds,
      spread,
      spreadQuality,
      value,
      bestSource,
    };
  });
}

// Statistical analysis
function calculateStatistics(matches) {
  const values = matches.map((m) => m.value);
  const spreads = matches.map((m) => m.spread);

  const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
  const median = (arr) => {
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  };

  return {
    avgValue: avg(values),
    medianValue: median(values),
    avgSpread: avg(spreads),
    medianSpread: median(spreads),
    totalMatches: matches.length,
    highValueMatches: matches.filter((m) => m.value > 70).length,
  };
}

// Message handler
self.addEventListener("message", (event) => {
  const { type, data, id } = event.data;

  try {
    let result;

    switch (type) {
      case "PROCESS_BATCH":
        result = processBatchMatches(data.matches);
        break;

      case "CALCULATE_AGGREGATED_ODDS":
        result = calculateAggregatedOdds(data.sources);
        break;

      case "CALCULATE_SPREAD":
        result = calculateSpread(data.sources);
        break;

      case "CALCULATE_VALUE":
        result = calculateValue(
          data.aggregatedOdds,
          data.spread,
          data.sources
        );
        break;

      case "CALCULATE_STATISTICS":
        result = calculateStatistics(data.matches);
        break;

      case "FIND_BEST_SOURCE":
        result = findBestSource(data.sources);
        break;

      default:
        throw new Error(`Unknown message type: ${type}`);
    }

    // Send result back to main thread
    self.postMessage({
      type: "SUCCESS",
      id,
      result,
    });
  } catch (error) {
    // Send error back to main thread
    self.postMessage({
      type: "ERROR",
      id,
      error: error.message,
    });
  }
});

// Ready signal
self.postMessage({ type: "READY" });

