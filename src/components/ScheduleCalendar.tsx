import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Match } from "@/types/match";
import { CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";

interface ScheduleCalendarProps {
  matches: Match[];
}

const ScheduleCalendar = ({ matches }: ScheduleCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedSport, setSelectedSport] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");

  const sports = ["all", "Football", "NBA", "Tennis", "E-sports"];

  const getMatchesForDate = (date: Date) => {
    return matches.filter((match) => {
      const matchDate = new Date(match.startTime);
      return (
        matchDate.getDate() === date.getDate() &&
        matchDate.getMonth() === date.getMonth() &&
        matchDate.getFullYear() === date.getFullYear() &&
        (selectedSport === "all" || match.sport === selectedSport)
      );
    });
  };

  const getDatesWithMatches = () => {
    const dates = new Set<string>();
    matches.forEach((match) => {
      const date = new Date(match.startTime);
      dates.add(format(date, "yyyy-MM-dd"));
    });
    return Array.from(dates).map((d) => {
      const date = new Date(d);
      date.setHours(0, 0, 0, 0);
      return date;
    });
  };

  const filteredMatches = matches.filter((match) => {
    const sportMatch = selectedSport === "all" || match.sport === selectedSport;
    const dateMatch = selectedDate
      ? format(new Date(match.startTime), "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
      : true;
    return sportMatch && dateMatch;
  });

  const getStatusBadge = (status: Match["status"]) => {
    switch (status) {
      case "live":
        return <Badge variant="destructive" className="text-[10px] animate-pulse">LIVE</Badge>;
      case "scheduled":
        return <Badge variant="outline" className="text-[10px]">UPCOMING</Badge>;
      case "finished":
        return <Badge variant="secondary" className="text-[10px]">FINISHED</Badge>;
    }
  };

  return (
    <div className="terminal-card p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide">Match Schedule</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Upcoming and past matches
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedSport} onValueChange={setSelectedSport}>
            <SelectTrigger className="w-[150px] h-8 text-xs">
              <SelectValue placeholder="All Sports" />
            </SelectTrigger>
            <SelectContent>
              {sports.map((sport) => (
                <SelectItem key={sport} value={sport}>
                  {sport === "all" ? "All Sports" : sport}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "calendar" | "list")}>
        <TabsList className="mb-4">
          <TabsTrigger value="calendar" className="text-xs">
            <CalendarIcon className="w-3 h-3 mr-1.5" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="list" className="text-xs">
            List
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="mt-0">
          <div className="flex gap-4">
            <div className="flex-1">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border border-border bg-card"
                modifiers={{
                  hasMatches: getDatesWithMatches(),
                }}
                modifiersClassNames={{
                  hasMatches: "bg-primary/20 border border-primary/50 rounded-md",
                }}
              />
            </div>
            <div className="flex-1 space-y-2">
              {selectedDate ? (
                <>
                  <div className="text-xs text-muted-foreground mb-2">
                    {getMatchesForDate(selectedDate).length} matches on{" "}
                    {format(selectedDate, "MMM dd, yyyy")}
                  </div>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {getMatchesForDate(selectedDate).map((match) => (
                      <Card
                        key={match.id}
                        className="p-3 hover-lift cursor-pointer border-border"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{match.homeTeam.logo}</span>
                            <div className="text-xs">
                              <div className="font-medium">{match.homeTeam.name}</div>
                              <div className="text-muted-foreground">vs {match.awayTeam.name}</div>
                            </div>
                          </div>
                          {getStatusBadge(match.status)}
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{match.league}</span>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>
                              {format(new Date(match.startTime), "HH:mm")}
                            </span>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-sm text-muted-foreground text-center py-8">
                  Select a date to view matches
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="list" className="mt-0">
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {filteredMatches.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">No matches found</p>
              </div>
            ) : (
              filteredMatches.map((match) => (
                <Card
                  key={match.id}
                  className="p-3 hover-lift cursor-pointer border-border"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{match.homeTeam.logo}</span>
                        <div className="text-xs">
                          <div className="font-medium">{match.homeTeam.name}</div>
                          <div className="text-muted-foreground">vs {match.awayTeam.name}</div>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {match.league}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(match.status)}
                      <div className="text-xs font-mono text-muted-foreground">
                        {format(new Date(match.startTime), "MMM dd, HH:mm")}
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ScheduleCalendar;
