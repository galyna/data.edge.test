import { Team } from "@/types/match";

export interface Prediction {
  id: string;
  match: string;
  league: string;
  sport: string;
  homeTeam: Team;
  awayTeam: Team;
  prediction: string;
  confidence: number;
  analyst: string;
  timestamp: string;
  roi: number;
  status: "pending" | "won" | "lost";
}

export const mockPredictions: Prediction[] = [
  {
    id: "1",
    match: "Manchester City vs Arsenal",
    league: "Premier League",
    sport: "Football",
    homeTeam: {
      name: "Manchester City",
      shortName: "MCI",
      logo: "⚽",
    },
    awayTeam: {
      name: "Arsenal",
      shortName: "ARS",
      logo: "⚽",
    },
    prediction: "Manchester City Win",
    confidence: 87,
    analyst: "Alex Thompson",
    timestamp: "2 hours ago",
    roi: 15.4,
    status: "pending",
  },
  {
    id: "2",
    match: "Lakers vs Warriors",
    league: "NBA",
    sport: "Basketball",
    homeTeam: {
      name: "Los Angeles Lakers",
      shortName: "LAL",
      logo: "🏀",
    },
    awayTeam: {
      name: "Golden State Warriors",
      shortName: "GSW",
      logo: "🏀",
    },
    prediction: "Over 225.5 Points",
    confidence: 92,
    analyst: "Sarah Mitchell",
    timestamp: "4 hours ago",
    roi: 22.1,
    status: "won",
  },
  {
    id: "3",
    match: "Real Madrid vs Barcelona",
    league: "La Liga",
    sport: "Football",
    homeTeam: {
      name: "Real Madrid",
      shortName: "RMA",
      logo: "⚽",
    },
    awayTeam: {
      name: "Barcelona",
      shortName: "BAR",
      logo: "⚽",
    },
    prediction: "BTTS Yes",
    confidence: 78,
    analyst: "James Rodriguez",
    timestamp: "5 hours ago",
    roi: 18.7,
    status: "pending",
  },
  {
    id: "4",
    match: "Djokovic vs Alcaraz",
    league: "ATP Finals",
    sport: "Tennis",
    homeTeam: {
      name: "Novak Djokovic",
      shortName: "DJK",
      logo: "🎾",
    },
    awayTeam: {
      name: "Carlos Alcaraz",
      shortName: "ALC",
      logo: "🎾",
    },
    prediction: "Alcaraz Win",
    confidence: 65,
    analyst: "Emma Wilson",
    timestamp: "1 day ago",
    roi: -5.2,
    status: "lost",
  },
];

