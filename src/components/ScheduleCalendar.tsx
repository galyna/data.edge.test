"use client";

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
    <div className="terminal-card p-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">MATCH SCHEDULE</h3>
        <div className="flex gap-2 items-center">
          <Select value={selectedSport} onValueChange={setSelectedSport}>
            <SelectTrigger className="w-[120px] h-7 text-[10px]">
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
        <TabsList className="h-7 mb-2">
          <TabsTrigger value="calendar" className="text-[10px] px-2">
            <CalendarIcon className="w-3 h-3 mr-1" />
            Cal
          </TabsTrigger>
          <TabsTrigger value="list" className="text-[10px] px-2">
            List
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="calendar" className="mt-0">
          {viewMode === "calendar" ? (
            <div className="space-y-2">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="border border-border bg-card"
                modifiers={{
                  hasMatches: getDatesWithMatches(),
                }}
                modifiersClassNames={{
                  hasMatches: "bg-primary/20 border border-primary/50",
                }}
              />
              {selectedDate && (
                <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                  <div className="text-[10px] text-muted-foreground mb-1 font-mono">
                    {getMatchesForDate(selectedDate).length} matches on {format(selectedDate, "MMM dd")}
                  </div>
                  {getMatchesForDate(selectedDate).map((match) => (
                    <div
                      key={match.id}
                      className="p-1.5 border border-border hover:bg-muted/20 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                          <span className="text-xs">{match.homeTeam.logo}</span>
                          <div className="text-[9px] min-w-0">
                            <div className="font-medium truncate">{match.homeTeam.shortName} vs {match.awayTeam.shortName}</div>
                            <div className="text-muted-foreground truncate">{match.league}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {getStatusBadge(match.status)}
                          <div className="flex items-center gap-0.5 text-[9px] text-muted-foreground font-mono">
                            <Clock className="w-2 h-2" />
                            {format(new Date(match.startTime), "HH:mm")}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </TabsContent>

        <TabsContent value="list" className="mt-0">
          <div className="space-y-1 max-h-[400px] overflow-y-auto">
            {filteredMatches.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-[10px] text-muted-foreground">No matches found</p>
              </div>
            ) : (
              filteredMatches.map((match) => (
                <div
                  key={match.id}
                  className="p-1.5 border border-border hover:bg-muted/20 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <span className="text-sm">{match.homeTeam.logo}</span>
                      <div className="text-[9px] min-w-0">
                        <div className="font-medium truncate">{match.homeTeam.shortName} vs {match.awayTeam.shortName}</div>
                        <div className="text-muted-foreground truncate">{match.league}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {getStatusBadge(match.status)}
                      <div className="text-[9px] font-mono text-muted-foreground">
                        {format(new Date(match.startTime), "MMM dd, HH:mm")}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ScheduleCalendar;
