// Team Logo Utilities
// Maps team names to CDN URLs for logos

const LOGO_BASE_URL = "https://a.espncdn.com/i/teamlogos";

// Mapping for EPL Teams (Soccer)
const EPL_LOGOS: Record<string, string> = {
  "Arsenal": "soccer/500/359.png",
  "Aston Villa": "soccer/500/362.png",
  "Bournemouth": "soccer/500/349.png",
  "Brentford": "soccer/500/337.png",
  "Brighton": "soccer/500/331.png",
  "Chelsea": "soccer/500/363.png",
  "Crystal Palace": "soccer/500/384.png",
  "Everton": "soccer/500/368.png",
  "Fulham": "soccer/500/370.png",
  "Liverpool": "soccer/500/364.png",
  "Luton": "soccer/500/372.png", // Relegated, but keep for history
  "Man City": "soccer/500/382.png",
  "Manchester City": "soccer/500/382.png",
  "Man United": "soccer/500/360.png",
  "Manchester United": "soccer/500/360.png",
  "Newcastle": "soccer/500/361.png",
  "Nottm Forest": "soccer/500/393.png",
  "Nottingham Forest": "soccer/500/393.png",
  "Sheffield Utd": "soccer/500/398.png",
  "Tottenham": "soccer/500/367.png",
  "West Ham": "soccer/500/371.png",
  "Wolves": "soccer/500/380.png",
  "Wolverhampton Wanderers": "soccer/500/380.png",
  "Leicester": "soccer/500/375.png",
  "Southampton": "soccer/500/376.png",
  "Ipswich": "soccer/500/373.png",
  "Ipswich Town": "soccer/500/373.png",
};

// Mapping for NBA Teams
const NBA_LOGOS: Record<string, string> = {
  "Atlanta Hawks": "nba/500/atl.png",
  "Boston Celtics": "nba/500/bos.png",
  "Brooklyn Nets": "nba/500/bkn.png",
  "Charlotte Hornets": "nba/500/cha.png",
  "Chicago Bulls": "nba/500/chi.png",
  "Cleveland Cavaliers": "nba/500/cle.png",
  "Dallas Mavericks": "nba/500/dal.png",
  "Denver Nuggets": "nba/500/den.png",
  "Detroit Pistons": "nba/500/det.png",
  "Golden State Warriors": "nba/500/gs.png",
  "Houston Rockets": "nba/500/hou.png",
  "Indiana Pacers": "nba/500/ind.png",
  "LA Clippers": "nba/500/lac.png",
  "Los Angeles Clippers": "nba/500/lac.png",
  "LA Lakers": "nba/500/lal.png",
  "Los Angeles Lakers": "nba/500/lal.png",
  "Memphis Grizzlies": "nba/500/mem.png",
  "Miami Heat": "nba/500/mia.png",
  "Milwaukee Bucks": "nba/500/mil.png",
  "Minnesota Timberwolves": "nba/500/min.png",
  "New Orleans Pelicans": "nba/500/no.png",
  "New York Knicks": "nba/500/ny.png",
  "Oklahoma City Thunder": "nba/500/okc.png",
  "Orlando Magic": "nba/500/orl.png",
  "Philadelphia 76ers": "nba/500/phi.png",
  "Phoenix Suns": "nba/500/phx.png",
  "Portland Trail Blazers": "nba/500/por.png",
  "Sacramento Kings": "nba/500/sac.png",
  "San Antonio Spurs": "nba/500/sa.png",
  "Toronto Raptors": "nba/500/tor.png",
  "Utah Jazz": "nba/500/utah.png",
  "Washington Wizards": "nba/500/wsh.png",
};

// Mapping for NFL Teams
const NFL_LOGOS: Record<string, string> = {
  "Arizona Cardinals": "nfl/500/ari.png",
  "Atlanta Falcons": "nfl/500/atl.png",
  "Baltimore Ravens": "nfl/500/bal.png",
  "Buffalo Bills": "nfl/500/buf.png",
  "Carolina Panthers": "nfl/500/car.png",
  "Chicago Bears": "nfl/500/chi.png",
  "Cincinnati Bengals": "nfl/500/cin.png",
  "Cleveland Browns": "nfl/500/cle.png",
  "Dallas Cowboys": "nfl/500/dal.png",
  "Denver Broncos": "nfl/500/den.png",
  "Detroit Lions": "nfl/500/det.png",
  "Green Bay Packers": "nfl/500/gb.png",
  "Houston Texans": "nfl/500/hou.png",
  "Indianapolis Colts": "nfl/500/ind.png",
  "Jacksonville Jaguars": "nfl/500/jax.png",
  "Kansas City Chiefs": "nfl/500/kc.png",
  "Las Vegas Raiders": "nfl/500/lv.png",
  "Los Angeles Chargers": "nfl/500/lac.png",
  "Los Angeles Rams": "nfl/500/lar.png",
  "Miami Dolphins": "nfl/500/mia.png",
  "Minnesota Vikings": "nfl/500/min.png",
  "New England Patriots": "nfl/500/ne.png",
  "New Orleans Saints": "nfl/500/no.png",
  "New York Giants": "nfl/500/nyg.png",
  "New York Jets": "nfl/500/nyj.png",
  "Philadelphia Eagles": "nfl/500/phi.png",
  "Pittsburgh Steelers": "nfl/500/pit.png",
  "San Francisco 49ers": "nfl/500/sf.png",
  "Seattle Seahawks": "nfl/500/sea.png",
  "Tampa Bay Buccaneers": "nfl/500/tb.png",
  "Tennessee Titans": "nfl/500/ten.png",
  "Washington Commanders": "nfl/500/wsh.png",
};

/**
 * Get team logo URL
 * @param teamName - Name of the team
 * @param sport - Sport ID (soccer, basketball, etc.)
 */
export function getTeamLogo(teamName: string, sport: string = "soccer"): string | null {
  if (!teamName) return null;

  const normalizedName = teamName.trim();
  let path: string | undefined;

  if (sport.includes("soccer") || sport.includes("football")) {
    path = EPL_LOGOS[normalizedName];
    // Try fuzzy match for EPL
    if (!path) {
      const key = Object.keys(EPL_LOGOS).find(k => 
        normalizedName.includes(k) || k.includes(normalizedName)
      );
      if (key) path = EPL_LOGOS[key];
    }
  }
  
  if (sport.includes("basketball") || sport.includes("nba")) {
    path = NBA_LOGOS[normalizedName];
    // Try fuzzy match for NBA
    if (!path) {
      const key = Object.keys(NBA_LOGOS).find(k => 
        normalizedName.includes(k) || k.includes(normalizedName)
      );
      if (key) path = NBA_LOGOS[key];
    }
  }

  if (sport.includes("american") || sport.includes("nfl")) {
    path = NFL_LOGOS[normalizedName];
     // Try fuzzy match for NFL
     if (!path) {
      const key = Object.keys(NFL_LOGOS).find(k => 
        normalizedName.includes(k) || k.includes(normalizedName)
      );
      if (key) path = NFL_LOGOS[key];
    }
  }

  if (path) {
    return `${LOGO_BASE_URL}/${path}`;
  }

  // Generic fallback logic could go here if needed
  // For now return null to let the component handle fallback (initials)
  return null;
}
