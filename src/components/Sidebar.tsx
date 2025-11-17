"use client";

import { TrendingUp, BarChart3, Database, Activity, Gamepad2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Sidebar = () => {
  const pathname = usePathname();

  const menuItems = [
    { id: "dashboard", icon: Database, label: "Data Feeds", path: "/" },
    { id: "analysis", icon: BarChart3, label: "Analysis & Tips", path: "/analysis" },
    { id: "live-scores", icon: Activity, label: "Live Scores", path: "/live-scores" },
    { id: "esports", icon: Gamepad2, label: "E-sports", path: "/esports" },
    { id: "news", icon: TrendingUp, label: "News", path: "/news" },
    // { id: "analytics", icon: Target, label: "Analytics", path: "#" },
    // { id: "settings", icon: Settings, label: "Settings", path: "#" },
  ];

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname === path;
  };

  return (
    <aside className="flex w-20 flex-col items-center gap-6 border-r border-sidebar-border bg-sidebar py-6">
      {/* Logo */}
      <div className="glow-primary flex h-12 w-12 items-center justify-center rounded-lg border border-primary/30 bg-primary/10">
        <div className="text-xl font-bold text-primary">DE</div>
      </div>

      {/* Menu Items */}
      <nav className="flex w-full flex-1 flex-col gap-2 px-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isItemActive = isActive(item.path);

          const content = (
            <>
              <Icon className="h-5 w-5" />

              {/* Tooltip */}
              <div className="invisible absolute left-full z-50 ml-4 whitespace-nowrap rounded-lg border border-border bg-popover px-3 py-2 text-sm opacity-0 transition-all group-hover:visible group-hover:opacity-100">
                {item.label}
              </div>
            </>
          );

          const className = cn(
            "w-full h-14 flex items-center justify-center rounded-lg transition-all group relative",
            isItemActive
              ? "bg-primary/20 text-primary border border-primary/50 glow-primary"
              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border border-transparent"
          );

          return item.path !== "#" ? (
            <Link key={item.id} href={item.path} className={className} title={item.label}>
              {content}
            </Link>
          ) : (
            <button key={item.id} className={className} title={item.label}>
              {content}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
