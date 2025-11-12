"use client";

import { Bell, User, Circle, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface HeaderProps {
  selectedSport: string;
  onSportChange: (sport: string) => void;
}

const sports = [
  { id: "football", name: "Football", icon: "⚽" },
  { id: "nba", name: "NBA", icon: "🏀" },
  { id: "mlb", name: "MLB", icon: "⚾" },
  { id: "nhl", name: "NHL", icon: "🏒" },
  { id: "tennis", name: "Tennis", icon: "🎾" },
  { id: "esports", name: "E-sports", icon: "🎮" },
];

const Header = ({ selectedSport, onSportChange }: HeaderProps) => {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;
  
  const getLinkClass = (path: string) => {
    return `px-3 py-1 text-xs font-medium uppercase tracking-wider transition-all ${
      isActive(path)
        ? "bg-primary/20 text-primary border border-primary/50"
        : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent"
    }`;
  };

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-6">
      {/* Left: Logo + Navigation */}
      <div className="flex items-center gap-6">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <h1 className="text-base font-bold text-signal tracking-tight">DATA EDGE</h1>
        </Link>
        
        
        {/* League Filters */}
        <div className="flex items-center gap-1 ml-4">
          {sports.map((sport) => (
            <button
              key={sport.id}
              onClick={() => onSportChange(sport.id)}
              className={cn(
                "px-2 py-1 text-xs font-medium uppercase tracking-wider transition-all",
                selectedSport === sport.id
                  ? "bg-primary/20 text-primary border border-primary/50"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent"
              )}
            >
              {sport.name}
            </button>
          ))}
        </div>
      </div>

      {/* Right: Status & Actions */}
      <div className="flex items-center gap-4">
        {/* Data Sources Status */}
        <div className="flex items-center gap-2 px-3 py-1 bg-muted/30 border border-border">
          <Circle className="w-2 h-2 fill-primary text-primary" />
          <span className="text-xs font-mono text-foreground">3/5 Sources Live</span>
        </div>

        {/* Last Sync */}
        <div className="text-xs font-mono text-muted-foreground">
          Last sync: <span className="text-signal">5s ago</span>
        </div>

        <div className="h-4 w-px bg-border" />

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search markets..."
            className="pl-8 pr-3 py-1.5 bg-muted/50 border border-border text-xs focus:outline-none focus:border-primary transition-colors w-48"
          />
        </div>

        {/* Action Buttons */}
        <button className="w-8 h-8 bg-muted/50 hover:bg-primary/20 hover:text-primary transition-colors flex items-center justify-center border border-border">
          <Bell className="w-3.5 h-3.5" />
        </button>
        <button className="w-8 h-8 bg-muted/50 hover:bg-primary/20 hover:text-primary transition-colors flex items-center justify-center border border-border">
          <User className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};

export default Header;
