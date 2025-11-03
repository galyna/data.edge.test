import { Search, Bell, User, Circle } from "lucide-react";

const leagues = [
  { name: "Football", active: true },
  { name: "NBA", active: false },
  { name: "MLB", active: false },
  { name: "NHL", active: false },
  { name: "Tennis", active: false },
];

const Header = () => {
  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-6">
      {/* Left: Logo */}
      <div className="flex items-center gap-6">
        <h1 className="text-base font-bold text-signal tracking-tight">DATA EDGE</h1>
        
        {/* Center: League Filters */}
        <div className="flex items-center gap-2">
          {leagues.map((league) => (
            <button
              key={league.name}
              className={`px-3 py-1 text-xs font-medium transition-all ${
                league.active
                  ? "bg-primary/20 text-primary border border-primary/50"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent"
              }`}
            >
              {league.name}
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
