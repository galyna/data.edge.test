"use client";

import { memo } from "react";
import { Bell, User, Circle, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface SourceData {
  name: string;
  available: boolean;
  configured: boolean;
}

interface HeaderProps {
  sources?: SourceData[];
  lastUpdate?: string | null;
}

const Header = memo(({ sources = [], lastUpdate }: HeaderProps) => {
  const _pathname = usePathname();

  // Calculate available sources
  const availableSources = sources.filter(s => s.available).length;
  const totalSources = sources.length;

  // Calculate time since last update
  const getTimeSinceUpdate = () => {
    if (!lastUpdate) return "Never";
    const now = new Date().getTime();
    const updateTime = new Date(lastUpdate).getTime();
    const diffMs = now - updateTime;
    const diffSec = Math.floor(diffMs / 1000);
    
    if (diffSec < 60) return `${diffSec}s ago`;
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    return `${Math.floor(diffSec / 3600)}h ago`;
  };

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-6">
      {/* Left: Logo */}
      <div className="flex items-center gap-6">
        <Link href="/" className="transition-opacity hover:opacity-80">
          <h1 className="text-signal text-base font-bold tracking-tight">DATA EDGE</h1>
        </Link>
      </div>

      {/* Right: Status & Actions */}
      <div className="flex items-center gap-4">
        {/* Data Sources Status */}
        {totalSources > 0 && (
          <div className="flex items-center gap-2 border border-border bg-muted/30 px-3 py-1">
            <Circle 
              className={cn(
                "h-2 w-2",
                availableSources > 0 
                  ? "fill-primary text-primary" 
                  : "fill-muted-foreground text-muted-foreground"
              )} 
            />
            <span className="font-mono text-xs text-foreground">
              {availableSources}/{totalSources} Sources Live
            </span>
          </div>
        )}

        {/* Last Sync */}
        <div className="font-mono text-xs text-muted-foreground">
          Last sync: <span className={cn(
            lastUpdate ? "text-signal" : "text-muted-foreground"
          )}>
            {getTimeSinceUpdate()}
          </span>
        </div>

        <div className="h-4 w-px bg-border" />

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search markets..."
            className="w-48 border border-border bg-muted/50 py-1.5 pl-8 pr-3 text-xs transition-colors focus:border-primary focus:outline-none"
          />
        </div>

        {/* Action Buttons */}
        <button className="flex h-8 w-8 items-center justify-center border border-border bg-muted/50 transition-colors hover:bg-primary/20 hover:text-primary">
          <Bell className="h-3.5 w-3.5" />
        </button>
        <button className="flex h-8 w-8 items-center justify-center border border-border bg-muted/50 transition-colors hover:bg-primary/20 hover:text-primary">
          <User className="h-3.5 w-3.5" />
        </button>
      </div>
    </header>
  );
});

Header.displayName = "Header";

export default Header;
