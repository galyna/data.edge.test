export interface EsportsMatch {
  id: string;
  teams: [string, string];
  game: string;
  tournament: string;
  status: "live" | "upcoming" | "finished";
  score?: [number, number];
  time: string;
  viewers?: number;
  odds?: {
    team1: number;
    team2: number;
  };
}

export const mockEsportsMatches: EsportsMatch[] = [
  {
    id: "1",
    teams: ["Team Liquid", "FaZe Clan"],
    game: "CS:GO",
    tournament: "IEM Katowice",
    status: "live",
    score: [13, 11],
    time: "Live",
    viewers: 125000,
    odds: { team1: 1.85, team2: 1.95 },
  },
  {
    id: "2",
    teams: ["T1", "Gen.G"],
    game: "League of Legends",
    tournament: "LCK Spring",
    status: "live",
    score: [1, 0],
    time: "Live",
    viewers: 89000,
    odds: { team1: 1.45, team2: 2.75 },
  },
  {
    id: "3",
    teams: ["OG", "Team Secret"],
    game: "Dota 2",
    tournament: "DPC WEU",
    status: "upcoming",
    time: "2 hours",
    viewers: 0,
    odds: { team1: 2.1, team2: 1.7 },
  },
  {
    id: "4",
    teams: ["100 Thieves", "Sentinels"],
    game: "Valorant",
    tournament: "VCT Americas",
    status: "upcoming",
    time: "4 hours",
    viewers: 0,
    odds: { team1: 2.25, team2: 1.62 },
  },
  {
    id: "5",
    teams: ["G2 Esports", "Fnatic"],
    game: "CS:GO",
    tournament: "ESL Pro League",
    status: "finished",
    score: [16, 14],
    time: "2 hours ago",
    viewers: 0,
  },
];

