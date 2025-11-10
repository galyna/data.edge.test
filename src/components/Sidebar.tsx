import { LayoutDashboard, TrendingUp, BarChart3, Target, Database, Settings, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";

interface SidebarProps {
  activeSection?: string;
}

const Sidebar = ({ activeSection = "dashboard" }: SidebarProps) => {
  const location = useLocation();
  
  const menuItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard", path: "/" },
    { id: "live-scores", icon: Activity, label: "Live Scores", path: "/live-scores" },
    { id: "markets", icon: TrendingUp, label: "Markets", path: "#" },
    { id: "analytics", icon: BarChart3, label: "Analytics", path: "#" },
    { id: "predictions", icon: Target, label: "Predictions", path: "#" },
    { id: "data", icon: Database, label: "Data Feed", path: "#" },
    { id: "settings", icon: Settings, label: "Settings", path: "#" },
  ];
  
  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname === path;
  };

  return (
    <aside className="w-20 bg-sidebar border-r border-sidebar-border flex flex-col items-center py-6 gap-6">
      {/* Logo */}
      <div className="w-12 h-12 bg-primary/10 border border-primary/30 rounded-lg flex items-center justify-center glow-primary">
        <div className="text-primary font-bold text-xl">DE</div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 flex flex-col gap-2 w-full px-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isItemActive = isActive(item.path);
          
          const content = (
            <>
              <Icon className="w-5 h-5" />
              
              {/* Tooltip */}
              <div className="absolute left-full ml-4 px-3 py-2 bg-popover border border-border rounded-lg text-sm whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
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
            <Link
              key={item.id}
              to={item.path}
              className={className}
              title={item.label}
            >
              {content}
            </Link>
          ) : (
            <button
              key={item.id}
              className={className}
              title={item.label}
            >
              {content}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
