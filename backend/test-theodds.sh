#!/bin/bash

# Test The Odds API Integration
# Usage: ./test-theodds.sh

echo "🧪 Testing The Odds API Integration"
echo "===================================="
echo ""

BACKEND_URL="http://localhost:3001"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Health Check
echo "1️⃣  Testing Backend Health..."
response=$(curl -s -w "\n%{http_code}" "$BACKEND_URL/health")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "200" ]; then
    echo -e "${GREEN}✅ Backend is running${NC}"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
else
    echo -e "${RED}❌ Backend is not responding (HTTP $http_code)${NC}"
    exit 1
fi

echo ""

# Test 2: Fetch Football Odds (Multiple Leagues)
echo "2️⃣  Testing Football Odds (EPL, La Liga, Serie A, Bundesliga, Ligue 1, UCL)..."
response=$(curl -s -w "\n%{http_code}" "$BACKEND_URL/api/initial?sport=football")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "200" ]; then
    echo -e "${GREEN}✅ Football data fetched${NC}"
    
    # Parse response
    available=$(echo "$body" | jq -r '.sources[0].available')
    configured=$(echo "$body" | jq -r '.sources[0].configured')
    events_count=$(echo "$body" | jq -r '.sources[0].eventsCount')
    leagues=$(echo "$body" | jq -r '.sources[0].leagues')
    error=$(echo "$body" | jq -r '.sources[0].error')
    
    echo "   Status: $available"
    echo "   Configured: $configured"
    echo "   Leagues: $leagues"
    echo "   Events: $events_count"
    
    if [ "$error" != "null" ] && [ "$error" != "" ]; then
        echo -e "   ${RED}Error: $error${NC}"
    fi
    
    # Show sample event
    if [ "$events_count" -gt "0" ]; then
        echo ""
        echo "   Sample Event:"
        echo "$body" | jq '.sources[0].events[0] | {id, sport, sportTitle, homeTeam, awayTeam, bookmakerCount, commenceTime}' 2>/dev/null
    fi
else
    echo -e "${RED}❌ Failed to fetch football data (HTTP $http_code)${NC}"
fi

echo ""

# Test 3: Fetch NBA Odds
echo "3️⃣  Testing NBA Odds..."
response=$(curl -s -w "\n%{http_code}" "$BACKEND_URL/api/initial?sport=nba")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "200" ]; then
    echo -e "${GREEN}✅ NBA data fetched${NC}"
    
    events_count=$(echo "$body" | jq -r '.sources[0].eventsCount')
    available=$(echo "$body" | jq -r '.sources[0].available')
    
    echo "   Available: $available"
    echo "   Events: $events_count"
else
    echo -e "${RED}❌ Failed to fetch NBA data (HTTP $http_code)${NC}"
fi

echo ""

# Test 4: Check API Configuration
echo "4️⃣  Checking API Configuration..."
if [ "$configured" = "true" ]; then
    echo -e "${GREEN}✅ The Odds API is properly configured${NC}"
elif [ "$configured" = "false" ]; then
    echo -e "${YELLOW}⚠️  The Odds API key is not configured${NC}"
    echo "   Please set THEODDS_API_KEY in your .env file"
    echo "   Get your API key from: https://the-odds-api.com/"
else
    echo -e "${RED}❌ Could not determine configuration status${NC}"
fi

echo ""
echo "===================================="
echo "✨ Test Complete!"
echo ""

# Show example markets
if [ "$events_count" -gt "0" ] && [ "$available" = "true" ]; then
    echo "📊 Sample Markets from First Event:"
    echo "$body" | jq '.sources[0].events[0].bookmakers[0].markets | map(.key)' 2>/dev/null
    echo ""
fi





