"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Match } from "@/types/match";
import { CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { TeamLogo } from "./TeamLogo";

interface ScheduleCalendarProps {
  matches: Match[];
}

const ScheduleCalendar = ({ matches }: ScheduleCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedSport, setSelectedSport] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"calendar" | "list">("list");

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
        return (
          <Badge variant="destructive" className="animate-pulse text-[10px]">
            LIVE
          </Badge>
        );
      case "scheduled":
        return (
          <Badge variant="outline" className="text-[10px]">
            UPCOMING
          </Badge>
        );
      case "finished":
        return (
          <Badge variant="secondary" className="text-[10px]">
            FINISHED
          </Badge>
        );
    }
  };

  return (
    <div className="terminal-card p-3">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">
          MATCH SCHEDULE
        </h3>
        <div className="flex items-center gap-2">
          <Select value={selectedSport} onValueChange={setSelectedSport}>
            <SelectTrigger className="h-7 w-[120px] text-[10px]">
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
        <TabsList className="mb-2 h-7">
          <TabsTrigger value="calendar" className="px-2 text-[10px]">
            <CalendarIcon className="mr-1 h-3 w-3" />
            Cal
          </TabsTrigger>
          <TabsTrigger value="list" className="px-2 text-[10px]">
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
                <div className="max-h-[200px] space-y-1.5 overflow-y-auto">
                  <div className="mb-1 font-mono text-[10px] text-muted-foreground">
                    {getMatchesForDate(selectedDate).length} matches on{" "}
                    {format(selectedDate, "MMM dd")}
                  </div>
                  {getMatchesForDate(selectedDate).map((match) => (
                    <div
                      key={match.id}
                      className="cursor-pointer border border-border p-1.5 transition-colors hover:bg-muted/20"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex min-w-0 flex-1 items-center gap-2">
                          <TeamLogo
                            team={match.homeTeam}
                            sport={match.sport.toLowerCase()}
                            size="sm"
                          />
                          <div className="flex-1 truncate text-center text-[9px] font-medium">
                            {match.homeTeam.shortName} vs {match.awayTeam.shortName}
                          </div>
                          <TeamLogo
                            team={match.awayTeam}
                            sport={match.sport.toLowerCase()}
                            size="sm"
                          />
                        </div>
                        <div className="ml-2 flex items-center gap-1.5">
                          {getStatusBadge(match.status)}
                          <div className="flex items-center gap-0.5 font-mono text-[9px] text-muted-foreground">
                            <Clock className="h-2 w-2" />
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
          <div className="max-h-[400px] space-y-1 overflow-y-auto">
            {filteredMatches.length === 0 ? (
              <div className="py-4 text-center">
                <p className="text-[10px] text-muted-foreground">No matches found</p>
              </div>
            ) : (
              filteredMatches.map((match) => (
                <div
                  key={match.id}
                  className="cursor-pointer border border-border p-1.5 transition-colors hover:bg-muted/20"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <TeamLogo team={match.homeTeam} sport={match.sport.toLowerCase()} size="sm" />
                      <div className="flex-1 truncate text-center text-[9px] font-medium">
                        {match.homeTeam.shortName} vs {match.awayTeam.shortName}
                      </div>
                      <TeamLogo team={match.awayTeam} sport={match.sport.toLowerCase()} size="sm" />
                    </div>
                    <div className="ml-2 flex items-center gap-1.5">
                      {getStatusBadge(match.status)}
                      <div className="font-mono text-[9px] text-muted-foreground">
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
