/**
 * Utility functions for getting team logo URLs
 * Uses free CDN services for team logos
 */

export interface TeamLogoConfig {
  name: string;
  sport?: "football" | "basketball" | "tennis" | "esports";
}

/**
 * Normalizes team name for URL generation
 */
const _normalizeTeamName = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

/**
 * Team name mappings for better logo matching
 */
const teamNameMappings: Record<string, string> = {
  arsenal: "arsenal-fc",
  chelsea: "chelsea-fc",
  "man city": "manchester-city-fc",
  liverpool: "liverpool-fc",
  barcelona: "fc-barcelona",
  "real madrid": "real-madrid-cf",
  "bayern munich": "fc-bayern-munich",
  "borussia dortmund": "borussia-dortmund",
  psg: "paris-saint-germain-psg",
  marseille: "olympique-de-marseille",
  lakers: "los-angeles-lakers",
  warriors: "golden-state-warriors",
  djokovic: "novak-djokovic",
  alcaraz: "carlos-alcaraz",
  "g2 esports": "g2-esports",
  fnatic: "fnatic",
};

/**
 * Gets team logo URL - using multiple CDN fallbacks
 */
export const getTeamLogoUrl = (teamName: string, sport: string = "football"): string => {
  // Check for mapped name first
  const _mappedName = teamNameMappings[teamName.toLowerCase()];

  // Map sports to team IDs for different sports
  const teamIds: Record<string, number> = {
    // Premier League
    arsenal: 42,
    chelsea: 49,
    "man city": 50,
    "manchester city": 50,
    liverpool: 40,
    // La Liga
    barcelona: 529,
    "real madrid": 541,
    // Bundesliga
    "bayern munich": 157,
    "borussia dortmund": 165,
    // Ligue 1
    psg: 85,
    "paris saint-germain": 85,
    marseille: 81,
    // NBA
    lakers: 145,
    "los angeles lakers": 145,
    warriors: 137,
    "golden state warriors": 137,
  };

  const teamId = teamIds[teamName.toLowerCase()];

  if (teamId && sport.toLowerCase() === "football") {
    // Use API-Football CDN (более надежный для футбола)
    return `https://media.api-sports.io/football/teams/${teamId}.png`;
  }

  // Fallback: use placeholder service with team initial
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(teamName)}&background=random&color=fff&size=128`;
};

/**
 * Alternative: Get placeholder avatar if real logo fails
 */
export const getPlaceholderLogo = (teamName: string): string => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(teamName)}&background=random&color=fff&size=128&bold=true`;
};

/**
 * Gets logo URL with fallback options
 */
export const getTeamLogo = (team: { name: string }, sport: string = "football"): string => {
  // Try primary CDN
  const primaryUrl = getTeamLogoUrl(team.name, sport);
  return primaryUrl;
};
