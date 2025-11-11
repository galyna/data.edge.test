export interface Team {
  name: string;
  shortName: string;
  logo: string;
}

export interface OddsSource {
  sourceId: string;
  sourceName: string;
  odds: {
    home: number;
    draw?: number;
    away: number;
  };
  timestamp: string;
  latency: number;
}

export interface Match {
  id: string;
  sport: string;
  league: string;
  homeTeam: Team;
  awayTeam: Team;
  status: "live" | "scheduled" | "finished";
  startTime: string;
  
  // Aggregated odds data
  aggregatedOdds: {
    home: number;
    draw?: number;
    away: number;
  };
  
  // Individual source data
  sources: OddsSource[];
  
  // Analytics
  spread: number;
  spreadQuality: "low" | "medium" | "high";
  bestSource: string;
  value: number;
  
  // Additional metadata
  liveData?: {
    homeScore: number;
    awayScore: number;
    time: string;
    period: string;
    lastUpdate: string;
  };
}

export interface DataSource {
  id: string;
  name: string;
  provider: string;
  status: "online" | "slow" | "offline";
  latency: number;
  lastUpdate: string;
  reliability: number; // 0-100
}

export interface Anomaly {
  id: string;
  sport: string;
  match: string;
  description: string;
  severity: "high" | "medium" | "low";
  timestamp: string;
  sourceId?: string;
}

export interface ValueSignal {
  id: string;
  matchId: string;
  match: string;
  avg: number;
  best: number;
  edge: number;
  sources: number;
  spread: "Low" | "Medium" | "High";
  confidence: number; // 0-100
}
