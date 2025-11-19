# Data Sources Mapping for Main Page Components

## Overview

This document maps each UI component on `app/page.tsx` to specific data sources, providing both **paid (recommended)** and **free (alternative)** options for each control.

---

## Quick Reference: Component Titles & Sources

| Component Code          | UI Title                | Paid Source                                        | Free Source                          |
| ----------------------- | ----------------------- | -------------------------------------------------- | ------------------------------------ |
| `UnifiedSportsFeed`     | **UNIFIED SPORTS FEED** | SportsDataIO ($400-1000/mo)                        | API-Sports (free tier) / TheSportsDB |
| `MultiSourceComparison` | **ANALYST COMPARISON**  | SportsDataIO + STATSCORE TipsterAPI ($700-1800/mo) | TheSportsDB + The Odds API           |
| `OddsAggregator`        | **ODDS**                | OddsJam / SportsDataIO ($50-400/mo)                | The Odds API (free tier)             |
| `ValueRadar`            | **VALUE SIGNALS**       | STATSCORE TipsterAPI ($300-800/mo)                 | DIY calculation                      |

**Note:** Component Code refers to the React component name, UI Title is what users see on screen.

---

## Components Breakdown

### 1. UnifiedSportsFeed Component → "UNIFIED SPORTS FEED"

**Location:** Left column, top section  
**UI Title:** `UNIFIED SPORTS FEED`  
**Purpose:** Display live sports matches, scores, schedules across multiple sports  
**Data Requirements:**

- Live scores and match status
- Team/player names and logos
- Match schedules (date, time)
- League/tournament information
- Sport type classification
- Real-time updates (every 5-10 seconds for live matches)

#### Paid Source (Recommended)

**SportsDataIO** — $300-1000+/month

**What you get:**

- Real-time scores for NBA, NFL, NHL, MLB, Soccer, Tennis
- Match schedules and results
- Team and player metadata
- Live updates via webhooks or polling
- Historical data (15+ years)
- High request limits (10,000+ req/day depending on plan)

**API Endpoints:**

```
GET /scores/live
GET /schedules/{sport}/{season}
GET /teams/{teamId}
GET /standings/{league}
```

**Update frequency:** Real-time (1-5 second latency)

**Alternative Paid Option:**

- **API-Sports** — $10-50/month (limited sports coverage but cost-effective)
- **Sportradar** — €€€€ (premium quality, enterprise pricing)

#### Free Source (Alternative)

**TheSportsDB** — Free (community-driven)

**What you get:**

- Schedules and past results
- Team logos and metadata
- Player information
- League standings
- Historical match data

**API Endpoints:**

```
GET /eventsday.php?d={date}&l={league}
GET /eventspastleague.php?id={leagueId}
GET /lookupteam.php?id={teamId}
GET /eventslast.php?id={teamId}
```

**Limitations:**

- ❌ No real-time live scores
- ❌ Updates can be delayed (community-maintained)
- ❌ Limited coverage for smaller leagues
- ❌ No webhooks (polling only)
- ⚠️ Request limits: ~100 req/hour on free tier

**Recommended Setup:**
Use **TheSportsDB** for historical data and metadata, supplement with **API-Sports free tier** for live scores (limited coverage).

---

### 2. MultiSourceComparison Component → "ANALYST COMPARISON"

**Location:** Left column, bottom section  
**UI Title:** `ANALYST COMPARISON`  
**Purpose:** Compare match data from multiple sources, display consensus and discrepancies  
**Data Requirements:**

- Match data from 2+ sources
- Odds/predictions from different providers
- Team statistics and form
- Head-to-head history
- Expert opinions/predictions
- Confidence scores

#### Paid Source (Recommended)

**SportsDataIO** (primary) + **STATSCORE TipsterAPI** (secondary)

**SportsDataIO:**

- Live match data and statistics
- Built-in BAKER predictions engine
- Win probabilities and recommended bets
- Game previews and recaps

**STATSCORE TipsterAPI:** — €200-800/month (estimated)

- Pre-game and live betting insights
- Mathematical model-based predictions
- 10+ sports, 100+ betting markets
- Millions of insights per year
- Contextual tips with reasoning

**API Endpoints:**

```
// SportsDataIO
GET /predictions/{sport}/{season}
GET /game/{gameId}/stats
GET /odds/{gameId}

// STATSCORE TipsterAPI
GET /tips/prematch/{matchId}
GET /tips/live/{matchId}
GET /insights/{sport}
```

**What you get:**

- Multiple data perspectives on the same match
- Algorithmic predictions vs. market odds
- Statistical analysis and trends
- Confidence levels for predictions

#### Free Source (Alternative)

**TheSportsDB** + **The Odds API** (free tier)

**TheSportsDB:**

- Historical match data
- Team statistics and form
- Head-to-head records

**The Odds API:** — Free tier (500 requests/month)

- Odds from multiple bookmakers
- Line movements
- Implied probabilities

**API Endpoints:**

```
// TheSportsDB
GET /eventslast.php?id={teamId}
GET /lookupevent.php?id={eventId}

// The Odds API
GET /v4/sports/{sport}/odds
GET /v4/sports/{sport}/events
```

**Limitations:**

- ❌ No algorithmic predictions
- ❌ Limited to basic odds comparison
- ❌ No expert commentary or insights
- ❌ Manual calculation needed for consensus
- ⚠️ 500 requests/month = ~16 req/day

**Workaround:**
Build your own simple prediction model using historical data from TheSportsDB + current odds from The Odds API to generate basic signals.

---

### 3. OddsAggregator Component → "ODDS"

**Location:** Right column, top section  
**UI Title:** `ODDS: [Team A] vs [Team B]`  
**Purpose:** Display and compare betting odds from multiple bookmakers  
**Data Requirements:**

- Real-time odds from multiple bookmakers
- Multiple bet types (moneyline, spread, totals, etc.)
- Line movements over time
- Best odds highlighting
- Arbitrage opportunities
- Opening vs. current lines

#### Paid Source (Recommended)

**SportsDataIO Odds Feed** OR **OddsJam** — $49-299/month

**What you get:**

- Odds from 50+ bookmakers
- Real-time updates (30-60 second refresh)
- Historical odds data
- Line movement tracking
- Multiple bet types and markets
- Implied probabilities calculated
- API and webhooks support

**API Endpoints:**

```
GET /odds/{sport}/markets
GET /odds/{matchId}/bookmakers
GET /odds/movements/{matchId}
GET /odds/arbitrage
```

**Bookmaker coverage:**

- DraftKings, FanDuel, BetMGM, Caesars
- Bet365, Pinnacle, Bovada
- 50+ international bookmakers

**Alternative Paid Option:**

- **Sportmonks Odds Feed** — Similar pricing and features

#### Free Source (Alternative)

**The Odds API** — Free tier (500 requests/month)

**What you get:**

- Odds from 15-20 bookmakers
- Multiple bet types (moneyline, spreads, totals)
- Recent odds data (up to 3 days history)
- JSON format, easy integration

**API Endpoints:**

```
GET /v4/sports/{sport}/odds
  ?apiKey={key}
  &regions=us,uk,eu
  &markets=h2h,spreads,totals
  &oddsFormat=decimal

GET /v4/sports/{sport}/events/{eventId}/odds
```

**Limitations:**

- ⚠️ 500 requests/month = ~16 per day
- ❌ Limited historical data
- ❌ No line movement tracking
- ❌ Basic bookmaker coverage
- ❌ No webhooks (polling only)
- ⚠️ 60-second minimum between requests

**Usage Strategy:**

- Cache odds data aggressively (update every 5-10 minutes)
- Focus on popular sports/leagues only
- Use for pre-match odds primarily (live odds consume too many requests)

---

### 4. ValueRadar Component → "VALUE SIGNALS"

**Location:** Right column, bottom section  
**UI Title:** `VALUE SIGNALS`  
**Purpose:** Display betting value signals, alerts, and recommendations  
**Data Requirements:**

- Algorithmic predictions with probabilities
- Market odds for comparison
- Value calculation (prediction vs. odds)
- Confidence scores
- Betting recommendations
- Historical performance tracking
- Risk indicators

#### Paid Source (Recommended)

**STATSCORE TipsterAPI** — €200-800/month (estimated)

**What you get:**

- Pre-match and live betting tips
- Mathematical model predictions
- Contextual insights and reasoning
- 10+ sports, 100+ markets
- Millions of insights annually
- Value bets identification
- Risk assessment
- Historical accuracy tracking

**API Endpoints:**

```
GET /tipster/predictions/{matchId}
GET /tipster/value-bets/{sport}
GET /tipster/signals/live
GET /tipster/performance/{modelId}
```

**Signal Types:**

- Win probability discrepancies
- Over/Under value bets
- Handicap opportunities
- Live betting signals
- Market inefficiencies

**Alternative Paid Option:**

- **SportsDataIO BAKER Engine** (included in SportsDataIO subscription)
- **Sportmonks Predictions Add-on**

#### Free Source (Alternative)

**DIY Calculation: The Odds API + TheSportsDB**

**Approach:**
Build a simple value detection system by:

1. **Get odds from The Odds API**
   - Extract implied probabilities
   - Calculate average odds across bookmakers
   - Identify outliers

2. **Get historical data from TheSportsDB**
   - Team form (last 5-10 games)
   - Head-to-head records
   - Home/away performance

3. **Calculate simple value signals**

   ```javascript
   // Pseudo-code
   const impliedProbability = 1 / odds;
   const estimatedProbability = calculateFromHistory(team, opponent);
   const valueScore = estimatedProbability - impliedProbability;

   if (valueScore > 0.1) {
     signal = "HIGH_VALUE_BET";
     confidence = valueScore * 100;
   }
   ```

4. **Display signals**
   - Value score (0-100%)
   - Confidence level
   - Historical win rate
   - Recommendation

**What you need to build:**

- Simple prediction model (can use basic statistics)
- Value calculation logic
- Signal categorization (high/medium/low value)
- Performance tracking

**Limitations:**

- ❌ No professional mathematical models
- ❌ Limited sports knowledge embedded
- ❌ Manual maintenance required
- ⚠️ Lower accuracy than paid services
- ⚠️ No live betting signals

**Free Tools to Help:**

- **Python + pandas** for data analysis
- **scikit-learn** for basic ML models (optional)
- **Redis/SQLite** for caching and historical data

---

## Recommended Integration Strategies

### Strategy A: Full Paid Stack (Production-Ready)

**Total Cost:** ~$500-1500/month

```
Component                    Source                   Cost/Month
─────────────────────────────────────────────────────────────────
UnifiedSportsFeed           SportsDataIO             $400-1000
MultiSourceComparison       SportsDataIO + TipsterAPI $400+300
OddsAggregator              SportsDataIO Odds        (included)
ValueRadar                  STATSCORE TipsterAPI     $300-800
─────────────────────────────────────────────────────────────────
TOTAL                                                $700-1500
```

**Optimization:** SportsDataIO alone covers 3 of 4 components. Add TipsterAPI only for advanced signals.

**Benefits:**

- ✅ Real-time updates
- ✅ High accuracy predictions
- ✅ Comprehensive coverage
- ✅ Enterprise reliability
- ✅ Webhook support
- ✅ High request limits

---

### Strategy B: Hybrid (Cost-Effective MVP)

**Total Cost:** ~$10-60/month

```
Component                    Source                   Cost/Month
─────────────────────────────────────────────────────────────────
UnifiedSportsFeed           API-Sports               $10-50
MultiSourceComparison       API-Sports + Odds API    $10 + free
OddsAggregator              The Odds API (free)      $0
ValueRadar                  DIY (Odds API + custom)  $0
─────────────────────────────────────────────────────────────────
TOTAL                                                $10-50
```

**Benefits:**

- ✅ Low cost for testing
- ✅ Real live scores
- ✅ Basic odds comparison
- ⚠️ Manual prediction logic needed
- ⚠️ Limited request quotas

---

### Strategy C: Fully Free (Proof of Concept)

**Total Cost:** $0/month

```
Component                    Source                   Cost/Month
─────────────────────────────────────────────────────────────────
UnifiedSportsFeed           TheSportsDB + API-Sports free $0
MultiSourceComparison       TheSportsDB + Odds API   $0
OddsAggregator              The Odds API (free)      $0
ValueRadar                  DIY calculations         $0
─────────────────────────────────────────────────────────────────
TOTAL                                                $0
```

**Limitations:**

- ❌ No real-time scores
- ❌ Limited request quotas (16-20 req/day total)
- ❌ Basic predictions only
- ❌ Manual development effort high
- ⚠️ Not suitable for production

**Use Case:** Demo, prototype, or personal project

---

## API Integration Priority

### Phase 1: Minimum Viable Product (Week 1-2)

**Focus:** Get something working on screen

1. **API-Sports** ($10/month) OR **TheSportsDB** (free)
   - Connect to `UnifiedSportsFeed`
   - Display basic match schedules
   - Show past results

2. **The Odds API** (free tier)
   - Connect to `OddsAggregator`
   - Display odds from 3-5 bookmakers
   - Calculate implied probabilities

3. **Mock Data**
   - Use for `MultiSourceComparison`
   - Use for `ValueRadar`
   - Replace incrementally

**Deliverable:** Working page with real scores and odds

---

### Phase 2: Add Intelligence (Week 3-4)

**Focus:** Enhance predictions and comparisons

1. **Build DIY Value Calculator**
   - Connect Odds API + historical data
   - Create simple prediction model
   - Display basic value signals in `ValueRadar`

2. **Add Second Data Source**
   - TheSportsDB for historical data
   - Feed into `MultiSourceComparison`
   - Enable source comparison

**Deliverable:** Working predictions and multi-source view

---

### Phase 3: Production Upgrade (Month 2+)

**Focus:** Scale and improve quality

1. **Upgrade to SportsDataIO**
   - Replace API-Sports/TheSportsDB
   - Get real-time updates
   - Access BAKER predictions

2. **Add STATSCORE TipsterAPI** (optional)
   - Professional value signals
   - Replace DIY calculator
   - Improve prediction accuracy

**Deliverable:** Production-ready platform

---

## API Request Budget Planning

### Free Tier Constraints

**The Odds API:** 500 requests/month

- 16 requests/day
- Strategy: Cache aggressively, update every 6-12 hours

**TheSportsDB:** ~100 requests/hour

- 2,400 requests/day
- Strategy: Cache metadata forever, scores for 5-10 minutes

**API-Sports Free Tier:** 100 requests/day

- Strategy: Focus on 1-2 sports only

### Request Optimization

**UnifiedSportsFeed:**

```
- Fetch schedules: 1x per day (morning)
- Fetch live scores: 1x per 2-5 minutes (only for live matches)
- Estimate: 50-200 requests/day
```

**MultiSourceComparison:**

```
- Fetch on match selection: 1x per match view
- Cache for 5 minutes
- Estimate: 100-500 requests/day
```

**OddsAggregator:**

```
- Fetch odds: 1x per 10-30 minutes (pre-match)
- Fetch odds: 1x per 2-5 minutes (live)
- Cache aggressively
- Estimate: 50-300 requests/day
```

**ValueRadar:**

```
- Calculate on-demand (no API calls if using DIY)
- Or fetch tips: 1x per match (if using TipsterAPI)
- Estimate: 0-100 requests/day
```

**Total Estimated:** 200-1,100 requests/day

**Free tier supports:** ~140 combined requests/day

- **Conclusion:** Free tier only works for limited demo/testing

---

## Code Integration Examples

### UnifiedSportsFeed + API-Sports

```typescript
// lib/api/apiSports.ts
export async function fetchLiveMatches(sport: string) {
  const response = await fetch(`https://api-sports.io/v1/${sport}/fixtures?live=all`, {
    headers: {
      "x-rapidapi-key": process.env.API_SPORTS_KEY!,
      "x-rapidapi-host": "api-sports.io",
    },
  });

  const data = await response.json();
  return data.response.map(transformToMatch);
}

function transformToMatch(fixture: any): Match {
  return {
    id: fixture.fixture.id,
    homeTeam: fixture.teams.home.name,
    awayTeam: fixture.teams.away.name,
    homeScore: fixture.goals.home,
    awayScore: fixture.goals.away,
    status: fixture.fixture.status.short,
    league: fixture.league.name,
    // ... more fields
  };
}
```

### OddsAggregator + The Odds API

```typescript
// lib/api/oddsApi.ts
export async function fetchMatchOdds(matchId: string) {
  const response = await fetch(
    `https://api.the-odds-api.com/v4/sports/soccer_epl/events/${matchId}/odds?` +
      `apiKey=${process.env.ODDS_API_KEY}&` +
      `regions=us,uk&` +
      `markets=h2h,spreads,totals`,
    { next: { revalidate: 300 } } // Cache 5 minutes
  );

  const data = await response.json();
  return transformOdds(data);
}
```

### ValueRadar + DIY Calculator

```typescript
// lib/calculations/valueSignals.ts
export function calculateValueSignals(
  match: Match,
  odds: Odds[],
  historicalData: HistoricalStats
): ValueSignal[] {
  const signals: ValueSignal[] = [];

  // Calculate implied probability from odds
  const avgHomeOdds = average(odds.map((o) => o.homeWin));
  const impliedHomeProb = 1 / avgHomeOdds;

  // Estimate actual probability from historical data
  const estimatedHomeProb = calculateWinProbability(
    historicalData.homeTeamForm,
    historicalData.awayTeamForm,
    historicalData.headToHead
  );

  // Find value
  const valueScore = estimatedHomeProb - impliedHomeProb;

  if (valueScore > 0.05) {
    signals.push({
      type: "HOME_WIN_VALUE",
      confidence: Math.min(valueScore * 100, 100),
      recommendation: "HOME_WIN",
      reasoning: `Model estimates ${(estimatedHomeProb * 100).toFixed(1)}% vs market ${(impliedHomeProb * 100).toFixed(1)}%`,
    });
  }

  return signals;
}
```

---

## Summary Table: Sources per Component

| Component               | UI Title                | Paid Source                           | Free Source                   | Data Type              | Update Freq           |
| ----------------------- | ----------------------- | ------------------------------------- | ----------------------------- | ---------------------- | --------------------- |
| `UnifiedSportsFeed`     | **UNIFIED SPORTS FEED** | SportsDataIO ($400-1000)              | API-Sports free / TheSportsDB | Live scores, schedules | Real-time / 5min      |
| `MultiSourceComparison` | **ANALYST COMPARISON**  | SportsDataIO + TipsterAPI ($700-1800) | TheSportsDB + Odds API        | Stats, predictions     | 1-5 min               |
| `OddsAggregator`        | **ODDS**                | OddsJam / SportsDataIO ($50-400)      | The Odds API free             | Bookmaker odds         | 30-60 sec / 5min      |
| `ValueRadar`            | **VALUE SIGNALS**       | STATSCORE TipsterAPI ($300-800)       | DIY (custom calc)             | Value signals          | Real-time / on-demand |

---

## Recommendations

### For Prototyping (Budget: $0-50/month)

✅ Start with **API-Sports** ($10/month) + **The Odds API** (free)  
✅ Build simple DIY value calculator  
✅ Use TheSportsDB for metadata  
⏱️ Timeline: 1-2 weeks to integrate

### For Production Launch (Budget: $500-1500/month)

✅ Use **SportsDataIO** as primary source  
✅ Add **STATSCORE TipsterAPI** for advanced signals  
✅ Optional: Add **OddsJam** for comprehensive odds  
⏱️ Timeline: 3-4 weeks to integrate and test

### For Enterprise (Budget: $2000+/month)

✅ Use **Sportradar** for maximum coverage and reliability  
✅ Add **STATSCORE TipsterAPI** for predictions  
✅ Add **PandaScore** for e-sports  
✅ Custom integrations with major bookmakers  
⏱️ Timeline: 2-3 months for full integration

---

**Document Version:** 1.0  
**Last Updated:** 2025-11-17  
**Target Page:** `app/page.tsx`
