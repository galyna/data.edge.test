#!/bin/bash

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3001"

echo "🧪 Testing Data Edge Backend API"
echo "================================"
echo ""

# Test 1: Health Check
echo -e "${YELLOW}Test 1: Health Check${NC}"
echo "GET $BASE_URL/health"
curl -s "$BASE_URL/health" | jq
echo ""
echo ""

# Test 2: Fetch All Sources
echo -e "${YELLOW}Test 2: Fetch All Sources${NC}"
echo "GET $BASE_URL/api/initial"
response=$(curl -s "$BASE_URL/api/initial")
echo "$response" | jq '.summary'
echo ""

# Count available sources
available=$(echo "$response" | jq '.summary.availableSources')
total=$(echo "$response" | jq '.summary.totalSources')
echo -e "Available sources: ${GREEN}$available${NC} / $total"
echo ""
echo ""

# Test 3: TheSportsDB
echo -e "${YELLOW}Test 3: TheSportsDB${NC}"
echo "GET $BASE_URL/api/initial/source/sportsdb"
sportsdb_response=$(curl -s "$BASE_URL/api/initial/source/sportsdb")
sportsdb_available=$(echo "$sportsdb_response" | jq -r '.source.available')
sportsdb_count=$(echo "$sportsdb_response" | jq -r '.source.eventsCount')

if [ "$sportsdb_available" = "true" ]; then
    echo -e "Status: ${GREEN}✅ Available${NC}"
    echo "Events count: $sportsdb_count"
    echo "$sportsdb_response" | jq '.source | {name, available, duration, eventsCount}'
else
    echo -e "Status: ${RED}❌ Not available${NC}"
    echo "$sportsdb_response" | jq '.source.error'
fi
echo ""
echo ""

# Test 4: API-Sports
echo -e "${YELLOW}Test 4: API-Sports${NC}"
echo "GET $BASE_URL/api/initial/source/apisports"
apisports_response=$(curl -s "$BASE_URL/api/initial/source/apisports")
apisports_available=$(echo "$apisports_response" | jq -r '.source.available')
apisports_count=$(echo "$apisports_response" | jq -r '.source.eventsCount')

if [ "$apisports_available" = "true" ]; then
    echo -e "Status: ${GREEN}✅ Available${NC}"
    echo "Events count: $apisports_count"
    echo "$apisports_response" | jq '.source | {name, available, duration, eventsCount, requestsRemaining}'
else
    echo -e "Status: ${RED}❌ Not available${NC}"
    echo "$apisports_response" | jq '.source.error'
fi
echo ""
echo ""

# Test 5: The Odds API
echo -e "${YELLOW}Test 5: The Odds API${NC}"
echo "GET $BASE_URL/api/initial/source/odds"
odds_response=$(curl -s "$BASE_URL/api/initial/source/odds")
odds_available=$(echo "$odds_response" | jq -r '.source.available')
odds_count=$(echo "$odds_response" | jq -r '.source.eventsCount')

if [ "$odds_available" = "true" ]; then
    echo -e "Status: ${GREEN}✅ Available${NC}"
    echo "Events count: $odds_count"
    echo "$odds_response" | jq '.source | {name, available, duration, eventsCount}'
else
    echo -e "Status: ${RED}❌ Not available${NC}"
    echo "$odds_response" | jq '.source.error'
fi
echo ""
echo ""

# Summary
echo "================================"
echo -e "${GREEN}✨ Testing Complete${NC}"
echo ""
echo "Summary:"
echo "  Total sources: $total"
echo "  Available: $available"
echo "  TheSportsDB: $([ "$sportsdb_available" = "true" ] && echo "✅" || echo "❌")"
echo "  API-Sports: $([ "$apisports_available" = "true" ] && echo "✅" || echo "❌")"
echo "  The Odds API: $([ "$odds_available" = "true" ] && echo "✅" || echo "❌")"
echo ""

