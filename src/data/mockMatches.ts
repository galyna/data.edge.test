import { Match, DataSource, Anomaly, ValueSignal } from "@/types/match";

export const mockDataSources: DataSource[] = [
  { 
    id: "inhouse-analytics", 
    name: "Analytics Engine", 
    provider: "In-House", 
    status: "online", 
    latency: 8, 
    lastUpdate: "1s ago",
    reliability: 99
  },
  { 
    id: "inhouse-odds", 
    name: "Odds Calculator", 
    provider: "In-House", 
    status: "online", 
    latency: 5, 
    lastUpdate: "1s ago",
    reliability: 99
  },
  { 
    id: "inhouse-ml", 
    name: "ML Predictions", 
    provider: "In-House", 
    status: "online", 
    latency: 12, 
    lastUpdate: "2s ago",
    reliability: 97
  },
  { 
    id: "inhouse-stats", 
    name: "Stats Aggregator", 
    provider: "In-House", 
    status: "online", 
    latency: 6, 
    lastUpdate: "1s ago",
    reliability: 98
  },
  { 
    id: "inhouse-recommendations", 
    name: "Recommendation System", 
    provider: "In-House", 
    status: "online", 
    latency: 10, 
    lastUpdate: "2s ago",
    reliability: 99
  },
];

export const mockMatches: Match[] = [
  {
    id: "match-1",
    sport: "Football",
    league: "Premier League",
    homeTeam: {
      name: "Arsenal",
      shortName: "ARS",
      logo: "⚽"
    },
    awayTeam: {
      name: "Chelsea",
      shortName: "CHE",
      logo: "⚽"
    },
    status: "live",
    startTime: new Date(new Date().setDate(new Date().getDate())).toISOString(),
    liveData: {
      homeScore: 2,
      awayScore: 1,
      time: "67'",
      period: "2nd Half",
      lastUpdate: new Date().toISOString()
    },
    aggregatedOdds: {
      home: 2.15,
      draw: 3.40,
      away: 3.20
    },
    sources: [
      {
        sourceId: "sportradar",
        sourceName: "Jack",
        odds: { home: 2.12, draw: 3.35, away: 3.25 },
        timestamp: "2025-01-15T14:32:00Z",
        latency: 120
      },
      {
        sourceId: "sportsdataio",
        sourceName: "Johnny",
        odds: { home: 2.25, draw: 3.40, away: 3.15 },
        timestamp: "2025-01-15T14:32:05Z",
        latency: 95
      },
      {
        sourceId: "apisports",
        sourceName: "Sam",
        odds: { home: 2.10, draw: 3.45, away: 3.20 },
        timestamp: "2025-01-15T14:31:50Z",
        latency: 450
      },
      {
        sourceId: "thesportsdb",
        sourceName: "Mike",
        odds: { home: 2.18, draw: 3.38, away: 3.22 },
        timestamp: "2025-01-15T14:32:02Z",
        latency: 180
      }
    ],
    spread: 0.08,
    spreadQuality: "low",
    bestSource: "Johnny",
    value: 12.3
  },
  {
    id: "match-2",
    sport: "Football",
    league: "Premier League",
    homeTeam: {
      name: "Man City",
      shortName: "MCI",
      logo: "⚽"
    },
    awayTeam: {
      name: "Liverpool",
      shortName: "LIV",
      logo: "⚽"
    },
    status: "scheduled",
    startTime: new Date(new Date().setDate(new Date().getDate())).toISOString(),
    aggregatedOdds: {
      home: 1.85,
      draw: 3.60,
      away: 4.20
    },
    sources: [
      {
        sourceId: "sportradar",
        sourceName: "Jack",
        odds: { home: 1.92, draw: 3.55, away: 4.10 },
        timestamp: "2025-01-15T14:32:00Z",
        latency: 120
      },
      {
        sourceId: "sportsdataio",
        sourceName: "Johnny",
        odds: { home: 1.82, draw: 3.70, away: 4.25 },
        timestamp: "2025-01-15T14:32:05Z",
        latency: 95
      },
      {
        sourceId: "apisports",
        sourceName: "Sam",
        odds: { home: 1.78, draw: 3.50, away: 4.35 },
        timestamp: "2025-01-15T14:31:50Z",
        latency: 450
      }
    ],
    spread: 0.15,
    spreadQuality: "high",
    bestSource: "Jack",
    value: 8.7
  },
  {
    id: "match-3",
    sport: "Football",
    league: "La Liga",
    homeTeam: {
      name: "Barcelona",
      shortName: "BAR",
      logo: "⚽"
    },
    awayTeam: {
      name: "Real Madrid",
      shortName: "RMA",
      logo: "⚽"
    },
    status: "scheduled",
    startTime: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
    aggregatedOdds: {
      home: 2.45,
      draw: 3.30,
      away: 2.90
    },
    sources: [
      {
        sourceId: "sportradar",
        sourceName: "Jack",
        odds: { home: 2.42, draw: 3.25, away: 2.95 },
        timestamp: "2025-01-15T14:32:00Z",
        latency: 120
      },
      {
        sourceId: "sportsdataio",
        sourceName: "Johnny",
        odds: { home: 2.58, draw: 3.30, away: 2.82 },
        timestamp: "2025-01-15T14:32:05Z",
        latency: 95
      },
      {
        sourceId: "apisports",
        sourceName: "Sam",
        odds: { home: 2.40, draw: 3.35, away: 2.92 },
        timestamp: "2025-01-15T14:31:50Z",
        latency: 450
      },
      {
        sourceId: "thesportsdb",
        sourceName: "Mike",
        odds: { home: 2.48, draw: 3.28, away: 2.88 },
        timestamp: "2025-01-15T14:32:02Z",
        latency: 180
      }
    ],
    spread: 0.06,
    spreadQuality: "low",
    bestSource: "Johnny",
    value: 15.2
  },
  {
    id: "match-4",
    sport: "Football",
    league: "Bundesliga",
    homeTeam: {
      name: "Bayern Munich",
      shortName: "BAY",
      logo: "⚽"
    },
    awayTeam: {
      name: "Borussia Dortmund",
      shortName: "DOR",
      logo: "⚽"
    },
    status: "scheduled",
    startTime: new Date(new Date().setDate(new Date().getDate())).toISOString(),
    aggregatedOdds: {
      home: 1.75,
      draw: 3.80,
      away: 4.50
    },
    sources: [
      {
        sourceId: "sportradar",
        sourceName: "Jack",
        odds: { home: 1.72, draw: 3.75, away: 4.60 },
        timestamp: "2025-01-15T14:32:00Z",
        latency: 120
      },
      {
        sourceId: "sportsdataio",
        sourceName: "Johnny",
        odds: { home: 1.81, draw: 3.85, away: 4.35 },
        timestamp: "2025-01-15T14:32:05Z",
        latency: 95
      },
      {
        sourceId: "thesportsdb",
        sourceName: "Mike",
        odds: { home: 1.78, draw: 3.82, away: 4.48 },
        timestamp: "2025-01-15T14:32:02Z",
        latency: 180
      }
    ],
    spread: 0.12,
    spreadQuality: "medium",
    bestSource: "Johnny",
    value: 6.4
  },
  {
    id: "match-5",
    sport: "Football",
    league: "Ligue 1",
    homeTeam: {
      name: "PSG",
      shortName: "PSG",
      logo: "⚽"
    },
    awayTeam: {
      name: "Marseille",
      shortName: "MAR",
      logo: "⚽"
    },
    status: "scheduled",
    startTime: new Date(new Date().setDate(new Date().getDate())).toISOString(),
    aggregatedOdds: {
      home: 1.55,
      draw: 4.20,
      away: 5.80
    },
    sources: [
      {
        sourceId: "sportradar",
        sourceName: "Jack",
        odds: { home: 1.62, draw: 4.10, away: 5.60 },
        timestamp: "2025-01-15T14:32:00Z",
        latency: 120
      },
      {
        sourceId: "sportsdataio",
        sourceName: "Johnny",
        odds: { home: 1.48, draw: 4.35, away: 6.10 },
        timestamp: "2025-01-15T14:32:05Z",
        latency: 95
      },
      {
        sourceId: "apisports",
        sourceName: "Sam",
        odds: { home: 1.52, draw: 4.15, away: 5.75 },
        timestamp: "2025-01-15T14:31:50Z",
        latency: 450
      }
    ],
    spread: 0.18,
    spreadQuality: "high",
    bestSource: "Jack",
    value: 4.1
  },
  {
    id: "match-6",
    sport: "NBA",
    league: "NBA Regular Season",
    homeTeam: {
      name: "Lakers",
      shortName: "LAL",
      logo: "🏀"
    },
    awayTeam: {
      name: "Warriors",
      shortName: "GSW",
      logo: "🏀"
    },
    status: "live",
    startTime: new Date(new Date().setDate(new Date().getDate())).toISOString(),
    liveData: {
      homeScore: 98,
      awayScore: 102,
      time: "Q3 8:24",
      period: "3rd Quarter",
      lastUpdate: new Date().toISOString()
    },
    aggregatedOdds: {
      home: 1.90,
      away: 1.95
    },
    sources: [
      {
        sourceId: "sportradar",
        sourceName: "Jack",
        odds: { home: 1.92, away: 1.93 },
        timestamp: "2025-01-15T14:32:00Z",
        latency: 120
      },
      {
        sourceId: "sportsdataio",
        sourceName: "Johnny",
        odds: { home: 1.88, away: 1.97 },
        timestamp: "2025-01-15T14:32:05Z",
        latency: 95
      }
    ],
    spread: 0.05,
    spreadQuality: "low",
    bestSource: "Jack",
    value: 8.5
  },
  {
    id: "match-7",
    sport: "Tennis",
    league: "ATP Tour",
    homeTeam: {
      name: "Djokovic",
      shortName: "DJK",
      logo: "🎾"
    },
    awayTeam: {
      name: "Alcaraz",
      shortName: "ALC",
      logo: "🎾"
    },
    status: "scheduled",
    startTime: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
    aggregatedOdds: {
      home: 1.75,
      away: 2.10
    },
    sources: [
      {
        sourceId: "sportradar",
        sourceName: "Jack",
        odds: { home: 1.72, away: 2.15 },
        timestamp: "2025-01-15T14:32:00Z",
        latency: 120
      },
      {
        sourceId: "sportsdataio",
        sourceName: "Johnny",
        odds: { home: 1.78, away: 2.05 },
        timestamp: "2025-01-15T14:32:05Z",
        latency: 95
      }
    ],
    spread: 0.06,
    spreadQuality: "low",
    bestSource: "Johnny",
    value: 10.2
  },
  {
    id: "match-8",
    sport: "E-sports",
    league: "LEC Spring",
    homeTeam: {
      name: "G2 Esports",
      shortName: "G2",
      logo: "🎮"
    },
    awayTeam: {
      name: "Fnatic",
      shortName: "FNC",
      logo: "🎮"
    },
    status: "live",
    startTime: new Date(new Date().setDate(new Date().getDate())).toISOString(),
    liveData: {
      homeScore: 1,
      awayScore: 0,
      time: "Game 2",
      period: "Best of 3",
      lastUpdate: new Date().toISOString()
    },
    aggregatedOdds: {
      home: 1.65,
      away: 2.25
    },
    sources: [
      {
        sourceId: "sportradar",
        sourceName: "Jack",
        odds: { home: 1.62, away: 2.30 },
        timestamp: "2025-01-15T14:32:00Z",
        latency: 120
      },
      {
        sourceId: "sportsdataio",
        sourceName: "Johnny",
        odds: { home: 1.68, away: 2.20 },
        timestamp: "2025-01-15T14:32:05Z",
        latency: 95
      }
    ],
    spread: 0.06,
    spreadQuality: "low",
    bestSource: "Jack",
    value: 7.8
  }
];

export const mockAnomalies: Anomaly[] = [
  {
    id: "anomaly-1",
    sport: "Football",
    match: "Arsenal vs Chelsea",
    description: "Sam deviates +0.15 from aggregate",
    severity: "high",
    timestamp: "2025-01-15T14:30:00Z",
    sourceId: "apisports"
  },
  {
    id: "anomaly-2",
    sport: "Football",
    match: "Man City vs Liverpool",
    description: "Unusual spread variance detected",
    severity: "medium",
    timestamp: "2025-01-15T14:28:00Z"
  },
  {
    id: "anomaly-3",
    sport: "Football",
    match: "Bayern vs Dortmund",
    description: "Jack late update (45s delay)",
    severity: "low",
    timestamp: "2025-01-15T14:25:00Z",
    sourceId: "sportradar"
  }
];

export const mockValueSignals: ValueSignal[] = [
  {
    id: "signal-1",
    matchId: "match-1",
    match: "Arsenal vs Chelsea",
    avg: 2.15,
    best: 2.25,
    edge: 4.7,
    sources: 4,
    spread: "Low",
    confidence: 92
  },
  {
    id: "signal-2",
    matchId: "match-2",
    match: "Man City vs Liverpool",
    avg: 1.85,
    best: 1.92,
    edge: 3.8,
    sources: 3,
    spread: "Low",
    confidence: 88
  },
  {
    id: "signal-3",
    matchId: "match-3",
    match: "Barcelona vs Real Madrid",
    avg: 2.45,
    best: 2.58,
    edge: 5.3,
    sources: 4,
    spread: "Medium",
    confidence: 85
  },
  {
    id: "signal-4",
    matchId: "match-4",
    match: "Bayern vs Dortmund",
    avg: 1.75,
    best: 1.81,
    edge: 3.4,
    sources: 3,
    spread: "Low",
    confidence: 90
  },
  {
    id: "signal-5",
    matchId: "match-5",
    match: "PSG vs Marseille",
    avg: 1.55,
    best: 1.62,
    edge: 4.5,
    sources: 3,
    spread: "Medium",
    confidence: 82
  }
];
